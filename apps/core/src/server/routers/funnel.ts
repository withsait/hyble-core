import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";

/**
 * Funnel & Cart Tracking Router
 * Analytics for conversion funnel and cart abandonment
 */

// Event types
const FunnelEventType = z.enum([
  "page_view",
  "product_view",
  "add_to_cart",
  "remove_from_cart",
  "begin_checkout",
  "add_payment_info",
  "add_shipping_info",
  "purchase",
  "refund",
  "signup",
  "login",
]);

// Schemas
const trackEventSchema = z.object({
  eventType: FunnelEventType,
  sessionId: z.string(),
  userId: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  productPrice: z.number().optional(),
  quantity: z.number().optional(),
  cartId: z.string().optional(),
  cartTotal: z.number().optional(),
  orderId: z.string().optional(),
  orderTotal: z.number().optional(),
  currency: z.string().default("TRY"),
  metadata: z.record(z.any()).optional(),
});

const cartAbandonmentSchema = z.object({
  cartId: z.string(),
  userId: z.string().optional(),
  email: z.string().optional(),
  cartTotal: z.number(),
  itemCount: z.number(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    imageUrl: z.string().optional(),
  })),
  abandonedAt: z.date().optional(),
  lastActivityAt: z.date().optional(),
});

export const funnelRouter = router({
  // Track funnel event
  trackEvent: protectedProcedure
    .input(trackEventSchema)
    .mutation(async ({ ctx, input }) => {
      const event = await prisma.funnelEvent.create({
        data: {
          eventType: input.eventType,
          sessionId: input.sessionId,
          userId: ctx.session?.user?.id || input.userId,
          pageUrl: input.pageUrl,
          referrer: input.referrer,
          productId: input.productId,
          productName: input.productName,
          productPrice: input.productPrice,
          quantity: input.quantity,
          cartId: input.cartId,
          cartTotal: input.cartTotal,
          orderId: input.orderId,
          orderTotal: input.orderTotal,
          currency: input.currency,
          metadata: input.metadata || {},
          userAgent: ctx.headers?.get("user-agent") || null,
          ipAddress: ctx.headers?.get("x-forwarded-for")?.split(",")[0] || null,
        },
      });

      return event;
    }),

  // Track anonymous event (for non-logged in users)
  trackAnonymousEvent: protectedProcedure
    .input(trackEventSchema)
    .mutation(async ({ ctx, input }) => {
      const event = await prisma.funnelEvent.create({
        data: {
          eventType: input.eventType,
          sessionId: input.sessionId,
          userId: input.userId,
          pageUrl: input.pageUrl,
          referrer: input.referrer,
          productId: input.productId,
          productName: input.productName,
          productPrice: input.productPrice,
          quantity: input.quantity,
          cartId: input.cartId,
          cartTotal: input.cartTotal,
          orderId: input.orderId,
          orderTotal: input.orderTotal,
          currency: input.currency,
          metadata: input.metadata || {},
          userAgent: ctx.headers?.get("user-agent") || null,
          ipAddress: ctx.headers?.get("x-forwarded-for")?.split(",")[0] || null,
        },
      });

      return event;
    }),

  // Record cart abandonment
  recordAbandonment: protectedProcedure
    .input(cartAbandonmentSchema)
    .mutation(async ({ ctx, input }) => {
      const abandonment = await prisma.cartAbandonment.upsert({
        where: { cartId: input.cartId },
        create: {
          cartId: input.cartId,
          userId: ctx.session?.user?.id || input.userId,
          email: input.email,
          cartTotal: input.cartTotal,
          itemCount: input.itemCount,
          items: input.items,
          abandonedAt: input.abandonedAt || new Date(),
          lastActivityAt: input.lastActivityAt || new Date(),
          status: "ABANDONED",
        },
        update: {
          cartTotal: input.cartTotal,
          itemCount: input.itemCount,
          items: input.items,
          lastActivityAt: new Date(),
        },
      });

      return abandonment;
    }),

  // Get funnel analytics (admin)
  getFunnelAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      groupBy: z.enum(["day", "week", "month"]).default("day"),
    }))
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      // Get event counts by type
      const eventCounts = await prisma.funnelEvent.groupBy({
        by: ["eventType"],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      // Calculate conversion rates
      const pageViews = eventCounts.find(e => e.eventType === "page_view")?._count || 0;
      const productViews = eventCounts.find(e => e.eventType === "product_view")?._count || 0;
      const addToCarts = eventCounts.find(e => e.eventType === "add_to_cart")?._count || 0;
      const beginCheckouts = eventCounts.find(e => e.eventType === "begin_checkout")?._count || 0;
      const purchases = eventCounts.find(e => e.eventType === "purchase")?._count || 0;

      // Get daily/weekly/monthly trends
      const trends = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          event_type,
          COUNT(*) as count
        FROM funnel_events
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY DATE(created_at), event_type
        ORDER BY date ASC
      `;

      // Get revenue data
      const revenue = await prisma.funnelEvent.aggregate({
        where: {
          eventType: "purchase",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          orderTotal: true,
        },
        _count: true,
      });

      return {
        funnel: {
          pageViews,
          productViews,
          addToCarts,
          beginCheckouts,
          purchases,
        },
        conversionRates: {
          viewToCart: productViews > 0 ? (addToCarts / productViews) * 100 : 0,
          cartToCheckout: addToCarts > 0 ? (beginCheckouts / addToCarts) * 100 : 0,
          checkoutToPurchase: beginCheckouts > 0 ? (purchases / beginCheckouts) * 100 : 0,
          overall: pageViews > 0 ? (purchases / pageViews) * 100 : 0,
        },
        revenue: {
          total: revenue._sum.orderTotal || 0,
          orderCount: revenue._count,
          averageOrderValue: revenue._count > 0 ? (revenue._sum.orderTotal || 0) / revenue._count : 0,
        },
        trends,
      };
    }),

  // Get cart abandonment analytics
  getAbandonmentAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      const [
        totalAbandoned,
        recoveredCarts,
        totalValue,
        averageCartValue,
        byDay,
      ] = await Promise.all([
        prisma.cartAbandonment.count({
          where: {
            abandonedAt: { gte: startDate, lte: endDate },
            status: "ABANDONED",
          },
        }),
        prisma.cartAbandonment.count({
          where: {
            abandonedAt: { gte: startDate, lte: endDate },
            status: "RECOVERED",
          },
        }),
        prisma.cartAbandonment.aggregate({
          where: {
            abandonedAt: { gte: startDate, lte: endDate },
            status: "ABANDONED",
          },
          _sum: { cartTotal: true },
        }),
        prisma.cartAbandonment.aggregate({
          where: {
            abandonedAt: { gte: startDate, lte: endDate },
          },
          _avg: { cartTotal: true },
        }),
        prisma.$queryRaw`
          SELECT
            DATE(abandoned_at) as date,
            COUNT(*) as count,
            SUM(cart_total) as total
          FROM cart_abandonments
          WHERE abandoned_at >= ${startDate} AND abandoned_at <= ${endDate}
          GROUP BY DATE(abandoned_at)
          ORDER BY date ASC
        `,
      ]);

      return {
        totalAbandoned,
        recoveredCarts,
        recoveryRate: totalAbandoned > 0 ? (recoveredCarts / totalAbandoned) * 100 : 0,
        totalLostValue: totalValue._sum.cartTotal || 0,
        averageCartValue: averageCartValue._avg.cartTotal || 0,
        byDay,
      };
    }),

  // Get abandoned carts list
  listAbandonedCarts: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["ABANDONED", "RECOVERED", "EXPIRED"]).optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.minValue || input.maxValue) {
        where.cartTotal = {};
        if (input.minValue) where.cartTotal.gte = input.minValue;
        if (input.maxValue) where.cartTotal.lte = input.maxValue;
      }

      const [carts, total] = await Promise.all([
        prisma.cartAbandonment.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { abandonedAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.cartAbandonment.count({ where }),
      ]);

      return {
        carts,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Mark cart as recovered
  markRecovered: adminProcedure
    .input(z.object({
      cartId: z.string(),
      orderId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.cartAbandonment.update({
        where: { cartId: input.cartId },
        data: {
          status: "RECOVERED",
          recoveredAt: new Date(),
          metadata: {
            orderId: input.orderId,
          },
        },
      });
    }),

  // Send recovery email
  sendRecoveryEmail: adminProcedure
    .input(z.object({
      cartId: z.string(),
      templateId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const cart = await prisma.cartAbandonment.findUnique({
        where: { cartId: input.cartId },
        include: {
          user: { select: { email: true, name: true } },
        },
      });

      if (!cart) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Increment email count
      await prisma.cartAbandonment.update({
        where: { cartId: input.cartId },
        data: {
          emailsSent: { increment: 1 },
          lastEmailSentAt: new Date(),
        },
      });

      // TODO: Integrate with email service to send recovery email
      // This would use the email router/service

      return { success: true, email: cart.email || cart.user?.email };
    }),

  // Get session journey
  getSessionJourney: adminProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const events = await prisma.funnelEvent.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });

      return {
        sessionId: input.sessionId,
        events,
        eventCount: events.length,
        startTime: events[0]?.createdAt,
        endTime: events[events.length - 1]?.createdAt,
        converted: events.some(e => e.eventType === "purchase"),
      };
    }),

  // Get top products by funnel stage
  getTopProductsByStage: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      stage: FunnelEventType,
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const products = await prisma.funnelEvent.groupBy({
        by: ["productId", "productName"],
        where: {
          eventType: input.stage,
          productId: { not: null },
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        _count: true,
        _sum: {
          quantity: true,
          productPrice: true,
        },
        orderBy: {
          _count: {
            productId: "desc",
          },
        },
        take: input.limit,
      });

      return products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        count: p._count,
        totalQuantity: p._sum.quantity || 0,
        totalValue: p._sum.productPrice || 0,
      }));
    }),

  // Get drop-off analysis
  getDropOffAnalysis: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      // Get unique sessions at each stage
      const stages = ["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase"];

      const stageData = await Promise.all(
        stages.map(async (stage) => {
          const count = await prisma.funnelEvent.groupBy({
            by: ["sessionId"],
            where: {
              eventType: stage,
              createdAt: { gte: startDate, lte: endDate },
            },
          });
          return { stage, uniqueSessions: count.length };
        })
      );

      // Calculate drop-off between stages
      const dropOffs = stageData.map((current, index) => {
        if (index === 0) {
          return { ...current, dropOff: 0, dropOffRate: 0 };
        }
        const previous = stageData[index - 1];
        const dropOff = previous.uniqueSessions - current.uniqueSessions;
        const dropOffRate = previous.uniqueSessions > 0
          ? (dropOff / previous.uniqueSessions) * 100
          : 0;
        return { ...current, dropOff, dropOffRate };
      });

      return dropOffs;
    }),
});

export type FunnelRouter = typeof funnelRouter;

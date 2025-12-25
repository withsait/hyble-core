// Order Management tRPC Router
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, type OrderStatus } from "@hyble/db";

const OrderStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]);

// Shipping carrier configurations
const SHIPPING_CARRIERS = {
  yurtici: { name: "Yurtiçi Kargo", trackingUrl: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=" },
  aras: { name: "Aras Kargo", trackingUrl: "https://araskargo.com.tr/trmol/gonderitakip.aspx?q=" },
  mng: { name: "MNG Kargo", trackingUrl: "https://www.mngkargo.com.tr/takip/?track=" },
  ptt: { name: "PTT Kargo", trackingUrl: "https://gonderitakip.ptt.gov.tr/?q=" },
  ups: { name: "UPS", trackingUrl: "https://www.ups.com/track?loc=tr_TR&tracknum=" },
  dhl: { name: "DHL", trackingUrl: "https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=" },
  fedex: { name: "FedEx", trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=" },
  other: { name: "Diğer", trackingUrl: "" },
} as const;

type ShippingCarrier = keyof typeof SHIPPING_CARRIERS;

export const orderRouter = createTRPCRouter({
  // User: List own orders
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: OrderStatusEnum.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            userId: ctx.user.id,
            ...(input.status && { status: input.status as OrderStatus }),
          },
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        }),
        prisma.order.count({
          where: {
            userId: ctx.user.id,
            ...(input.status && { status: input.status as OrderStatus }),
          },
        }),
      ]);

      return {
        orders,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // User: Get order by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      if (order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return order;
    }),

  // Admin: List all orders
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: OrderStatusEnum.optional(),
        search: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.status) {
        where.status = input.status as OrderStatus;
      }

      if (input.search) {
        where.orderNumber = { contains: input.search, mode: "insensitive" };
      }

      if (input.fromDate || input.toDate) {
        where.createdAt = {};
        if (input.fromDate) where.createdAt.gte = input.fromDate;
        if (input.toDate) where.createdAt.lte = input.toDate;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        orders,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Admin: Get order stats
  adminStats: adminProcedure.query(async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, pending, processing, completed, monthlyOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfMonth }, status: "COMPLETED" },
        select: { total: true },
      }),
    ]);

    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + parseFloat(order.total?.toString() || "0"),
      0
    );

    return {
      total,
      pending,
      processing,
      completed,
      monthlyRevenue,
    };
  }),

  // Admin: Update order status
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: OrderStatusEnum,
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const updated = await prisma.order.update({
        where: { id: input.id },
        data: {
          status: input.status as OrderStatus,
          ...(input.status === "COMPLETED" && { completedAt: new Date() }),
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "ORDER_STATUS_UPDATE",
          details: {
            targetType: "Order",
            targetId: input.id,
            previousStatus: order.status,
            newStatus: input.status,
            note: input.note,
          },
        },
      });

      return updated;
    }),

  // Admin: Get order detail
  adminGet: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Fetch user separately if needed
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { id: true, name: true, email: true, image: true },
      });

      // Fetch invoice if exists (by metadata)
      const invoice = await prisma.invoice.findFirst({
        where: {
          userId: order.userId,
          metadata: { path: ["orderId"], equals: order.id },
        },
      });

      return { ...order, user, invoice };
    }),

  // Admin: Add shipping info
  adminAddShipping: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        carrier: z.enum(["yurtici", "aras", "mng", "ptt", "ups", "dhl", "fedex", "other"]),
        trackingNumber: z.string().min(1),
        customCarrierName: z.string().optional(),
        customTrackingUrl: z.string().url().optional(),
        shippingCost: z.number().optional(),
        estimatedDelivery: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const carrierConfig = SHIPPING_CARRIERS[input.carrier];
      const carrierName = input.carrier === "other" && input.customCarrierName
        ? input.customCarrierName
        : carrierConfig.name;
      const trackingUrl = input.carrier === "other" && input.customTrackingUrl
        ? input.customTrackingUrl
        : carrierConfig.trackingUrl + input.trackingNumber;

      // Update order with shipping info
      const updated = await prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: "PROCESSING" as OrderStatus,
          shippingInfo: {
            carrier: input.carrier,
            carrierName,
            trackingNumber: input.trackingNumber,
            trackingUrl,
            shippingCost: input.shippingCost,
            estimatedDelivery: input.estimatedDelivery?.toISOString(),
            notes: input.notes,
            shippedAt: new Date().toISOString(),
            shippedBy: ctx.user.id,
            status: "shipped",
          },
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "ORDER_SHIPPING_ADDED",
          details: {
            targetType: "Order",
            targetId: input.orderId,
            carrier: carrierName,
            trackingNumber: input.trackingNumber,
          },
        },
      });

      return { success: true, order: updated, trackingUrl };
    }),

  // Admin: Update shipping status
  adminUpdateShipping: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["shipped", "in_transit", "out_for_delivery", "delivered", "returned", "failed"]),
        notes: z.string().optional(),
        deliveredAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const existingShipping = order.shippingInfo as Record<string, unknown> | null;
      if (!existingShipping) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No shipping info found" });
      }

      // Update shipping status
      const updated = await prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status === "delivered" ? "COMPLETED" as OrderStatus : order.status,
          completedAt: input.status === "delivered" ? (input.deliveredAt || new Date()) : undefined,
          shippingInfo: {
            ...existingShipping,
            status: input.status,
            statusNotes: input.notes,
            lastUpdated: new Date().toISOString(),
            ...(input.status === "delivered" && { deliveredAt: (input.deliveredAt || new Date()).toISOString() }),
          },
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "ORDER_SHIPPING_STATUS_UPDATE",
          details: {
            targetType: "Order",
            targetId: input.orderId,
            status: input.status,
            notes: input.notes,
          },
        },
      });

      return { success: true, order: updated };
    }),

  // Admin: Generate invoice
  adminGenerateInvoice: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        billingAddress: z.object({
          name: z.string(),
          company: z.string().optional(),
          taxId: z.string().optional(),
          taxOffice: z.string().optional(),
          address: z.string(),
          city: z.string(),
          postalCode: z.string().optional(),
          country: z.string().default("TR"),
          phone: z.string().optional(),
          email: z.string().email().optional(),
        }),
        notes: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          userId: order.userId,
          metadata: { path: ["orderId"], equals: order.id },
        },
      });

      if (existingInvoice) {
        throw new TRPCError({ code: "CONFLICT", message: "Invoice already exists for this order" });
      }

      // Generate invoice number
      const year = new Date().getFullYear();
      const lastInvoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: { startsWith: `INV-${year}` } },
        orderBy: { createdAt: "desc" },
      });

      let invoiceNumber: string;
      if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0");
        invoiceNumber = `INV-${year}-${String(lastNumber + 1).padStart(6, "0")}`;
      } else {
        invoiceNumber = `INV-${year}-000001`;
      }

      // Calculate totals
      const subtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
      const taxRate = 0.20; // 20% KDV
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: order.userId,
          status: "PENDING",
          subtotal,
          taxAmount,
          total,
          currency: order.currency,
          dueDate: input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          billingAddress: input.billingAddress,
          notes: input.notes,
          items: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.unitPrice) * item.quantity,
          })),
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "INVOICE_GENERATED",
          details: {
            targetType: "Invoice",
            targetId: invoice.id,
            orderId: order.id,
            invoiceNumber,
          },
        },
      });

      return { success: true, invoice };
    }),

  // Admin: Get shipping carriers
  adminGetCarriers: adminProcedure.query(async () => {
    return Object.entries(SHIPPING_CARRIERS).map(([key, value]) => ({
      id: key,
      name: value.name,
      trackingUrl: value.trackingUrl,
    }));
  }),

  // User: Track shipping
  trackShipping: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      if (order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const shippingInfo = order.shippingInfo as Record<string, unknown> | null;
      if (!shippingInfo) {
        return { hasShipping: false, shipping: null };
      }

      return {
        hasShipping: true,
        shipping: {
          carrier: shippingInfo.carrierName,
          trackingNumber: shippingInfo.trackingNumber,
          trackingUrl: shippingInfo.trackingUrl,
          status: shippingInfo.status || "shipped",
          shippedAt: shippingInfo.shippedAt,
          estimatedDelivery: shippingInfo.estimatedDelivery,
          deliveredAt: shippingInfo.deliveredAt,
        },
      };
    }),

  // Admin: Order timeline/history
  adminGetTimeline: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Get admin actions for this order
      const actions = await prisma.adminAction.findMany({
        where: {
          action: { startsWith: "ORDER_" },
          details: { path: ["targetId"], equals: input.orderId },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch admin details separately
      const adminIds = [...new Set(actions.map((a) => a.adminId))];
      const admins = await prisma.user.findMany({
        where: { id: { in: adminIds } },
        select: { id: true, name: true, email: true },
      });
      const adminMap = new Map(admins.map((a) => [a.id, a]));

      const timeline = [
        {
          type: "created",
          date: order.createdAt,
          description: "Sipariş oluşturuldu",
        },
        ...actions.map((action) => {
          const admin = adminMap.get(action.adminId);
          return {
            type: action.action,
            date: action.createdAt,
            description: getActionDescription(action.action),
            admin: admin?.name || admin?.email || undefined,
            details: action.details,
          };
        }),
      ];

      if (order.completedAt) {
        timeline.push({
          type: "completed",
          date: order.completedAt,
          description: "Sipariş tamamlandı",
        });
      }

      return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }),

  // Admin: Export orders
  adminExport: adminProcedure
    .input(
      z.object({
        format: z.enum(["csv", "xlsx", "json"]).default("csv"),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        status: OrderStatusEnum.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input.status) where.status = input.status;
      if (input.fromDate || input.toDate) {
        where.createdAt = {};
        if (input.fromDate) (where.createdAt as Record<string, Date>).gte = input.fromDate;
        if (input.toDate) (where.createdAt as Record<string, Date>).lte = input.toDate;
      }

      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "ORDER_EXPORT",
          details: {
            format: input.format,
            count: orders.length,
            filters: { fromDate: input.fromDate, toDate: input.toDate, status: input.status },
          },
        },
      });

      // Return data for client-side export
      return {
        success: true,
        data: orders.map((order) => ({
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          currency: order.currency,
          itemCount: order.items.length,
          createdAt: order.createdAt,
          completedAt: order.completedAt,
        })),
        format: input.format,
      };
    }),
});

// Helper function for action descriptions
function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    ORDER_STATUS_UPDATE: "Sipariş durumu güncellendi",
    ORDER_SHIPPING_ADDED: "Kargo bilgisi eklendi",
    ORDER_SHIPPING_STATUS_UPDATE: "Kargo durumu güncellendi",
    INVOICE_GENERATED: "Fatura oluşturuldu",
  };
  return descriptions[action] || action;
}

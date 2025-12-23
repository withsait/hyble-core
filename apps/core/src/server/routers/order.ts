// Order Management tRPC Router
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, type OrderStatus } from "@hyble/db";

const OrderStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]);

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

      return { ...order, user };
    }),
});

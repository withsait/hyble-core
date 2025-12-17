/**
 * Notification Router - In-App Notifications
 * FAZ3-1: Bildirim sistemi
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

export const notificationRouter = createTRPCRouter({
  // ==================== USER PROCEDURES ====================

  /**
   * Get notifications for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        unreadOnly: z.boolean().default(false),
        type: z.enum([
          "SYSTEM",
          "SECURITY",
          "BILLING",
          "ORDER",
          "SUBSCRIPTION",
          "SUPPORT",
          "MARKETING",
          "ANNOUNCEMENT",
        ]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, unreadOnly, type } = input;

      const where = {
        userId: ctx.session.user.id,
        ...(unreadOnly && { isRead: false }),
        ...(type && { type }),
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      };

      const notifications = await prisma.notification.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  /**
   * Get unread count
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await prisma.notification.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return { count };
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bildirim bulunamadı",
        });
      }

      await prisma.notification.update({
        where: { id: input.id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }),

  /**
   * Dismiss notification
   */
  dismiss: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bildirim bulunamadı",
        });
      }

      await prisma.notification.update({
        where: { id: input.id },
        data: {
          isDismissed: true,
          dismissedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bildirim bulunamadı",
        });
      }

      await prisma.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Clear all notifications
   */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.notification.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return { success: true };
  }),

  // ==================== ADMIN PROCEDURES ====================

  /**
   * Send notification to user (Admin)
   */
  send: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum([
          "SYSTEM",
          "SECURITY",
          "BILLING",
          "ORDER",
          "SUBSCRIPTION",
          "SUPPORT",
          "MARKETING",
          "ANNOUNCEMENT",
        ]),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
        actionUrl: z.string().url().optional(),
        actionLabel: z.string().optional(),
        icon: z.string().optional(),
        expiresAt: z.date().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          priority: input.priority,
          title: input.title,
          message: input.message,
          actionUrl: input.actionUrl,
          actionLabel: input.actionLabel,
          icon: input.icon,
          expiresAt: input.expiresAt,
          metadata: input.metadata,
        },
      });

      return { notification };
    }),

  /**
   * Send broadcast notification to all users (Admin)
   */
  broadcast: adminProcedure
    .input(
      z.object({
        type: z.enum(["SYSTEM", "ANNOUNCEMENT", "MARKETING"]),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
        actionUrl: z.string().url().optional(),
        actionLabel: z.string().optional(),
        icon: z.string().optional(),
        expiresAt: z.date().optional(),
        targetUserIds: z.array(z.string()).optional(), // If empty, send to all
      })
    )
    .mutation(async ({ input }) => {
      let userIds: string[];

      if (input.targetUserIds && input.targetUserIds.length > 0) {
        userIds = input.targetUserIds;
      } else {
        // Get all active users
        const users = await prisma.user.findMany({
          where: { status: "ACTIVE" },
          select: { id: true },
        });
        userIds = users.map((u) => u.id);
      }

      // Create notifications in batches
      const batchSize = 100;
      let created = 0;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        await prisma.notification.createMany({
          data: batch.map((userId) => ({
            userId,
            type: input.type,
            priority: input.priority,
            title: input.title,
            message: input.message,
            actionUrl: input.actionUrl,
            actionLabel: input.actionLabel,
            icon: input.icon,
            expiresAt: input.expiresAt,
          })),
        });

        created += batch.length;
      }

      return { created };
    }),

  /**
   * Get notification stats (Admin)
   */
  stats: adminProcedure.query(async () => {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ["type"],
        _count: true,
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Create notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type:
    | "SYSTEM"
    | "SECURITY"
    | "BILLING"
    | "ORDER"
    | "SUBSCRIPTION"
    | "SUPPORT"
    | "MARKETING"
    | "ANNOUNCEMENT";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      priority: params.priority || "NORMAL",
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
      icon: params.icon,
      expiresAt: params.expiresAt,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

/**
 * Create security notification
 */
export async function createSecurityNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  return createNotification({
    userId,
    type: "SECURITY",
    priority: "HIGH",
    title,
    message,
    icon: "Shield",
    metadata,
  });
}

/**
 * Create billing notification
 */
export async function createBillingNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: "BILLING",
    title,
    message,
    actionUrl,
    actionLabel: actionUrl ? "Detayları Gör" : undefined,
    icon: "CreditCard",
  });
}

/**
 * Create order notification
 */
export async function createOrderNotification(
  userId: string,
  title: string,
  message: string,
  orderId?: string
) {
  return createNotification({
    userId,
    type: "ORDER",
    title,
    message,
    actionUrl: orderId ? `/orders/${orderId}` : undefined,
    actionLabel: orderId ? "Siparişi Görüntüle" : undefined,
    icon: "Package",
  });
}

/**
 * Create support notification
 */
export async function createSupportNotification(
  userId: string,
  title: string,
  message: string,
  ticketId?: string
) {
  return createNotification({
    userId,
    type: "SUPPORT",
    title,
    message,
    actionUrl: ticketId ? `/support/${ticketId}` : undefined,
    actionLabel: ticketId ? "Talebi Görüntüle" : undefined,
    icon: "HeadphonesIcon",
  });
}

export default notificationRouter;

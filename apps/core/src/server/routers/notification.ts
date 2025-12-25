/**
 * Notification Router - In-App Notifications + Email
 * FAZ3-1: Bildirim sistemi
 *
 * This module provides:
 * - In-app notifications with real-time support
 * - Email notifications for critical events
 * - User notification preferences
 * - Admin broadcast and targeted messaging
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendSupportTicketEmail,
  sendSecurityAlertEmail,
  sendInvoiceEmail,
  sendUsageAlertEmail,
} from "@hyble/email";

// ==================== TYPES ====================

export type NotificationType =
  | "SYSTEM"
  | "SECURITY"
  | "BILLING"
  | "ORDER"
  | "SUBSCRIPTION"
  | "SUPPORT"
  | "MARKETING"
  | "ANNOUNCEMENT";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// Use the database NotificationPreferences model
// Schema fields: securityEmail, securityPanel, billingEmail, billingPanel,
// projectsEmail, projectsPanel, supportEmail, supportPanel, updatesEmail,
// updatesPanel, marketingEmail, marketingPanel, discordDm, appreciationEmail

export interface UserNotificationPrefs {
  securityEmail: boolean;
  securityPanel: boolean;
  billingEmail: boolean;
  billingPanel: boolean;
  projectsEmail: boolean;
  projectsPanel: boolean;
  supportEmail: boolean;
  supportPanel: boolean;
  updatesEmail: boolean;
  updatesPanel: boolean;
  marketingEmail: boolean;
  marketingPanel: boolean;
  discordDm: boolean;
  appreciationEmail: boolean;
}

const defaultPreferences: UserNotificationPrefs = {
  securityEmail: true,
  securityPanel: true,
  billingEmail: true,
  billingPanel: true,
  projectsEmail: true,
  projectsPanel: true,
  supportEmail: true,
  supportPanel: true,
  updatesEmail: false,
  updatesPanel: false,
  marketingEmail: false,
  marketingPanel: false,
  discordDm: false,
  appreciationEmail: true,
};

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

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!prefs) {
      return defaultPreferences;
    }

    return {
      securityEmail: prefs.securityEmail,
      securityPanel: prefs.securityPanel,
      billingEmail: prefs.billingEmail,
      billingPanel: prefs.billingPanel,
      projectsEmail: prefs.projectsEmail,
      projectsPanel: prefs.projectsPanel,
      supportEmail: prefs.supportEmail,
      supportPanel: prefs.supportPanel,
      updatesEmail: prefs.updatesEmail,
      updatesPanel: prefs.updatesPanel,
      marketingEmail: prefs.marketingEmail,
      marketingPanel: prefs.marketingPanel,
      discordDm: prefs.discordDm,
      appreciationEmail: prefs.appreciationEmail,
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        securityEmail: z.boolean().optional(),
        securityPanel: z.boolean().optional(),
        billingEmail: z.boolean().optional(),
        billingPanel: z.boolean().optional(),
        projectsEmail: z.boolean().optional(),
        projectsPanel: z.boolean().optional(),
        supportEmail: z.boolean().optional(),
        supportPanel: z.boolean().optional(),
        updatesEmail: z.boolean().optional(),
        updatesPanel: z.boolean().optional(),
        marketingEmail: z.boolean().optional(),
        marketingPanel: z.boolean().optional(),
        discordDm: z.boolean().optional(),
        appreciationEmail: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert preferences
      const prefs = await prisma.notificationPreferences.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          ...(input.securityEmail !== undefined && { securityEmail: input.securityEmail }),
          ...(input.securityPanel !== undefined && { securityPanel: input.securityPanel }),
          ...(input.billingEmail !== undefined && { billingEmail: input.billingEmail }),
          ...(input.billingPanel !== undefined && { billingPanel: input.billingPanel }),
          ...(input.projectsEmail !== undefined && { projectsEmail: input.projectsEmail }),
          ...(input.projectsPanel !== undefined && { projectsPanel: input.projectsPanel }),
          ...(input.supportEmail !== undefined && { supportEmail: input.supportEmail }),
          ...(input.supportPanel !== undefined && { supportPanel: input.supportPanel }),
          ...(input.updatesEmail !== undefined && { updatesEmail: input.updatesEmail }),
          ...(input.updatesPanel !== undefined && { updatesPanel: input.updatesPanel }),
          ...(input.marketingEmail !== undefined && { marketingEmail: input.marketingEmail }),
          ...(input.marketingPanel !== undefined && { marketingPanel: input.marketingPanel }),
          ...(input.discordDm !== undefined && { discordDm: input.discordDm }),
          ...(input.appreciationEmail !== undefined && { appreciationEmail: input.appreciationEmail }),
        },
        create: {
          userId: ctx.session.user.id,
          ...defaultPreferences,
          ...input,
        },
      });

      return { preferences: prefs };
    }),

  // ==================== ADMIN PROCEDURES ====================

  /**
   * Send notification to user (Admin)
   * Optionally sends an email notification as well
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
        sendEmail: z.boolean().default(false),
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

      // Send email if requested
      let emailSent = false;
      if (input.sendEmail) {
        const user = await prisma.user.findUnique({
          where: { id: input.userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const prefs = await getUserNotificationPreferences(input.userId);
          const shouldSendEmail = shouldSendEmailForType(prefs, input.type);

          if (shouldSendEmail) {
            try {
              await sendGenericNotificationEmail(
                user.email,
                user.name || "Kullanıcı",
                input.title,
                input.message,
                input.actionUrl
              );
              emailSent = true;
            } catch (error) {
              console.error("Failed to send notification email:", error);
            }
          }
        }
      }

      return { notification, emailSent };
    }),

  /**
   * Admin send notification with email template
   */
  adminSendWithEmail: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        emailType: z.enum([
          "security_alert",
          "order_confirmation",
          "order_shipped",
          "support_ticket",
          "invoice",
          "usage_alert",
        ]),
        data: z.record(z.any()),
        createNotification: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, name: true },
      });

      if (!user?.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı email adresi bulunamadı",
        });
      }

      let notification = null;
      let emailSent = false;

      const prefs = await getUserNotificationPreferences(input.userId);

      // Send email based on type
      try {
        switch (input.emailType) {
          case "security_alert":
            if (prefs.securityEmail) {
              await sendSecurityAlertEmail(
                user.email,
                input.data.alertType as "new_login" | "password_changed" | "2fa_enabled" | "2fa_disabled" | "account_frozen",
                input.data.details || {},
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              notification = await createNotification({
                userId: input.userId,
                type: "SECURITY",
                priority: "HIGH",
                title: input.data.title || "Güvenlik Uyarısı",
                message: input.data.message || "Hesabınızda bir güvenlik olayı tespit edildi.",
                icon: "Shield",
              });
            }
            break;

          case "order_confirmation":
            if (prefs.projectsEmail) {
              await sendOrderConfirmationEmail(
                user.email,
                user.name || "Müşteri",
                input.data.order,
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              notification = await createNotification({
                userId: input.userId,
                type: "ORDER",
                title: "Siparişiniz Alındı",
                message: `${input.data.order?.orderNumber || "Sipariş"} numaralı siparişiniz oluşturuldu.`,
                actionUrl: `/orders/${input.data.order?.orderNumber}`,
                actionLabel: "Siparişi Görüntüle",
                icon: "Package",
              });
            }
            break;

          case "order_shipped":
            if (prefs.projectsEmail) {
              await sendOrderShippedEmail(
                user.email,
                user.name || "Müşteri",
                input.data.orderNumber,
                input.data.trackingUrl,
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              notification = await createNotification({
                userId: input.userId,
                type: "ORDER",
                title: "Siparişiniz Kargoya Verildi",
                message: `${input.data.orderNumber} numaralı siparişiniz yola çıktı.`,
                actionUrl: input.data.trackingUrl,
                actionLabel: "Takip Et",
                icon: "Truck",
              });
            }
            break;

          case "support_ticket":
            if (prefs.supportEmail) {
              await sendSupportTicketEmail(
                user.email,
                user.name || "Müşteri",
                input.data.ticketNumber,
                input.data.subject,
                input.data.status || "created",
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              const statusLabels: Record<string, string> = {
                created: "Destek Talebiniz Alındı",
                replied: "Destek Talebinize Yanıt Verildi",
                resolved: "Destek Talebiniz Çözüldü",
              };
              notification = await createNotification({
                userId: input.userId,
                type: "SUPPORT",
                title: statusLabels[input.data.status] || "Destek Talebi Güncellendi",
                message: `${input.data.ticketNumber} numaralı talebiniz güncellendi.`,
                actionUrl: `/support/${input.data.ticketNumber}`,
                actionLabel: "Talebi Görüntüle",
                icon: "HeadphonesIcon",
              });
            }
            break;

          case "invoice":
            if (prefs.billingEmail) {
              await sendInvoiceEmail(
                user.email,
                user.name || "Müşteri",
                input.data.invoiceNumber,
                input.data.invoiceUrl,
                input.data.total,
                input.data.currency || "USD",
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              notification = await createNotification({
                userId: input.userId,
                type: "BILLING",
                title: "Faturanız Hazır",
                message: `${input.data.invoiceNumber} numaralı faturanız oluşturuldu.`,
                actionUrl: input.data.invoiceUrl,
                actionLabel: "Faturayı İndir",
                icon: "FileText",
              });
            }
            break;

          case "usage_alert":
            if (prefs.billingEmail) {
              await sendUsageAlertEmail(
                user.email,
                user.name || "Kullanıcı",
                input.data.resource,
                input.data.percentage,
                input.data.currentUsage,
                input.data.limit,
                "hyble"
              );
              emailSent = true;
            }
            if (input.createNotification) {
              notification = await createNotification({
                userId: input.userId,
                type: "BILLING",
                priority: input.data.percentage >= 100 ? "URGENT" : "HIGH",
                title: input.data.percentage >= 100 ? "Limit Aşıldı" : "Kullanım Uyarısı",
                message: `${input.data.resource} kullanımınız %${input.data.percentage} seviyesinde.`,
                actionUrl: "/subscription/upgrade",
                actionLabel: "Planı Yükselt",
                icon: "AlertTriangle",
              });
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${input.emailType} email:`, error);
      }

      return { notification, emailSent };
    }),

  /**
   * Get all notifications (Admin)
   */
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        userId: z.string().optional(),
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
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, userId, type, unreadOnly } = input;

      const where = {
        ...(userId && { userId }),
        ...(type && { type }),
        ...(unreadOnly && { isRead: false }),
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

      // Fetch user data for notifications
      const userIds = [...new Set(notifications.map((n) => n.userId))];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      const notificationsWithUser = notifications.map((n) => ({
        ...n,
        user: userMap.get(n.userId) || null,
      }));

      return {
        notifications: notificationsWithUser,
        nextCursor,
      };
    }),

  /**
   * Delete notification (Admin)
   */
  adminDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Delete all notifications for a user (Admin)
   */
  adminClearUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await prisma.notification.deleteMany({
        where: { userId: input.userId },
      });

      return { deleted: result.count };
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
 * Get user notification preferences from database
 */
async function getUserNotificationPreferences(
  userId: string
): Promise<UserNotificationPrefs> {
  const prefs = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  if (!prefs) return defaultPreferences;

  return {
    securityEmail: prefs.securityEmail,
    securityPanel: prefs.securityPanel,
    billingEmail: prefs.billingEmail,
    billingPanel: prefs.billingPanel,
    projectsEmail: prefs.projectsEmail,
    projectsPanel: prefs.projectsPanel,
    supportEmail: prefs.supportEmail,
    supportPanel: prefs.supportPanel,
    updatesEmail: prefs.updatesEmail,
    updatesPanel: prefs.updatesPanel,
    marketingEmail: prefs.marketingEmail,
    marketingPanel: prefs.marketingPanel,
    discordDm: prefs.discordDm,
    appreciationEmail: prefs.appreciationEmail,
  };
}

/**
 * Check if email should be sent for a notification type based on user preferences
 */
function shouldSendEmailForType(
  prefs: UserNotificationPrefs,
  type: NotificationType
): boolean {
  switch (type) {
    case "SECURITY":
      return prefs.securityEmail;
    case "ORDER":
    case "SUBSCRIPTION":
      return prefs.projectsEmail; // projectsEmail covers order notifications
    case "BILLING":
      return prefs.billingEmail;
    case "SUPPORT":
      return prefs.supportEmail;
    case "MARKETING":
      return prefs.marketingEmail;
    case "ANNOUNCEMENT":
    case "SYSTEM":
      return prefs.updatesEmail;
    default:
      return true;
  }
}

/**
 * Send a generic notification email (for custom notifications)
 */
async function sendGenericNotificationEmail(
  email: string,
  name: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  // Use dynamic import to avoid circular dependencies
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  const buttonHtml = actionUrl
    ? `<a href="${actionUrl}" style="display: inline-block; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; margin-top: 20px;">Detayları Gör</a>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #60A5FA, #2563EB); text-align: center; vertical-align: middle;">
                    <span style="color: #FFFFFF; font-size: 20px; font-weight: bold; line-height: 40px;">H</span>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="color: #0F172A; font-size: 24px; font-weight: 600;">Hyble</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #0F172A; font-size: 24px; font-weight: 600;">${title}</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Merhaba ${name},
              </p>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                ${message}
              </p>
              ${buttonHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #F1F5F9; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; color: #94A3B8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Hyble. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await resend.emails.send({
    from: "Hyble <noreply@hyble.co>",
    to: email,
    subject: `${title} - Hyble`,
    html,
  });
}

/**
 * Create notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
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
 * Create notification and optionally send email
 */
export async function createNotificationWithEmail(params: {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
}) {
  // Create notification
  const notification = await createNotification(params);

  // Send email if requested
  if (params.sendEmail) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      const prefs = await getUserNotificationPreferences(params.userId);
      if (shouldSendEmailForType(prefs, params.type)) {
        try {
          await sendGenericNotificationEmail(
            user.email,
            user.name || "Kullanıcı",
            params.title,
            params.message,
            params.actionUrl
          );
        } catch (error) {
          console.error("Failed to send notification email:", error);
        }
      }
    }
  }

  return notification;
}

/**
 * Create security notification with email
 */
export async function createSecurityNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
  sendEmail = true
) {
  const notification = await createNotification({
    userId,
    type: "SECURITY",
    priority: "HIGH",
    title,
    message,
    icon: "Shield",
    metadata,
  });

  if (sendEmail) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      const prefs = await getUserNotificationPreferences(userId);
      if (prefs.securityEmail) {
        try {
          await sendSecurityAlertEmail(
            user.email,
            "new_login",
            metadata as { device?: string; location?: string; ip?: string; time?: string },
            "hyble"
          );
        } catch (error) {
          console.error("Failed to send security email:", error);
        }
      }
    }
  }

  return notification;
}

/**
 * Create billing notification with optional email
 */
export async function createBillingNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
  sendEmail = false
) {
  return createNotificationWithEmail({
    userId,
    type: "BILLING",
    title,
    message,
    actionUrl,
    actionLabel: actionUrl ? "Detayları Gör" : undefined,
    icon: "CreditCard",
    sendEmail,
  });
}

/**
 * Create order notification with email
 */
export async function createOrderNotification(
  userId: string,
  title: string,
  message: string,
  orderId?: string,
  sendEmail = true
) {
  return createNotificationWithEmail({
    userId,
    type: "ORDER",
    title,
    message,
    actionUrl: orderId ? `/orders/${orderId}` : undefined,
    actionLabel: orderId ? "Siparişi Görüntüle" : undefined,
    icon: "Package",
    sendEmail,
  });
}

/**
 * Create support notification with optional email
 */
export async function createSupportNotification(
  userId: string,
  title: string,
  message: string,
  ticketId?: string,
  sendEmail = true
) {
  return createNotificationWithEmail({
    userId,
    type: "SUPPORT",
    title,
    message,
    actionUrl: ticketId ? `/support/${ticketId}` : undefined,
    actionLabel: ticketId ? "Talebi Görüntüle" : undefined,
    icon: "HeadphonesIcon",
    sendEmail,
  });
}

/**
 * Notify order confirmation (in-app + email)
 */
export async function notifyOrderConfirmation(
  userId: string,
  orderDetails: {
    orderNumber: string;
    items: { name: string; quantity: number; price: number; variant?: string }[];
    subtotal: number;
    discount?: number;
    total: number;
    currency: string;
    paymentMethod: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  // Create in-app notification
  const notification = await createNotification({
    userId,
    type: "ORDER",
    title: "Siparişiniz Alındı",
    message: `${orderDetails.orderNumber} numaralı siparişiniz başarıyla oluşturuldu.`,
    actionUrl: `/orders/${orderDetails.orderNumber}`,
    actionLabel: "Siparişi Görüntüle",
    icon: "Package",
    metadata: { orderNumber: orderDetails.orderNumber },
  });

  // Send email
  if (user?.email) {
    const prefs = await getUserNotificationPreferences(userId);
    if (prefs.projectsEmail) {
      try {
        await sendOrderConfirmationEmail(
          user.email,
          user.name || "Müşteri",
          orderDetails,
          "hyble"
        );
      } catch (error) {
        console.error("Failed to send order confirmation email:", error);
      }
    }
  }

  return notification;
}

/**
 * Notify order shipped (in-app + email)
 */
export async function notifyOrderShipped(
  userId: string,
  orderNumber: string,
  trackingUrl?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  // Create in-app notification
  const notification = await createNotification({
    userId,
    type: "ORDER",
    title: "Siparişiniz Kargoya Verildi",
    message: `${orderNumber} numaralı siparişiniz yola çıktı.`,
    actionUrl: trackingUrl || `/orders/${orderNumber}`,
    actionLabel: trackingUrl ? "Kargo Takip" : "Siparişi Görüntüle",
    icon: "Truck",
    metadata: { orderNumber, trackingUrl },
  });

  // Send email
  if (user?.email) {
    const prefs = await getUserNotificationPreferences(userId);
    if (prefs.projectsEmail) {
      try {
        await sendOrderShippedEmail(
          user.email,
          user.name || "Müşteri",
          orderNumber,
          trackingUrl,
          "hyble"
        );
      } catch (error) {
        console.error("Failed to send order shipped email:", error);
      }
    }
  }

  return notification;
}

/**
 * Notify support ticket update (in-app + email)
 */
export async function notifySupportTicket(
  userId: string,
  ticketNumber: string,
  subject: string,
  status: "created" | "replied" | "resolved"
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  const statusLabels = {
    created: "Destek Talebiniz Alındı",
    replied: "Destek Talebinize Yanıt Verildi",
    resolved: "Destek Talebiniz Çözüldü",
  } as const;

  // Create in-app notification
  const notification = await createNotification({
    userId,
    type: "SUPPORT",
    title: statusLabels[status],
    message: `${ticketNumber} numaralı talebiniz: ${subject}`,
    actionUrl: `/support/${ticketNumber}`,
    actionLabel: "Talebi Görüntüle",
    icon: "HeadphonesIcon",
    metadata: { ticketNumber, status },
  });

  // Send email
  if (user?.email) {
    const prefs = await getUserNotificationPreferences(userId);
    if (prefs.supportEmail) {
      try {
        await sendSupportTicketEmail(
          user.email,
          user.name || "Müşteri",
          ticketNumber,
          subject,
          status,
          "hyble"
        );
      } catch (error) {
        console.error("Failed to send support ticket email:", error);
      }
    }
  }

  return notification;
}

export default notificationRouter;

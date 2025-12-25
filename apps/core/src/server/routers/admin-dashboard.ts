import { z } from "zod";
import { router, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";

// Dashboard widget schema
const widgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  order: z.number(),
});

// Alert threshold schema
const alertThresholdSchema = z.object({
  name: z.string().min(1),
  metric: z.string(),
  operator: z.enum(["gt", "lt", "eq", "gte", "lte"]),
  value: z.number(),
  severity: z.enum(["info", "warning", "critical"]),
  isActive: z.boolean().default(true),
  notifyEmail: z.boolean().default(true),
  notifySlack: z.boolean().default(false),
});

export const adminDashboardRouter = router({
  // Get dashboard settings
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await prisma.systemSetting.findUnique({
      where: { key: `dashboard_settings_${ctx.session.user.id}` },
    });

    if (!settings) {
      return {
        widgets: [],
        layout: {},
        theme: "auto",
        refreshInterval: 60,
      };
    }

    return JSON.parse(settings.value);
  }),

  // Save dashboard settings
  saveSettings: adminProcedure
    .input(z.object({
      widgets: z.array(widgetSchema),
      layout: z.record(z.any()).optional(),
      theme: z.string().optional(),
      refreshInterval: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await prisma.systemSetting.upsert({
        where: { key: `dashboard_settings_${ctx.session.user.id}` },
        create: {
          key: `dashboard_settings_${ctx.session.user.id}`,
          value: JSON.stringify(input),
        },
        update: {
          value: JSON.stringify(input),
        },
      });

      return { success: true };
    }),

  // Get alert thresholds
  getAlertThresholds: adminProcedure.query(async () => {
    const thresholds = await prisma.systemSetting.findUnique({
      where: { key: "alert_thresholds" },
    });

    if (!thresholds) {
      return [];
    }

    return JSON.parse(thresholds.value);
  }),

  // Save alert thresholds
  saveAlertThresholds: adminProcedure
    .input(z.array(alertThresholdSchema.extend({ id: z.string() })))
    .mutation(async ({ input }) => {
      await prisma.systemSetting.upsert({
        where: { key: "alert_thresholds" },
        create: {
          key: "alert_thresholds",
          value: JSON.stringify(input),
        },
        update: {
          value: JSON.stringify(input),
        },
      });

      return { success: true };
    }),

  // Get real-time stats for dashboard
  getRealtimeStats: adminProcedure.query(async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      todayRegistrations,
      activeSessions,
      walletStats,
      pendingSupport,
      totalProducts,
      recentOrders,
      failedLogins24h,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.session.count({
        where: { expires: { gte: now } },
      }),
      prisma.wallet.aggregate({
        _sum: { balance: true },
        _count: true,
      }),
      prisma.ticket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.product.count(),
      prisma.order.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.loginAttempt.count({
        where: {
          success: false,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalUsers,
      todayRegistrations,
      activeSessions,
      totalWallets: walletStats._count,
      totalBalance: walletStats._sum.balance?.toNumber() || 0,
      pendingSupport,
      totalProducts,
      recentOrders,
      failedLogins24h,
      timestamp: now.toISOString(),
    };
  }),

  // Export dashboard data
  exportDashboardData: adminProcedure
    .input(z.object({
      format: z.enum(["csv", "json", "xlsx"]),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }),
      metrics: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const startDate = new Date(input.dateRange.start);
      const endDate = new Date(input.dateRange.end);

      // Gather data based on selected metrics
      const data: Record<string, any> = {};

      if (input.metrics.includes("users")) {
        data.users = await prisma.user.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
      }

      if (input.metrics.includes("transactions")) {
        data.transactions = await prisma.transaction.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        });
      }

      if (input.metrics.includes("orders")) {
        data.orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        });
      }

      // Format based on requested format
      if (input.format === "json") {
        return { data, format: "json" };
      }

      // For CSV/XLSX, would need to convert data
      return { data, format: input.format };
    }),

  // Get system health metrics
  getSystemHealth: adminProcedure.query(async () => {
    const checks = {
      database: { status: "healthy", latency: 0 },
      redis: { status: "healthy", latency: 0 },
      storage: { status: "healthy", usage: 0 },
      api: { status: "healthy", requestsPerMinute: 0 },
    };

    // Database check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database.latency = Date.now() - dbStart;
    } catch {
      checks.database.status = "unhealthy";
    }

    return checks;
  }),

  // Feature flags management
  getFeatureFlags: adminProcedure.query(async () => {
    const flags = await prisma.systemSetting.findUnique({
      where: { key: "feature_flags" },
    });

    if (!flags) {
      return [];
    }

    return JSON.parse(flags.value);
  }),

  saveFeatureFlags: adminProcedure
    .input(z.array(z.object({
      key: z.string(),
      name: z.string(),
      description: z.string().optional(),
      isEnabled: z.boolean(),
      percentage: z.number().min(0).max(100).default(100),
      userIds: z.array(z.string()).optional(),
    })))
    .mutation(async ({ input }) => {
      await prisma.systemSetting.upsert({
        where: { key: "feature_flags" },
        create: {
          key: "feature_flags",
          value: JSON.stringify(input),
        },
        update: {
          value: JSON.stringify(input),
        },
      });

      return { success: true };
    }),
});

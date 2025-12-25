/**
 * Infrastructure Router
 * System administration and infrastructure management
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const infrastructureRouter = createTRPCRouter({
  // ==========================================
  // Health Checks
  // ==========================================
  getHealth: protectedProcedure.query(async ({ ctx }) => {
    const checks = {
      database: false,
      redis: false,
      storage: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Check database
      await ctx.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error("Database health check failed:", error);
    }

    // TODO: Add Redis and storage checks

    return {
      status: checks.database ? "healthy" : "unhealthy",
      checks,
    };
  }),

  // ==========================================
  // System Stats
  // ==========================================
  getSystemStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todaySignups,
      todayOrders,
    ] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.product.count(),
      ctx.prisma.order.count(),
      ctx.prisma.transaction.aggregate({
        where: { type: "PAYMENT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      ctx.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      ctx.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        todaySignups,
      },
      products: {
        total: totalProducts,
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
      },
      revenue: {
        total: totalRevenue._sum.amount?.toNumber() || 0,
      },
    };
  }),

  // ==========================================
  // Backups
  // ==========================================
  listBackups: adminProcedure
    .input(
      z.object({
        type: z.enum(["full", "incremental", "database", "files", "config"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.type) where.type = input.type;

      const [backups, total] = await Promise.all([
        ctx.prisma.backup.findMany({
          where,
          orderBy: { startedAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.backup.count({ where }),
      ]);

      return {
        backups,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getBackupStats: adminProcedure.query(async ({ ctx }) => {
    const [total, byType, lastBackup, totalSize] = await Promise.all([
      ctx.prisma.backup.count(),
      ctx.prisma.backup.groupBy({
        by: ["type"],
        _count: true,
      }),
      ctx.prisma.backup.findFirst({
        where: { status: "completed" },
        orderBy: { startedAt: "desc" },
      }),
      ctx.prisma.backup.aggregate({
        where: { status: "completed" },
        _sum: { size: true },
      }),
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map((b) => [b.type, b._count])),
      lastBackup,
      totalSize: totalSize._sum.size || 0,
    };
  }),

  // ==========================================
  // Error Logs
  // ==========================================
  listErrors: adminProcedure
    .input(
      z.object({
        category: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        resolved: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.category) where.category = input.category;
      if (input.severity) where.severity = input.severity;
      if (input.resolved !== undefined) where.resolved = input.resolved;
      if (input.search) {
        where.message = { contains: input.search, mode: "insensitive" };
      }

      const [errors, total] = await Promise.all([
        ctx.prisma.errorLog.findMany({
          where,
          orderBy: { occurredAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.errorLog.count({ where }),
      ]);

      return {
        errors,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getErrorStats: adminProcedure.query(async ({ ctx }) => {
    const [total, unresolved, bySeverity, byCategory, last24h] = await Promise.all([
      ctx.prisma.errorLog.count(),
      ctx.prisma.errorLog.count({ where: { resolved: false } }),
      ctx.prisma.errorLog.groupBy({
        by: ["severity"],
        _count: true,
      }),
      ctx.prisma.errorLog.groupBy({
        by: ["category"],
        _count: true,
      }),
      ctx.prisma.errorLog.count({
        where: {
          occurredAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      unresolved,
      last24h,
      bySeverity: Object.fromEntries(bySeverity.map((s) => [s.severity, s._count])),
      byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count])),
    };
  }),

  resolveError: adminProcedure
    .input(z.object({ fingerprint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.errorLog.update({
        where: { fingerprint: input.fingerprint },
        data: { resolved: true, resolvedAt: new Date() },
      });
      return { success: true };
    }),

  // ==========================================
  // Audit Logs
  // ==========================================
  listAuditLogs: adminProcedure
    .input(
      z.object({
        eventType: z.string().optional(),
        userId: z.string().optional(),
        resourceType: z.string().optional(),
        severity: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.eventType) where.eventType = input.eventType;
      if (input.userId) where.userId = input.userId;
      if (input.resourceType) where.resourceType = input.resourceType;
      if (input.severity) where.severity = input.severity;
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // ==========================================
  // Deployments
  // ==========================================
  listDeployments: adminProcedure
    .input(
      z.object({
        target: z.enum(["production", "staging", "preview"]).optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.target) where.target = input.target;
      if (input.status) where.status = input.status;

      const [deployments, total] = await Promise.all([
        ctx.prisma.deployment.findMany({
          where,
          orderBy: { startedAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.deployment.count({ where }),
      ]);

      return {
        deployments,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // ==========================================
  // Feature Flags
  // ==========================================
  listFeatureFlags: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
  }),

  updateFeatureFlag: adminProcedure
    .input(
      z.object({
        key: z.string(),
        enabled: z.boolean().optional(),
        environments: z.array(z.string()).optional(),
        rolloutPercentage: z.number().min(0).max(100).optional(),
        rules: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, ...data } = input;
      return ctx.prisma.featureFlag.upsert({
        where: { key },
        update: data,
        create: {
          key,
          name: key,
          ...data,
        },
      });
    }),

  // ==========================================
  // Scheduled Jobs
  // ==========================================
  listScheduledJobs: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.scheduledJob.findMany({
      orderBy: { name: "asc" },
    });
  }),

  toggleScheduledJob: adminProcedure
    .input(
      z.object({
        name: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.scheduledJob.update({
        where: { name: input.name },
        data: { enabled: input.enabled },
      });
    }),

  // ==========================================
  // System Settings
  // ==========================================
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.systemSetting.findMany();
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }),

  updateSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.systemSetting.upsert({
        where: { key: input.key },
        update: { value: input.value },
        create: { key: input.key, value: input.value },
      });
    }),

  // ==========================================
  // Cache Management
  // ==========================================
  getCacheStats: adminProcedure.query(async () => {
    // Would connect to Redis in production
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      keys: 0,
      memoryUsed: "0B",
      evictions: 0,
    };
  }),

  flushCache: adminProcedure
    .input(
      z.object({
        pattern: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Would flush Redis cache in production
      return { success: true, flushed: 0 };
    }),
});

export default infrastructureRouter;

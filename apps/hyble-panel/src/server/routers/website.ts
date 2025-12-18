import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  verifiedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Simple nanoid replacement
function nanoid(size: number = 21): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

export const websiteRouter = createTRPCRouter({
  // List user's websites
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["CREATING", "DEPLOYING", "ACTIVE", "SUSPENDED", "MAINTENANCE", "DELETED"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;

      const where: any = {
        userId: ctx.user.id,
        deletedAt: null,
      };

      if (status) {
        where.status = status;
      }

      const [websites, total] = await Promise.all([
        prisma.website.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            domains: {
              where: { isPrimary: true },
              take: 1,
            },
            _count: {
              select: { deployments: true },
            },
          },
        }),
        prisma.website.count({ where }),
      ]);

      return {
        websites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single website
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          deletedAt: null,
        },
        include: {
          domains: true,
          deployments: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          backups: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      return website;
    }),

  // Create a new website
  create: verifiedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        productId: z.string().optional(), // Template product ID
        orderId: z.string().optional(),
        framework: z.enum(["nextjs", "react", "vue", "static"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Generate unique slug and subdomain
      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);

      let slug = baseSlug;
      let subdomain = baseSlug;
      let isUnique = false;
      let counter = 0;

      while (!isUnique) {
        const existing = await prisma.website.findFirst({
          where: {
            OR: [{ slug }, { subdomain }],
          },
        });

        if (!existing) {
          isUnique = true;
        } else {
          counter++;
          slug = `${baseSlug}-${counter}`;
          subdomain = `${baseSlug}-${counter}`;
        }
      }

      const website = await prisma.website.create({
        data: {
          userId,
          name: input.name,
          slug,
          subdomain,
          description: input.description,
          productId: input.productId,
          orderId: input.orderId,
          framework: input.framework,
          status: "CREATING",
          plan: "STARTER",
        },
      });

      // Create initial deployment (would trigger actual deployment in production)
      await prisma.websiteDeployment.create({
        data: {
          websiteId: website.id,
          deployNumber: 1,
          status: "pending",
          triggeredBy: userId,
          triggerType: "manual",
        },
      });

      return website;
    }),

  // Update website settings
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(100).optional(),
        description: z.string().max(500).optional(),
        settings: z.record(z.any()).optional(),
        envVars: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const website = await prisma.website.findFirst({
        where: { id, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const updated = await prisma.website.update({
        where: { id },
        data,
      });

      return updated;
    }),

  // Delete website (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.id, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      await prisma.website.update({
        where: { id: input.id },
        data: {
          status: "DELETED",
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),

  // List domains for a website
  listDomains: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const domains = await prisma.websiteDomain.findMany({
        where: { websiteId: input.websiteId },
        orderBy: { createdAt: "desc" },
      });

      return {
        domains: domains.map((d) => ({
          id: d.id,
          domain: d.domain,
          type: d.isPrimary ? "primary" : "redirect",
          status: d.verified ? "active" : "pending",
          sslStatus: d.sslEnabled ? "active" : d.verified ? "pending" : "none",
          verificationCode: d.verificationToken,
          createdAt: d.createdAt.toISOString(),
        })),
      };
    }),

  // Add custom domain
  addDomain: verifiedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      // Check if domain is already in use
      const existingDomain = await prisma.websiteDomain.findUnique({
        where: { domain: input.domain },
      });

      if (existingDomain) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This domain is already in use",
        });
      }

      // Generate verification token
      const verificationToken = `hyble-verify-${nanoid(32)}`;

      const domain = await prisma.websiteDomain.create({
        data: {
          websiteId: input.websiteId,
          domain: input.domain,
          verificationToken,
          dnsRecords: {
            cname: {
              name: input.domain,
              value: `${website.subdomain}.hyble.co`,
            },
            txt: {
              name: `_hyble-verify.${input.domain}`,
              value: verificationToken,
            },
          },
        },
      });

      return domain;
    }),

  // Verify domain
  verifyDomain: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.websiteDomain.findUnique({
        where: { id: input.domainId },
        include: { website: true },
      });

      if (!domain || domain.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Domain not found",
        });
      }

      // In production, this would actually check DNS records
      // For now, we'll simulate verification
      // const isVerified = await checkDNSRecords(domain.domain, domain.verificationToken);

      // Simulating successful verification
      const updated = await prisma.websiteDomain.update({
        where: { id: input.domainId },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      return updated;
    }),

  // Remove domain
  removeDomain: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.websiteDomain.findUnique({
        where: { id: input.domainId },
        include: { website: true },
      });

      if (!domain || domain.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Domain not found",
        });
      }

      await prisma.websiteDomain.delete({
        where: { id: input.domainId },
      });

      return { success: true };
    }),

  // Set primary domain
  setPrimaryDomain: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.websiteDomain.findUnique({
        where: { id: input.domainId },
        include: { website: true },
      });

      if (!domain || domain.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Domain not found",
        });
      }

      if (!domain.verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Domain must be verified before setting as primary",
        });
      }

      // Unset other primary domains
      await prisma.websiteDomain.updateMany({
        where: { websiteId: domain.websiteId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Set this as primary
      await prisma.websiteDomain.update({
        where: { id: input.domainId },
        data: { isPrimary: true },
      });

      // Update website custom domain
      await prisma.website.update({
        where: { id: domain.websiteId },
        data: { customDomain: domain.domain },
      });

      return { success: true };
    }),

  // Trigger deployment
  deploy: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        commitHash: z.string().optional(),
        commitMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      // Get latest deploy number
      const lastDeploy = await prisma.websiteDeployment.findFirst({
        where: { websiteId: input.websiteId },
        orderBy: { deployNumber: "desc" },
      });

      const deployNumber = (lastDeploy?.deployNumber || 0) + 1;

      const deployment = await prisma.websiteDeployment.create({
        data: {
          websiteId: input.websiteId,
          deployNumber,
          commitHash: input.commitHash,
          commitMessage: input.commitMessage,
          branch: website.gitBranch,
          status: "pending",
          triggeredBy: ctx.user.id,
          triggerType: "manual",
        },
      });

      // Update website status
      await prisma.website.update({
        where: { id: input.websiteId },
        data: { status: "DEPLOYING" },
      });

      // In production, this would trigger actual deployment process
      // For now, simulate deployment success after creation
      setTimeout(async () => {
        await prisma.websiteDeployment.update({
          where: { id: deployment.id },
          data: {
            status: "success",
            completedAt: new Date(),
            buildDuration: 30,
            deployDuration: 10,
          },
        });

        await prisma.website.update({
          where: { id: input.websiteId },
          data: {
            status: "ACTIVE",
            lastDeployAt: new Date(),
            lastDeployCommit: input.commitHash,
          },
        });
      }, 2000);

      return deployment;
    }),

  // Rollback to previous deployment
  rollback: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        deploymentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const targetDeployment = await prisma.websiteDeployment.findFirst({
        where: { id: input.deploymentId, websiteId: input.websiteId, status: "success" },
      });

      if (!targetDeployment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deployment not found",
        });
      }

      // Get latest deploy number
      const lastDeploy = await prisma.websiteDeployment.findFirst({
        where: { websiteId: input.websiteId },
        orderBy: { deployNumber: "desc" },
      });

      const deployment = await prisma.websiteDeployment.create({
        data: {
          websiteId: input.websiteId,
          deployNumber: (lastDeploy?.deployNumber || 0) + 1,
          commitHash: targetDeployment.commitHash,
          commitMessage: `Rollback to deployment #${targetDeployment.deployNumber}`,
          branch: targetDeployment.branch,
          status: "pending",
          triggeredBy: ctx.user.id,
          triggerType: "manual",
          isRollback: true,
          rollbackFrom: input.deploymentId,
        },
      });

      return deployment;
    }),

  // Get deployment logs
  getDeploymentLogs: protectedProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const deployment = await prisma.websiteDeployment.findUnique({
        where: { id: input.deploymentId },
        include: { website: true },
      });

      if (!deployment || deployment.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deployment not found",
        });
      }

      return {
        buildLogs: deployment.buildLogs,
        deployLogs: deployment.deployLogs,
        errorMessage: deployment.errorMessage,
      };
    }),

  // Create backup
  createBackup: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        name: z.string().max(100),
        type: z.enum(["full", "incremental", "database"]).default("full"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const r2Key = `backups/${website.id}/${Date.now()}-${nanoid(8)}.tar.gz`;

      const backup = await prisma.websiteBackup.create({
        data: {
          websiteId: input.websiteId,
          name: input.name,
          type: input.type,
          r2Key,
          size: BigInt(0), // Will be updated after backup completes
          status: "pending",
          isAutomatic: false,
        },
      });

      // In production, this would trigger actual backup process
      // Simulate backup completion
      setTimeout(async () => {
        await prisma.websiteBackup.update({
          where: { id: backup.id },
          data: {
            status: "completed",
            completedAt: new Date(),
            size: BigInt(Math.floor(Math.random() * 100000000)), // Random size for demo
          },
        });
      }, 5000);

      return backup;
    }),

  // List backups
  listBackups: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const { page, limit } = input;

      const [backups, total] = await Promise.all([
        prisma.websiteBackup.findMany({
          where: { websiteId: input.websiteId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.websiteBackup.count({ where: { websiteId: input.websiteId } }),
      ]);

      return {
        backups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Restore from backup
  restoreBackup: protectedProcedure
    .input(z.object({ backupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const backup = await prisma.websiteBackup.findUnique({
        where: { id: input.backupId },
        include: { website: true },
      });

      if (!backup || backup.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Backup not found",
        });
      }

      if (backup.status !== "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Backup is not ready for restore",
        });
      }

      // In production, this would trigger actual restore process
      return { success: true, message: "Restore initiated" };
    }),

  // Delete backup
  deleteBackup: protectedProcedure
    .input(z.object({ backupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const backup = await prisma.websiteBackup.findUnique({
        where: { id: input.backupId },
        include: { website: true },
      });

      if (!backup || backup.website.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Backup not found",
        });
      }

      await prisma.websiteBackup.update({
        where: { id: input.backupId },
        data: { status: "deleted" },
      });

      // In production, also delete from R2 storage

      return { success: true };
    }),

  // Get website analytics
  getAnalytics: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      })
    )
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await prisma.websiteAnalytics.findMany({
        where: {
          websiteId: input.websiteId,
          date: { gte: startDate },
        },
        orderBy: { date: "asc" },
      });

      // Aggregate totals
      const totals = analytics.reduce(
        (acc, day) => ({
          pageViews: acc.pageViews + day.pageViews,
          uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
          sessions: acc.sessions + day.sessions,
        }),
        { pageViews: 0, uniqueVisitors: 0, sessions: 0 }
      );

      return {
        daily: analytics,
        totals,
      };
    }),

  // Admin: List all websites
  adminList: adminProcedure
    .input(
      z.object({
        status: z.enum(["CREATING", "DEPLOYING", "ACTIVE", "SUSPENDED", "MAINTENANCE", "DELETED"]).optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { status, search, page, limit } = input;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { subdomain: { contains: search, mode: "insensitive" } },
          { customDomain: { contains: search, mode: "insensitive" } },
        ];
      }

      const [websites, total] = await Promise.all([
        prisma.website.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.website.count({ where }),
      ]);

      return {
        websites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Update website status
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        websiteId: z.string(),
        status: z.enum(["ACTIVE", "SUSPENDED", "MAINTENANCE"]),
      })
    )
    .mutation(async ({ input }) => {
      const website = await prisma.website.update({
        where: { id: input.websiteId },
        data: { status: input.status },
      });

      return website;
    }),

  // Admin: Get hosting stats
  adminStats: adminProcedure.query(async () => {
    const [
      totalWebsites,
      activeWebsites,
      totalDeployments,
      totalDiskUsage,
      totalBandwidth,
    ] = await Promise.all([
      prisma.website.count({ where: { deletedAt: null } }),
      prisma.website.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.websiteDeployment.count(),
      prisma.website.aggregate({
        where: { deletedAt: null },
        _sum: { diskUsage: true },
      }),
      prisma.website.aggregate({
        where: { deletedAt: null },
        _sum: { bandwidthUsage: true },
      }),
    ]);

    return {
      totalWebsites,
      activeWebsites,
      totalDeployments,
      totalDiskUsage: Number(totalDiskUsage._sum.diskUsage || 0),
      totalBandwidth: Number(totalBandwidth._sum.bandwidthUsage || 0),
    };
  }),
});

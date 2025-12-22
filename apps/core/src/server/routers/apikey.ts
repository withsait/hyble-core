import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { createTRPCRouter, verifiedProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";

// Helper to generate API key
function generateApiKey(prefix: string = "hbl"): { key: string; hash: string } {
  const rawKey = crypto.randomBytes(32).toString("hex");
  const key = `${prefix}_${rawKey}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, hash };
}

// ==================== API KEY ROUTER ====================

export const apiKeyRouter = createTRPCRouter({
  // -------------------- LIST API KEYS --------------------
  list: verifiedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        includeRevoked: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id,
      };

      if (input.organizationId) {
        where.organizationId = input.organizationId;
      }

      if (!input.includeRevoked) {
        where.revokedAt = null;
      }

      const apiKeys = await prisma.apiKey.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          scopes: true,
          expiresAt: true,
          lastUsedAt: true,
          revokedAt: true,
          createdAt: true,
          organization: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { usageLogs: true },
          },
        },
      });

      return apiKeys;
    }),

  // -------------------- GET API KEY DETAILS --------------------
  get: verifiedProcedure
    .input(z.object({ keyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: input.keyId,
          userId: ctx.user.id,
        },
        include: {
          organization: {
            select: { id: true, name: true, slug: true },
          },
          usageLogs: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      return apiKey;
    }),

  // -------------------- CREATE API KEY --------------------
  create: verifiedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        scopes: z.array(z.string()).min(1),
        expiresAt: z.date().optional(),
        organizationId: z.string().optional(),
        rateLimitPerMinute: z.number().min(1).max(10000).default(60),
        rateLimitPerDay: z.number().min(1).max(1000000).default(10000),
        allowedIps: z.array(z.string()).optional(),
        allowedOrigins: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If organization scoped, verify membership
      if (input.organizationId) {
        const membership = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: input.organizationId,
              userId: ctx.user.id,
            },
          },
        });

        if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You must be an admin or owner to create organization API keys",
          });
        }
      }

      // Generate API key
      const { key, hash } = generateApiKey();
      const keyPrefix = key.substring(0, 12); // hbl_XXXXXXXX

      // Create API key
      const apiKey = await prisma.apiKey.create({
        data: {
          userId: ctx.user.id,
          organizationId: input.organizationId,
          name: input.name,
          keyHash: hash,
          keyPrefix,
          scopes: input.scopes,
          expiresAt: input.expiresAt,
          rateLimitPerMinute: input.rateLimitPerMinute,
          rateLimitPerDay: input.rateLimitPerDay,
          allowedIps: input.allowedIps || [],
          allowedOrigins: input.allowedOrigins || [],
        },
      });

      // Log the creation
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "API_KEY_CREATE",
          status: "SUCCESS",
          metadata: JSON.parse(
            JSON.stringify({
              keyId: apiKey.id,
              name: input.name,
              scopes: input.scopes,
              organizationId: input.organizationId,
            })
          ),
        },
      });

      // Return the key ONCE (it can never be retrieved again)
      return {
        id: apiKey.id,
        name: apiKey.name,
        key, // This is the only time the full key is returned
        keyPrefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        message: "Store this API key securely. It will not be shown again.",
      };
    }),

  // -------------------- UPDATE API KEY --------------------
  update: verifiedProcedure
    .input(
      z.object({
        keyId: z.string(),
        name: z.string().min(1).max(100).optional(),
        scopes: z.array(z.string()).min(1).optional(),
        expiresAt: z.date().optional().nullable(),
        rateLimitPerMinute: z.number().min(1).max(10000).optional(),
        rateLimitPerDay: z.number().min(1).max(1000000).optional(),
        allowedIps: z.array(z.string()).optional(),
        allowedOrigins: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { keyId, ...updateData } = input;

      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: keyId,
          userId: ctx.user.id,
          revokedAt: null,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found or already revoked",
        });
      }

      const updated = await prisma.apiKey.update({
        where: { id: keyId },
        data: updateData as any,
      });

      // Log the update
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "API_KEY_UPDATE",
          status: "SUCCESS",
          metadata: JSON.parse(
            JSON.stringify({
              keyId,
              changes: Object.keys(updateData),
            })
          ),
        },
      });

      return updated;
    }),

  // -------------------- REVOKE API KEY --------------------
  revoke: verifiedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: input.keyId,
          userId: ctx.user.id,
          revokedAt: null,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found or already revoked",
        });
      }

      await prisma.apiKey.update({
        where: { id: input.keyId },
        data: { revokedAt: new Date() },
      });

      // Log the revocation
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "API_KEY_REVOKE",
          status: "SUCCESS",
          metadata: JSON.parse(
            JSON.stringify({
              keyId: input.keyId,
              name: apiKey.name,
            })
          ),
        },
      });

      return { success: true, message: "API key revoked successfully" };
    }),

  // -------------------- REGENERATE API KEY --------------------
  regenerate: verifiedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: input.keyId,
          userId: ctx.user.id,
          revokedAt: null,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found or already revoked",
        });
      }

      // Generate new key
      const { key, hash } = generateApiKey();
      const keyPrefix = key.substring(0, 12);

      await prisma.apiKey.update({
        where: { id: input.keyId },
        data: {
          keyHash: hash,
          keyPrefix,
          lastUsed: null, // Reset usage
          lastUsedAt: null,
        },
      });

      // Log the regeneration
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "API_KEY_REGENERATE",
          status: "SUCCESS",
          metadata: JSON.parse(
            JSON.stringify({
              keyId: input.keyId,
              name: apiKey.name,
            })
          ),
        },
      });

      return {
        id: apiKey.id,
        name: apiKey.name,
        key, // New key - only shown once
        keyPrefix,
        message: "API key regenerated. Store this key securely.",
      };
    }),

  // -------------------- GET USAGE STATS --------------------
  getUsageStats: verifiedProcedure
    .input(
      z.object({
        keyId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: input.keyId,
          userId: ctx.user.id,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      const where: any = { apiKeyId: input.keyId };
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const [totalRequests, successfulRequests, failedRequests, recentUsage] =
        await Promise.all([
          prisma.apiKeyUsage.count({ where }),
          prisma.apiKeyUsage.count({
            where: { ...where, statusCode: { lt: 400 } },
          }),
          prisma.apiKeyUsage.count({
            where: { ...where, statusCode: { gte: 400 } },
          }),
          prisma.apiKeyUsage.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              endpoint: true,
              method: true,
              statusCode: true,
              responseTime: true,
              ipAddress: true,
              createdAt: true,
            },
          }),
        ]);

      // Group by endpoint
      const endpointStats = await prisma.apiKeyUsage.groupBy({
        by: ["endpoint"],
        where,
        _count: true,
        _avg: { responseTime: true },
      });

      return {
        summary: {
          total: totalRequests,
          successful: successfulRequests,
          failed: failedRequests,
          successRate:
            totalRequests > 0
              ? ((successfulRequests / totalRequests) * 100).toFixed(2)
              : "0",
        },
        endpointStats: endpointStats.map((stat) => ({
          endpoint: stat.endpoint,
          count: stat._count,
          avgResponseTime: stat._avg?.responseTime ?? null,
        })),
        recentUsage: recentUsage.map((usage) => ({
          ...usage,
          ipAddress: usage.ipAddress
            ? usage.ipAddress.replace(/\.\d+$/, ".xxx")
            : null,
        })),
      };
    }),

  // -------------------- VERIFY API KEY (Internal Use) --------------------
  verify: verifiedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const hash = crypto.createHash("sha256").update(input.key).digest("hex");

      const apiKey = await prisma.apiKey.findFirst({
        where: {
          keyHash: hash,
          revokedAt: null,
        },
        include: {
          user: {
            select: { id: true, status: true, trustLevel: true },
          },
          organization: {
            select: { id: true, slug: true },
          },
        },
      });

      if (!apiKey) {
        return { valid: false, reason: "Invalid API key" };
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { valid: false, reason: "API key expired" };
      }

      // Check user status
      if (!apiKey.user || apiKey.user.status !== "ACTIVE") {
        return { valid: false, reason: "User account is not active" };
      }

      // Update last used
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date(), lastUsedAt: new Date() },
      });

      return {
        valid: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          scopes: apiKey.scopes,
          userId: apiKey.userId,
          organizationId: apiKey.organizationId,
          rateLimitPerMinute: apiKey.rateLimitPerMinute,
          rateLimitPerDay: apiKey.rateLimitPerDay,
          allowedIps: apiKey.allowedIps,
          allowedOrigins: apiKey.allowedOrigins,
        },
      };
    }),

  // -------------------- GET AVAILABLE SCOPES --------------------
  getAvailableScopes: verifiedProcedure.query(async () => {
    // Return available API scopes
    return {
      scopes: [
        { id: "read:user", name: "Read User", description: "Read user profile data" },
        { id: "write:user", name: "Write User", description: "Update user profile" },
        { id: "read:organization", name: "Read Organization", description: "Read organization data" },
        { id: "write:organization", name: "Write Organization", description: "Manage organization" },
        { id: "read:members", name: "Read Members", description: "List organization members" },
        { id: "write:members", name: "Write Members", description: "Manage organization members" },
        { id: "read:invites", name: "Read Invites", description: "List invitations" },
        { id: "write:invites", name: "Write Invites", description: "Send invitations" },
        { id: "read:analytics", name: "Read Analytics", description: "Access analytics data" },
        { id: "webhook:manage", name: "Manage Webhooks", description: "Configure webhooks" },
      ],
    };
  }),
});

export type ApiKeyRouter = typeof apiKeyRouter;

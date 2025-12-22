import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Helper: Generate license key (XXXX-XXXX-XXXX-XXXX format)
function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString("hex").toUpperCase());
  }
  return segments.join("-");
}

export const licenseRouter = createTRPCRouter({
  // Get user's licenses
  getMyLicenses: protectedProcedure.query(async ({ ctx }) => {
    const licenses = await prisma.license.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { activations: { where: { isActive: true } } },
        },
      },
    });

    return licenses.map((license) => ({
      id: license.id,
      licenseKey: license.licenseKey,
      type: license.type,
      status: license.status,
      productName: license.productName,
      variantName: license.variantName,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      maxActivations: license.maxActivations,
      activeActivations: license._count.activations,
      createdAt: license.createdAt,
    }));
  }),

  // Get license details
  getLicense: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const license = await prisma.license.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          activations: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lisans bulunamadı",
        });
      }

      return {
        id: license.id,
        licenseKey: license.licenseKey,
        type: license.type,
        status: license.status,
        productId: license.productId,
        productName: license.productName,
        variantName: license.variantName,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt,
        lastCheckedAt: license.lastCheckedAt,
        maxActivations: license.maxActivations,
        activationCount: license.activationCount,
        allowedDomains: license.allowedDomains,
        allowedIps: license.allowedIps,
        activations: license.activations.map((a) => ({
          id: a.id,
          machineId: a.machineId,
          hostname: a.hostname,
          domain: a.domain,
          ipAddress: a.ipAddress,
          createdAt: a.createdAt,
        })),
        createdAt: license.createdAt,
      };
    }),

  // Activate license (used by client applications)
  activate: protectedProcedure
    .input(
      z.object({
        licenseKey: z.string(),
        machineId: z.string().optional(),
        hostname: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const license = await prisma.license.findUnique({
        where: { licenseKey: input.licenseKey },
        include: {
          activations: {
            where: { isActive: true },
          },
        },
      });

      if (!license) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geçersiz lisans anahtarı",
        });
      }

      if (license.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu lisans size ait değil",
        });
      }

      if (license.status !== "ACTIVE" && license.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Lisans durumu: ${license.status}`,
        });
      }

      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        // Update status to expired
        await prisma.license.update({
          where: { id: license.id },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lisans süresi dolmuş",
        });
      }

      // Check activation limit
      if (license.activations.length >= license.maxActivations) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maksimum aktivasyon sayısına ulaşıldı (${license.maxActivations})`,
        });
      }

      // Check domain restriction
      if (license.allowedDomains.length > 0 && input.domain) {
        if (!license.allowedDomains.includes(input.domain)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu domain için lisans geçerli değil",
          });
        }
      }

      // Check for existing activation with same machine ID
      if (input.machineId) {
        const existingActivation = license.activations.find(
          (a) => a.machineId === input.machineId
        );
        if (existingActivation) {
          return {
            success: true,
            activationId: existingActivation.id,
            message: "Bu cihaz zaten aktif",
          };
        }
      }

      // Create activation
      const activation = await prisma.licenseActivation.create({
        data: {
          licenseId: license.id,
          machineId: input.machineId,
          hostname: input.hostname,
          domain: input.domain,
          ipAddress: "0.0.0.0", // Will be set by client
        },
      });

      // Update license
      await prisma.license.update({
        where: { id: license.id },
        data: {
          status: "ACTIVE",
          activatedAt: license.activatedAt || new Date(),
          activationCount: { increment: 1 },
          lastCheckedAt: new Date(),
        },
      });

      return {
        success: true,
        activationId: activation.id,
        message: "Lisans başarıyla aktive edildi",
      };
    }),

  // Deactivate specific activation
  deactivate: protectedProcedure
    .input(z.object({ activationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const activation = await prisma.licenseActivation.findUnique({
        where: { id: input.activationId },
        include: { license: true },
      });

      if (!activation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aktivasyon bulunamadı",
        });
      }

      if (activation.license.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu aktivasyon size ait değil",
        });
      }

      await prisma.licenseActivation.update({
        where: { id: input.activationId },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: ctx.user.id,
          deactivateReason: "Kullanıcı tarafından deaktive edildi",
        },
      });

      return { success: true };
    }),

  // Verify license (public API for applications)
  verify: protectedProcedure
    .input(
      z.object({
        licenseKey: z.string(),
        machineId: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const license = await prisma.license.findUnique({
        where: { licenseKey: input.licenseKey },
        include: {
          activations: {
            where: { isActive: true },
          },
        },
      });

      if (!license) {
        return { valid: false, reason: "INVALID_KEY" };
      }

      if (license.status === "REVOKED") {
        return { valid: false, reason: "REVOKED" };
      }

      if (license.status === "SUSPENDED") {
        return { valid: false, reason: "SUSPENDED" };
      }

      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        return { valid: false, reason: "EXPIRED" };
      }

      // Check machine ID if provided
      if (input.machineId && license.activations.length > 0) {
        const hasValidActivation = license.activations.some(
          (a) => a.machineId === input.machineId
        );
        if (!hasValidActivation) {
          return { valid: false, reason: "MACHINE_NOT_ACTIVATED" };
        }
      }

      // Check domain if provided
      if (input.domain && license.allowedDomains.length > 0) {
        if (!license.allowedDomains.includes(input.domain)) {
          return { valid: false, reason: "DOMAIN_NOT_ALLOWED" };
        }
      }

      // Update last checked
      await prisma.license.update({
        where: { id: license.id },
        data: { lastCheckedAt: new Date() },
      });

      return {
        valid: true,
        type: license.type,
        expiresAt: license.expiresAt,
        productName: license.productName,
      };
    }),

  // Admin: Create license manually
  adminCreate: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        variantId: z.string().optional(),
        orderId: z.string().optional(),
        type: z.enum(["PERPETUAL", "SUBSCRIPTION", "TRIAL", "DEVELOPER"]),
        status: z.enum(["ACTIVE", "PENDING"]).default("PENDING"),
        expiresAt: z.date().optional(),
        maxActivations: z.number().min(1).default(1),
        allowedDomains: z.array(z.string()).default([]),
        allowedIps: z.array(z.string()).default([]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get product info for caching
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        include: {
          variants: input.variantId
            ? { where: { id: input.variantId } }
            : undefined,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ürün bulunamadı",
        });
      }

      const variant = product.variants?.[0];

      const license = await prisma.license.create({
        data: {
          licenseKey: generateLicenseKey(),
          userId: input.userId,
          productId: input.productId,
          variantId: input.variantId,
          orderId: input.orderId,
          type: input.type,
          status: input.status,
          expiresAt: input.expiresAt,
          maxActivations: input.maxActivations,
          allowedDomains: input.allowedDomains,
          allowedIps: input.allowedIps,
          productName: product.nameTr,
          variantName: variant?.name,
          notes: input.notes,
        },
      });

      return {
        id: license.id,
        licenseKey: license.licenseKey,
      };
    }),

  // Admin: Update license
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "REVOKED", "PENDING"]).optional(),
        expiresAt: z.date().optional(),
        maxActivations: z.number().min(1).optional(),
        allowedDomains: z.array(z.string()).optional(),
        allowedIps: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await prisma.license.update({
        where: { id },
        data,
      });

      return { success: true };
    }),

  // Admin: Revoke license
  adminRevoke: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Deactivate all activations
      await prisma.licenseActivation.updateMany({
        where: { licenseId: input.id, isActive: true },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: "system",
          deactivateReason: input.reason || "Lisans iptal edildi",
        },
      });

      // Revoke license
      await prisma.license.update({
        where: { id: input.id },
        data: {
          status: "REVOKED",
          notes: input.reason,
        },
      });

      return { success: true };
    }),

  // Admin: List all licenses
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "REVOKED", "PENDING"]).optional(),
        userId: z.string().optional(),
        productId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const licenses = await prisma.license.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.userId && { userId: input.userId }),
          ...(input.productId && { productId: input.productId }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { activations: { where: { isActive: true } } },
          },
        },
      });

      let nextCursor: string | undefined;
      if (licenses.length > input.limit) {
        const nextItem = licenses.pop();
        nextCursor = nextItem?.id;
      }

      return {
        licenses: licenses.map((license) => ({
          id: license.id,
          licenseKey: license.licenseKey,
          userId: license.userId,
          type: license.type,
          status: license.status,
          productName: license.productName,
          variantName: license.variantName,
          expiresAt: license.expiresAt,
          maxActivations: license.maxActivations,
          activeActivations: license._count.activations,
          createdAt: license.createdAt,
        })),
        nextCursor,
      };
    }),
});

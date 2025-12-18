import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { generateDownloadUrl, uploadToR2, deleteFromR2 } from "@/lib/r2";

// Helper: Generate secure download token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const downloadRouter = createTRPCRouter({
  // Get user's available downloads (from purchased products)
  getMyDownloads: protectedProcedure.query(async ({ ctx }) => {
    // Get user's completed orders with digital products
    const orders = await prisma.order.findMany({
      where: {
        userId: ctx.user.id,
        paymentStatus: "CAPTURED",
      },
      select: {
        id: true,
        orderNumber: true,
        items: {
          select: {
            productId: true,
            variantId: true,
            productName: true,
            variantName: true,
          },
        },
      },
    });

    // Get all product IDs from orders
    const productIds = orders.flatMap((o) => o.items.map((i) => i.productId));
    const variantIds = orders.flatMap((o) => o.items.map((i) => i.variantId).filter(Boolean)) as string[];

    // Get files for these products
    const files = await prisma.productFile.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { productId: { in: productIds }, variantId: null },
          { variantId: { in: variantIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user's download tokens
    const tokens = await prisma.downloadToken.findMany({
      where: {
        userId: ctx.user.id,
        fileId: { in: files.map((f) => f.id) },
      },
    });

    const tokenMap = new Map(tokens.map((t) => [t.fileId, t]));

    return files.map((file) => {
      const token = tokenMap.get(file.id);
      const order = orders.find((o) =>
        o.items.some((i) =>
          i.productId === file.productId ||
          (file.variantId && i.variantId === file.variantId)
        )
      );

      return {
        id: file.id,
        name: file.name,
        filename: file.filename,
        contentType: file.contentType,
        size: file.size,
        version: file.version,
        changelog: file.changelog,
        productId: file.productId,
        variantId: file.variantId,
        orderNumber: order?.orderNumber,
        downloadCount: token?.downloadCount || 0,
        maxDownloads: token?.maxDownloads || 5,
        hasToken: !!token,
        tokenExpired: token ? new Date(token.expiresAt) < new Date() : false,
        createdAt: file.createdAt,
      };
    });
  }),

  // Create download token for a file
  createToken: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if file exists
      const file = await prisma.productFile.findUnique({
        where: { id: input.fileId },
      });

      if (!file || file.status !== "ACTIVE") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dosya bulunamadı",
        });
      }

      // Check if user has purchased this product
      const hasAccess = await prisma.order.findFirst({
        where: {
          userId: ctx.user.id,
          paymentStatus: "CAPTURED",
          items: {
            some: {
              OR: [
                { productId: file.productId },
                ...(file.variantId ? [{ variantId: file.variantId }] : []),
              ],
            },
          },
        },
      });

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu dosyaya erişim izniniz yok",
        });
      }

      // Check for existing valid token
      const existingToken = await prisma.downloadToken.findFirst({
        where: {
          fileId: input.fileId,
          userId: ctx.user.id,
          expiresAt: { gt: new Date() },
        },
      });

      // Check if download count is still valid
      if (existingToken && existingToken.downloadCount < existingToken.maxDownloads) {
        return {
          token: existingToken.token,
          expiresAt: existingToken.expiresAt,
          remainingDownloads: existingToken.maxDownloads - existingToken.downloadCount,
        };
      }

      // Create new token (valid for 24 hours, 5 downloads)
      const token = await prisma.downloadToken.create({
        data: {
          token: generateToken(),
          fileId: input.fileId,
          userId: ctx.user.id,
          orderId: hasAccess.id,
          maxDownloads: 5,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return {
        token: token.token,
        expiresAt: token.expiresAt,
        remainingDownloads: token.maxDownloads,
      };
    }),

  // Get download URL using token
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const downloadToken = await prisma.downloadToken.findUnique({
        where: { token: input.token },
        include: { file: true },
      });

      if (!downloadToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geçersiz indirme token'ı",
        });
      }

      if (downloadToken.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu token size ait değil",
        });
      }

      if (new Date(downloadToken.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token süresi dolmuş",
        });
      }

      if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maksimum indirme sayısına ulaşıldı",
        });
      }

      // Update download count
      await prisma.downloadToken.update({
        where: { id: downloadToken.id },
        data: {
          downloadCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      // Generate presigned URL (valid for 1 hour)
      const url = await generateDownloadUrl(downloadToken.file.r2Key, 3600);

      return {
        url,
        filename: downloadToken.file.filename,
        contentType: downloadToken.file.contentType,
        size: downloadToken.file.size,
        remainingDownloads: downloadToken.maxDownloads - downloadToken.downloadCount - 1,
      };
    }),

  // Admin: Upload file for a product
  adminUpload: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        name: z.string(),
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        fileBase64: z.string(), // Base64 encoded file
        version: z.string().default("1.0.0"),
        changelog: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Decode base64 file
      const fileBuffer = Buffer.from(input.fileBase64, "base64");

      // Upload to R2
      const uploaded = await uploadToR2(
        fileBuffer,
        input.filename,
        input.contentType,
        "downloads"
      );

      // Create database record
      const file = await prisma.productFile.create({
        data: {
          productId: input.productId,
          variantId: input.variantId,
          name: input.name,
          filename: input.filename,
          r2Key: uploaded.key,
          r2Url: input.isPublic ? uploaded.url : "",
          contentType: input.contentType,
          size: uploaded.size,
          version: input.version,
          changelog: input.changelog,
          isPublic: input.isPublic,
          checksum: crypto.createHash("md5").update(fileBuffer).digest("hex"),
        },
      });

      return {
        id: file.id,
        url: uploaded.url,
      };
    }),

  // Admin: Delete file
  adminDelete: adminProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ input }) => {
      const file = await prisma.productFile.findUnique({
        where: { id: input.fileId },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dosya bulunamadı",
        });
      }

      // Delete from R2
      await deleteFromR2(file.r2Key);

      // Delete from database (cascade deletes tokens)
      await prisma.productFile.delete({
        where: { id: input.fileId },
      });

      return { success: true };
    }),

  // Admin: Get all files for a product
  adminGetFiles: adminProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const files = await prisma.productFile.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { downloads: true },
          },
        },
      });

      return files.map((file) => ({
        id: file.id,
        name: file.name,
        filename: file.filename,
        contentType: file.contentType,
        size: file.size,
        version: file.version,
        changelog: file.changelog,
        isPublic: file.isPublic,
        status: file.status,
        downloadCount: file._count.downloads,
        createdAt: file.createdAt,
      }));
    }),
});

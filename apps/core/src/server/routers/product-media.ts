// Product Media Management tRPC Router
// Gelişmiş ürün görsel ve video yönetimi

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Enum değerleri
const MediaTypeEnum = z.enum([
  "IMAGE", "VIDEO", "THUMBNAIL", "BANNER", "ICON",
  "GALLERY", "VARIANT", "VIEW_360", "LIFESTYLE", "SIZE_CHART", "INFOGRAPHIC"
]);

const MediaStatusEnum = z.enum(["PENDING", "PROCESSING", "READY", "FAILED", "ARCHIVED"]);
const MediaSourceEnum = z.enum(["UPLOAD", "URL", "AI_GENERATED", "STUDIO"]);

export const productMediaRouter = createTRPCRouter({
  // ======================== PRODUCT MEDIA ========================

  // Get all media for a product
  list: protectedProcedure
    .input(z.object({
      productId: z.string(),
      type: MediaTypeEnum.optional(),
      status: MediaStatusEnum.optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { productId: input.productId };
      if (input.type) where.type = input.type;
      if (input.status) where.status = input.status;

      const media = await prisma.productMedia.findMany({
        where,
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      });

      return { media };
    }),

  // Get single media
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const media = await prisma.productMedia.findUnique({
        where: { id: input.id },
      });

      if (!media) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Media not found" });
      }

      return media;
    }),

  // Admin: Create media entry
  adminCreate: adminProcedure
    .input(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      variantValue: z.string().optional(),
      type: MediaTypeEnum.default("IMAGE"),
      source: MediaSourceEnum.default("UPLOAD"),
      originalUrl: z.string(),
      url: z.string(),
      thumbnailUrl: z.string().optional(),
      mediumUrl: z.string().optional(),
      largeUrl: z.string().optional(),
      webpUrl: z.string().optional(),
      avifUrl: z.string().optional(),
      alt: z.string().optional(),
      title: z.string().optional(),
      caption: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      aspectRatio: z.string().optional(),
      blurHash: z.string().optional(),
      dominantColor: z.string().optional(),
      colorPalette: z.array(z.string()).optional(),
      aiTags: z.array(z.string()).optional(),
      isPrimary: z.boolean().default(false),
      isHover: z.boolean().default(false),
      isFeatured: z.boolean().default(false),
      sortOrder: z.number().default(0),
      r2Key: z.string().optional(),
      r2Bucket: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // If setting as primary, unset other primaries
      if (input.isPrimary) {
        await prisma.productMedia.updateMany({
          where: { productId: input.productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // If setting as hover, unset other hover
      if (input.isHover) {
        await prisma.productMedia.updateMany({
          where: { productId: input.productId, isHover: true },
          data: { isHover: false },
        });
      }

      const media = await prisma.productMedia.create({
        data: {
          ...input,
          status: "READY",
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_MEDIA_CREATE",
          details: {
            targetType: "ProductMedia",
            targetId: media.id,
            productId: input.productId,
            type: input.type,
          },
        },
      });

      return media;
    }),

  // Admin: Update media
  adminUpdate: adminProcedure
    .input(z.object({
      id: z.string(),
      type: MediaTypeEnum.optional(),
      alt: z.string().optional(),
      title: z.string().optional(),
      caption: z.string().optional(),
      isPrimary: z.boolean().optional(),
      isHover: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      sortOrder: z.number().optional(),
      variantId: z.string().nullable().optional(),
      variantValue: z.string().nullable().optional(),
      aiTags: z.array(z.string()).optional(),
      status: MediaStatusEnum.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await prisma.productMedia.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Media not found" });
      }

      // Handle primary toggle
      if (data.isPrimary === true) {
        await prisma.productMedia.updateMany({
          where: { productId: existing.productId, isPrimary: true, id: { not: id } },
          data: { isPrimary: false },
        });
      }

      // Handle hover toggle
      if (data.isHover === true) {
        await prisma.productMedia.updateMany({
          where: { productId: existing.productId, isHover: true, id: { not: id } },
          data: { isHover: false },
        });
      }

      const updated = await prisma.productMedia.update({
        where: { id },
        data,
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_MEDIA_UPDATE",
          details: {
            targetType: "ProductMedia",
            targetId: id,
            changes: Object.keys(data),
          },
        },
      });

      return updated;
    }),

  // Admin: Delete media
  adminDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const media = await prisma.productMedia.findUnique({
        where: { id: input.id },
      });

      if (!media) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Media not found" });
      }

      await prisma.productMedia.delete({
        where: { id: input.id },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_MEDIA_DELETE",
          details: {
            targetType: "ProductMedia",
            targetId: input.id,
            productId: media.productId,
            url: media.url,
          },
        },
      });

      return { success: true };
    }),

  // Admin: Bulk delete
  adminBulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.productMedia.deleteMany({
        where: { id: { in: input.ids } },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_MEDIA_BULK_DELETE",
          details: {
            targetType: "ProductMedia",
            count: input.ids.length,
            ids: input.ids,
          },
        },
      });

      return { success: true, deleted: input.ids.length };
    }),

  // Admin: Reorder media
  adminReorder: adminProcedure
    .input(z.object({
      productId: z.string(),
      order: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ input }) => {
      await Promise.all(
        input.order.map((item) =>
          prisma.productMedia.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return { success: true };
    }),

  // Admin: Set primary image
  adminSetPrimary: adminProcedure
    .input(z.object({
      productId: z.string(),
      mediaId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Unset current primary
      await prisma.productMedia.updateMany({
        where: { productId: input.productId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Set new primary
      const updated = await prisma.productMedia.update({
        where: { id: input.mediaId },
        data: { isPrimary: true },
      });

      return updated;
    }),

  // Admin: Set hover image
  adminSetHover: adminProcedure
    .input(z.object({
      productId: z.string(),
      mediaId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Unset current hover
      await prisma.productMedia.updateMany({
        where: { productId: input.productId, isHover: true },
        data: { isHover: false },
      });

      // Set new hover
      const updated = await prisma.productMedia.update({
        where: { id: input.mediaId },
        data: { isHover: true },
      });

      return updated;
    }),

  // ======================== PRODUCT VIDEO ========================

  // Admin: List videos
  adminListVideos: adminProcedure
    .input(z.object({
      productId: z.string(),
      status: MediaStatusEnum.optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { productId: input.productId };
      if (input.status) where.status = input.status;

      const videos = await prisma.productVideo.findMany({
        where,
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      });

      return { videos };
    }),

  // Admin: Create video
  adminCreateVideo: adminProcedure
    .input(z.object({
      productId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string(),
      hlsUrl: z.string().optional(),
      dashUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      posterUrl: z.string().optional(),
      youtubeId: z.string().optional(),
      vimeoId: z.string().optional(),
      wistiaId: z.string().optional(),
      duration: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      codec: z.string().optional(),
      bitrate: z.number().optional(),
      autoPlay: z.boolean().default(false),
      loop: z.boolean().default(false),
      muted: z.boolean().default(true),
      controls: z.boolean().default(true),
      isPrimary: z.boolean().default(false),
      sortOrder: z.number().default(0),
      r2Key: z.string().optional(),
      r2Bucket: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify product
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // Handle primary toggle
      if (input.isPrimary) {
        await prisma.productVideo.updateMany({
          where: { productId: input.productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const video = await prisma.productVideo.create({
        data: {
          ...input,
          status: "READY",
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_VIDEO_CREATE",
          details: {
            targetType: "ProductVideo",
            targetId: video.id,
            productId: input.productId,
          },
        },
      });

      return video;
    }),

  // Admin: Delete video
  adminDeleteVideo: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const video = await prisma.productVideo.findUnique({
        where: { id: input.id },
      });

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      await prisma.productVideo.delete({
        where: { id: input.id },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_VIDEO_DELETE",
          details: {
            targetType: "ProductVideo",
            targetId: input.id,
            productId: video.productId,
          },
        },
      });

      return { success: true };
    }),

  // ======================== 360° VIEW ========================

  // Admin: List 360 views
  adminList360Views: adminProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const views = await prisma.product360View.findMany({
        where: { productId: input.productId },
        orderBy: { sortOrder: "asc" },
      });

      return { views };
    }),

  // Admin: Create 360 view
  adminCreate360View: adminProcedure
    .input(z.object({
      productId: z.string(),
      name: z.string().optional(),
      frameCount: z.number().min(2).max(360),
      autoRotate: z.boolean().default(true),
      rotationSpeed: z.number().default(50),
      enableZoom: z.boolean().default(true),
      maxZoom: z.number().default(3.0),
      enableDrag: z.boolean().default(true),
      dragSensitivity: z.number().default(1.0),
      baseUrl: z.string(),
      format: z.string().default("jpg"),
      width: z.number().optional(),
      height: z.number().optional(),
      preloadAll: z.boolean().default(false),
      lowResUrls: z.array(z.string()).optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify product
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const view = await prisma.product360View.create({
        data: {
          ...input,
          isActive: true,
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_360_CREATE",
          details: {
            targetType: "Product360View",
            targetId: view.id,
            productId: input.productId,
            frameCount: input.frameCount,
          },
        },
      });

      return view;
    }),

  // Admin: Update 360 view
  adminUpdate360View: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      frameCount: z.number().optional(),
      autoRotate: z.boolean().optional(),
      rotationSpeed: z.number().optional(),
      enableZoom: z.boolean().optional(),
      maxZoom: z.number().optional(),
      enableDrag: z.boolean().optional(),
      dragSensitivity: z.number().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await prisma.product360View.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "360 view not found" });
      }

      const updated = await prisma.product360View.update({
        where: { id },
        data,
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_360_UPDATE",
          details: {
            targetType: "Product360View",
            targetId: id,
            changes: Object.keys(data),
          },
        },
      });

      return updated;
    }),

  // Admin: Delete 360 view
  adminDelete360View: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const view = await prisma.product360View.findUnique({
        where: { id: input.id },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND", message: "360 view not found" });
      }

      await prisma.product360View.delete({
        where: { id: input.id },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PRODUCT_360_DELETE",
          details: {
            targetType: "Product360View",
            targetId: input.id,
            productId: view.productId,
          },
        },
      });

      return { success: true };
    }),

  // ======================== PROCESSING JOBS ========================

  // Admin: Get processing jobs for a media
  adminGetProcessingJobs: adminProcedure
    .input(z.object({
      mediaId: z.string(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { mediaId: input.mediaId };
      if (input.status) where.status = input.status;

      const jobs = await prisma.mediaProcessingJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return { jobs };
    }),

  // Admin: Create processing job
  adminCreateProcessingJob: adminProcedure
    .input(z.object({
      mediaId: z.string(),
      mediaType: z.enum(["ProductMedia", "ProductVideo", "Product360View"]),
      jobType: z.enum(["resize", "optimize", "webp", "avif", "blur_hash", "ai_tag", "remove_bg"]),
      priority: z.number().min(1).max(10).default(5),
    }))
    .mutation(async ({ input }) => {
      const job = await prisma.mediaProcessingJob.create({
        data: {
          ...input,
          status: "PENDING",
        },
      });

      return job;
    }),

  // Admin: Get media statistics
  adminStats: adminProcedure
    .input(z.object({ productId: z.string().optional() }))
    .query(async ({ input }) => {
      const where = input.productId ? { productId: input.productId } : {};

      const [
        totalMedia,
        totalVideos,
        total360Views,
        byType,
        byStatus,
        pendingJobs,
      ] = await Promise.all([
        prisma.productMedia.count({ where }),
        prisma.productVideo.count({ where }),
        prisma.product360View.count({ where }),
        prisma.productMedia.groupBy({
          by: ["type"],
          where,
          _count: true,
        }),
        prisma.productMedia.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
        prisma.mediaProcessingJob.count({
          where: { status: { in: ["PENDING", "PROCESSING"] } },
        }),
      ]);

      return {
        totalMedia,
        totalVideos,
        total360Views,
        byType: byType.map((t) => ({ type: t.type, count: t._count })),
        byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
        pendingJobs,
      };
    }),

  // ======================== VARIANT IMAGES ========================

  // Admin: Get variant images
  adminGetVariantImages: adminProcedure
    .input(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        productId: input.productId,
        type: "VARIANT",
      };
      if (input.variantId) where.variantId = input.variantId;

      const images = await prisma.productMedia.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });

      // Group by variant
      const byVariant: Record<string, typeof images> = {};
      for (const img of images) {
        const key = img.variantValue || "default";
        if (!byVariant[key]) byVariant[key] = [];
        byVariant[key].push(img);
      }

      return { images, byVariant };
    }),

  // Admin: Assign image to variant
  adminAssignToVariant: adminProcedure
    .input(z.object({
      mediaId: z.string(),
      variantId: z.string().nullable(),
      variantValue: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      const updated = await prisma.productMedia.update({
        where: { id: input.mediaId },
        data: {
          variantId: input.variantId,
          variantValue: input.variantValue,
          type: input.variantId ? "VARIANT" : "GALLERY",
        },
      });

      return updated;
    }),
});

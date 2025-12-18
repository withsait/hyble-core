import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";

// Simple nanoid replacement
function nanoid(size: number = 21): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}
import { prisma } from "@hyble/db";

// Lazy initialization for S3/R2 client
let s3Client: S3Client | null = null;

function getS3Client() {
  if (!s3Client) {
    // Support both AWS S3 and Cloudflare R2
    const endpoint = process.env.S3_ENDPOINT || process.env.R2_ENDPOINT;
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";

    s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for R2
    });
  }
  return s3Client;
}

const BUCKET_NAME = process.env.S3_BUCKET || process.env.R2_BUCKET || "hyble-uploads";
const CDN_URL = process.env.CDN_URL || process.env.R2_PUBLIC_URL || "";

// File type configurations
const FILE_CONFIGS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    folder: "images",
  },
  document: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
    folder: "documents",
  },
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    folder: "videos",
  },
  archive: {
    maxSize: 1024 * 1024 * 1024, // 1GB
    allowedTypes: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed", "application/gzip"],
    folder: "archives",
  },
  any: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [] as string[], // Allow all types
    folder: "files",
  },
};

type FileType = keyof typeof FILE_CONFIGS;

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  return ext?.toLowerCase() ?? "";
}

function generateKey(folder: string, filename: string, userId: string): string {
  const ext = getFileExtension(filename);
  const id = nanoid(16);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  return `${folder}/${date}/${userId}/${id}.${ext}`;
}

export const uploadRouter = createTRPCRouter({
  // Get presigned URL for upload
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string(),
        size: z.number().positive(),
        fileType: z.enum(["image", "document", "video", "archive", "any"]).default("any"),
        purpose: z.string().optional(), // e.g., "product-image", "profile-avatar"
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { filename, contentType, size, fileType, purpose } = input;
      const config = FILE_CONFIGS[fileType];

      // Validate file size
      if (size > config.maxSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Dosya boyutu çok büyük. Maksimum: ${Math.round(config.maxSize / 1024 / 1024)}MB`,
        });
      }

      // Validate file type (if not "any")
      if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Bu dosya türü desteklenmiyor. İzin verilen türler: ${config.allowedTypes.join(", ")}`,
        });
      }

      // Generate storage key
      const key = generateKey(config.folder, filename, ctx.user.id);

      // Create presigned URL for upload
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
        Metadata: {
          userId: ctx.user.id,
          originalName: filename,
          purpose: purpose || "general",
        },
      });

      const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 }); // 1 hour

      // Create upload record
      const upload = await prisma.upload.create({
        data: {
          userId: ctx.user.id,
          filename,
          key,
          contentType,
          size,
          status: "pending",
          purpose,
        },
      });

      return {
        uploadId: upload.id,
        uploadUrl,
        key,
        publicUrl: CDN_URL ? `${CDN_URL}/${key}` : null,
      };
    }),

  // Confirm upload completion
  confirmUpload: protectedProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const upload = await prisma.upload.findFirst({
        where: {
          id: input.uploadId,
          userId: ctx.user.id,
          status: "pending",
        },
      });

      if (!upload) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Yükleme bulunamadı",
        });
      }

      // Verify file exists in storage
      try {
        const command = new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: upload.key,
        });
        await getS3Client().send(command);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dosya henüz yüklenmemiş",
        });
      }

      // Update upload status
      const updated = await prisma.upload.update({
        where: { id: input.uploadId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        upload: updated,
        publicUrl: CDN_URL ? `${CDN_URL}/${upload.key}` : null,
      };
    }),

  // Get download URL
  getDownloadUrl: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this file
      const upload = await prisma.upload.findFirst({
        where: {
          key: input.key,
          OR: [
            { userId: ctx.user.id },
            { isPublic: true },
          ],
        },
      });

      if (!upload) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dosya bulunamadı veya erişim izniniz yok",
        });
      }

      // If CDN URL is available and file is public, return it directly
      if (CDN_URL && upload.isPublic) {
        return { url: `${CDN_URL}/${input.key}` };
      }

      // Generate presigned download URL
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: input.key,
      });

      const url = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 }); // 1 hour

      return { url };
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const upload = await prisma.upload.findFirst({
        where: {
          id: input.uploadId,
          userId: ctx.user.id,
        },
      });

      if (!upload) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dosya bulunamadı",
        });
      }

      // Delete from storage
      try {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: upload.key,
        });
        await getS3Client().send(command);
      } catch (err) {
        console.error("Failed to delete from storage:", err);
      }

      // Delete from database
      await prisma.upload.delete({
        where: { id: input.uploadId },
      });

      return { success: true };
    }),

  // List user's uploads
  list: protectedProcedure
    .input(
      z.object({
        purpose: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { purpose, page, limit } = input;

      const where: any = {
        userId: ctx.user.id,
        status: "completed",
      };

      if (purpose) {
        where.purpose = purpose;
      }

      const [uploads, total] = await Promise.all([
        prisma.upload.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.upload.count({ where }),
      ]);

      return {
        uploads: uploads.map((u) => ({
          ...u,
          publicUrl: CDN_URL && u.isPublic ? `${CDN_URL}/${u.key}` : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Get storage stats
  adminStats: adminProcedure.query(async () => {
    const [totalFiles, totalSize, byPurpose] = await Promise.all([
      prisma.upload.count({ where: { status: "completed" } }),
      prisma.upload.aggregate({
        where: { status: "completed" },
        _sum: { size: true },
      }),
      prisma.upload.groupBy({
        by: ["purpose"],
        where: { status: "completed" },
        _count: true,
        _sum: { size: true },
      }),
    ]);

    return {
      totalFiles,
      totalSize: Number(totalSize._sum.size || 0),
      byPurpose: byPurpose.map((p) => ({
        purpose: p.purpose || "general",
        count: p._count,
        size: Number(p._sum.size || 0),
      })),
    };
  }),

  // Admin: Clean up orphaned uploads
  adminCleanup: adminProcedure.mutation(async () => {
    // Find pending uploads older than 24 hours
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const orphaned = await prisma.upload.findMany({
      where: {
        status: "pending",
        createdAt: { lt: cutoff },
      },
    });

    // Delete from storage and database
    for (const upload of orphaned) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: upload.key,
        });
        await getS3Client().send(command);
      } catch {
        // Ignore storage errors
      }

      await prisma.upload.delete({ where: { id: upload.id } });
    }

    return {
      cleaned: orphaned.length,
    };
  }),
});

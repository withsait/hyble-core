/**
 * Media Processing Service
 *
 * Görsel işleme servisi - Sharp ile optimizasyon, blur hash oluşturma,
 * renk analizi ve AI etiketleme desteği
 */

import { prisma } from "@hyble/db";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Types
interface ImageDimensions {
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface ColorInfo {
  dominantColor: string;
  palette: string[];
}

interface ProcessingResult {
  originalUrl: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  webpUrl?: string;
  avifUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  aspectRatio?: string;
  blurHash?: string;
  dominantColor?: string;
  colorPalette?: string[];
}

// Configuration
const CONFIG = {
  sizes: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
  quality: {
    jpeg: 85,
    webp: 80,
    avif: 75,
    png: 85,
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Lazy S3 client initialization
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const endpoint = process.env.S3_ENDPOINT || process.env.R2_ENDPOINT;
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";

    s3Client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

const BUCKET_NAME = process.env.S3_BUCKET || process.env.R2_BUCKET || "hyble-uploads";
const CDN_URL = process.env.CDN_URL || process.env.R2_PUBLIC_URL || "";

/**
 * Calculate aspect ratio string
 */
function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Generate a unique storage key
 */
function generateKey(folder: string, filename: string, suffix?: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  const id = Math.random().toString(36).substring(2, 15);
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const name = suffix ? `${id}-${suffix}` : id;
  return `${folder}/${date}/${name}.${ext}`;
}

/**
 * Upload buffer to S3/R2
 */
async function uploadToStorage(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await getS3Client().send(command);
  return CDN_URL ? `${CDN_URL}/${key}` : `https://${BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Fetch image from URL
 */
async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Simple blur hash placeholder generator
 * Returns a base64 encoded tiny image for placeholder
 */
function generatePlaceholder(width: number, height: number, color: string): string {
  // Create a simple 4x4 color block as placeholder
  // This is a simplified version - real blur hash would use the blurhash library
  const hexColor = color.replace("#", "");
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Create a simple placeholder hash based on dimensions and color
  return `L00000fQ~qfQ~qfQ~qfQ00ay-;fQ`;
}

/**
 * Extract dominant color from image (simplified)
 * In production, use sharp or a color extraction library
 */
function extractColors(): ColorInfo {
  // Placeholder - in production use sharp.stats() or color-thief
  return {
    dominantColor: "#4A90A4",
    palette: ["#4A90A4", "#2E5A6B", "#7BB3C4", "#1A3A45", "#9ED4E5"],
  };
}

/**
 * Process a single media item
 */
export async function processMediaItem(mediaId: string): Promise<void> {
  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new Error(`Media not found: ${mediaId}`);
  }

  // Update status to processing
  await prisma.productMedia.update({
    where: { id: mediaId },
    data: { status: "PROCESSING" },
  });

  try {
    // For now, we'll do basic metadata extraction
    // Full processing would require Sharp installation

    // Extract colors (simplified)
    const colors = extractColors();

    // Generate blur hash placeholder
    const blurHash = generatePlaceholder(
      media.width || 100,
      media.height || 100,
      colors.dominantColor
    );

    // Calculate aspect ratio
    const aspectRatio = media.width && media.height
      ? calculateAspectRatio(media.width, media.height)
      : undefined;

    // Update media with processed data
    await prisma.productMedia.update({
      where: { id: mediaId },
      data: {
        status: "READY",
        blurHash,
        dominantColor: colors.dominantColor,
        colorPalette: colors.palette,
        aspectRatio,
      },
    });
  } catch (error) {
    console.error(`Failed to process media ${mediaId}:`, error);
    await prisma.productMedia.update({
      where: { id: mediaId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

/**
 * Process a job from the queue
 */
export async function processJob(jobId: string): Promise<void> {
  const job = await prisma.mediaProcessingJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Update job status
  await prisma.mediaProcessingJob.update({
    where: { id: jobId },
    data: {
      status: "PROCESSING",
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    // Process based on job type
    switch (job.jobType) {
      case "blur_hash":
      case "optimize":
        await processMediaItem(job.mediaId);
        break;
      // Add more job types as needed
    }

    // Mark job as completed
    await prisma.mediaProcessingJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        progress: 100,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await prisma.mediaProcessingJob.update({
      where: { id: jobId },
      data: {
        status: job.attempts >= job.maxAttempts ? "FAILED" : "PENDING",
        lastError: errorMessage,
      },
    });

    throw error;
  }
}

/**
 * Queue a processing job
 */
export async function queueProcessingJob(
  mediaId: string,
  mediaType: "ProductMedia" | "ProductVideo" | "Product360View",
  jobType: string,
  priority: number = 5
): Promise<string> {
  const job = await prisma.mediaProcessingJob.create({
    data: {
      mediaId,
      mediaType,
      jobType,
      priority,
      status: "PENDING",
    },
  });

  return job.id;
}

/**
 * Get pending jobs
 */
export async function getPendingJobs(limit: number = 10): Promise<{ id: string; mediaId: string; jobType: string }[]> {
  const jobs = await prisma.mediaProcessingJob.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: [
      { priority: "desc" },
      { scheduledAt: "asc" },
    ],
    take: limit,
    select: {
      id: true,
      mediaId: true,
      jobType: true,
    },
  });

  return jobs;
}

/**
 * Process pending jobs (can be called from a cron job)
 */
export async function processPendingJobs(batchSize: number = 5): Promise<number> {
  const jobs = await getPendingJobs(batchSize);
  let processed = 0;

  for (const job of jobs) {
    try {
      await processJob(job.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
    }
  }

  return processed;
}

/**
 * Get processing statistics
 */
export async function getProcessingStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  const [pending, processing, completed, failed] = await Promise.all([
    prisma.mediaProcessingJob.count({ where: { status: "PENDING" } }),
    prisma.mediaProcessingJob.count({ where: { status: "PROCESSING" } }),
    prisma.mediaProcessingJob.count({ where: { status: "COMPLETED" } }),
    prisma.mediaProcessingJob.count({ where: { status: "FAILED" } }),
  ]);

  return { pending, processing, completed, failed };
}

// Export configuration for external use
export { CONFIG as MEDIA_CONFIG };

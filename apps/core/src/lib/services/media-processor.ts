/**
 * Media Processing Service
 *
 * Görsel işleme servisi - Sharp ile optimizasyon, blur hash oluşturma,
 * renk analizi ve AI etiketleme desteği
 */

import { prisma } from "@hyble/db";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

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
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    xlarge: { width: 2000, height: 2000 },
  },
  quality: {
    jpeg: 85,
    webp: 80,
    avif: 70,
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
function generateKey(folder: string, originalKey: string, suffix: string, ext: string): string {
  const baseName = originalKey.split("/").pop()?.replace(/\.[^/.]+$/, "") || "image";
  return `${folder}/${baseName}-${suffix}.${ext}`;
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
 * Fetch image from URL or S3
 */
async function fetchImage(url: string): Promise<Buffer> {
  // If it's an S3/R2 key, fetch from storage
  if (url.startsWith("images/") || url.startsWith("products/")) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: url,
    });
    const response = await getS3Client().send(command);
    const stream = response.Body;
    if (!stream) {
      throw new Error("No body in S3 response");
    }
    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Otherwise fetch from URL
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extract dominant color from image using Sharp
 */
async function extractColors(buffer: Buffer): Promise<ColorInfo> {
  try {
    // Resize to small size for faster color extraction
    const resized = await sharp(buffer)
      .resize(100, 100, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = resized;
    const pixels: [number, number, number][] = [];

    // Sample pixels
    for (let i = 0; i < data.length; i += info.channels * 10) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      pixels.push([r, g, b]);
    }

    // Simple k-means-like clustering for palette
    const colorCounts: Map<string, number> = new Map();
    pixels.forEach(([r, g, b]) => {
      // Quantize to reduce color space
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      const key = `${qr},${qg},${qb}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    });

    // Sort by frequency
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => {
        const parts = color.split(",").map(Number);
        const r = parts[0] ?? 0;
        const g = parts[1] ?? 0;
        const b = parts[2] ?? 0;
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      });

    return {
      dominantColor: sortedColors[0] || "#808080",
      palette: sortedColors,
    };
  } catch {
    return {
      dominantColor: "#808080",
      palette: ["#808080", "#606060", "#a0a0a0", "#404040", "#c0c0c0"],
    };
  }
}

/**
 * Generate a simple blur placeholder using Sharp
 */
async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  try {
    const blurredBuffer = await sharp(buffer)
      .resize(32, 32, { fit: "inside" })
      .blur(2)
      .toFormat("jpeg", { quality: 20 })
      .toBuffer();

    // Return as base64 data URI
    return `data:image/jpeg;base64,${blurredBuffer.toString("base64")}`;
  } catch {
    return "";
  }
}

/**
 * Resize and optimize image
 */
async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  format: "jpeg" | "webp" | "avif" | "png" = "jpeg"
): Promise<ProcessedImage> {
  let pipeline = sharp(buffer)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });

  let outputFormat: string;
  let contentType: string;

  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality: CONFIG.quality.webp });
      outputFormat = "webp";
      contentType = "image/webp";
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: CONFIG.quality.avif });
      outputFormat = "avif";
      contentType = "image/avif";
      break;
    case "png":
      pipeline = pipeline.png({ quality: CONFIG.quality.png });
      outputFormat = "png";
      contentType = "image/png";
      break;
    default:
      pipeline = pipeline.jpeg({ quality: CONFIG.quality.jpeg, progressive: true });
      outputFormat = "jpeg";
      contentType = "image/jpeg";
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    format: outputFormat,
    size: data.length,
  };
}

/**
 * Process a single media item with Sharp
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
    // Fetch original image
    const sourceUrl = media.r2Key || media.originalUrl || media.url;
    const originalBuffer = await fetchImage(sourceUrl);

    // Get image metadata
    const metadata = await sharp(originalBuffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Extract colors
    const colors = await extractColors(originalBuffer);

    // Generate blur placeholder
    const blurHash = await generateBlurPlaceholder(originalBuffer);

    // Calculate aspect ratio
    const aspectRatio = width && height ? calculateAspectRatio(width, height) : undefined;

    // Determine base folder from original key
    const baseFolder = media.r2Key?.split("/").slice(0, -1).join("/") || "products/processed";
    const baseKey = media.r2Key || media.id;

    // Generate optimized versions
    const updates: {
      status: "READY";
      width: number;
      height: number;
      aspectRatio?: string;
      blurHash: string;
      dominantColor: string;
      colorPalette: string[];
      mimeType: string;
      fileSize: number;
      thumbnailUrl?: string;
      mediumUrl?: string;
      largeUrl?: string;
      webpUrl?: string;
      avifUrl?: string;
    } = {
      status: "READY",
      width,
      height,
      aspectRatio,
      blurHash,
      dominantColor: colors.dominantColor,
      colorPalette: colors.palette,
      mimeType: `image/${metadata.format}`,
      fileSize: originalBuffer.length,
    };

    // Generate thumbnail (150x150)
    try {
      const thumbnail = await resizeImage(originalBuffer, CONFIG.sizes.thumbnail.width, CONFIG.sizes.thumbnail.height, "jpeg");
      const thumbnailKey = generateKey(baseFolder, baseKey, "thumb", "jpg");
      updates.thumbnailUrl = await uploadToStorage(thumbnail.buffer, thumbnailKey, "image/jpeg");
    } catch (e) {
      console.error("Failed to generate thumbnail:", e);
    }

    // Generate medium (600x600)
    try {
      const medium = await resizeImage(originalBuffer, CONFIG.sizes.medium.width, CONFIG.sizes.medium.height, "jpeg");
      const mediumKey = generateKey(baseFolder, baseKey, "medium", "jpg");
      updates.mediumUrl = await uploadToStorage(medium.buffer, mediumKey, "image/jpeg");
    } catch (e) {
      console.error("Failed to generate medium:", e);
    }

    // Generate large (1200x1200)
    try {
      const large = await resizeImage(originalBuffer, CONFIG.sizes.large.width, CONFIG.sizes.large.height, "jpeg");
      const largeKey = generateKey(baseFolder, baseKey, "large", "jpg");
      updates.largeUrl = await uploadToStorage(large.buffer, largeKey, "image/jpeg");
    } catch (e) {
      console.error("Failed to generate large:", e);
    }

    // Generate WebP version
    try {
      const webp = await resizeImage(originalBuffer, CONFIG.sizes.large.width, CONFIG.sizes.large.height, "webp");
      const webpKey = generateKey(baseFolder, baseKey, "webp", "webp");
      updates.webpUrl = await uploadToStorage(webp.buffer, webpKey, "image/webp");
    } catch (e) {
      console.error("Failed to generate webp:", e);
    }

    // Generate AVIF version (best compression)
    try {
      const avif = await resizeImage(originalBuffer, CONFIG.sizes.large.width, CONFIG.sizes.large.height, "avif");
      const avifKey = generateKey(baseFolder, baseKey, "avif", "avif");
      updates.avifUrl = await uploadToStorage(avif.buffer, avifKey, "image/avif");
    } catch (e) {
      console.error("Failed to generate avif:", e);
    }

    // Update media with processed data
    await prisma.productMedia.update({
      where: { id: mediaId },
      data: updates,
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
 * Optimize an image without full processing
 */
export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "webp" | "avif" | "png";
  } = {}
): Promise<Buffer> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 85,
    format = "jpeg",
  } = options;

  let pipeline = sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, progressive: true });
  }

  return pipeline.toBuffer();
}

/**
 * Get image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
    size: buffer.length,
    hasAlpha: metadata.hasAlpha || false,
  };
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
      case "resize":
      case "all":
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

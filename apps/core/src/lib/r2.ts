import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// R2 Client (S3 compatible)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "hyble-files";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://files.hyble.co`;

// File categories
export type FileCategory = "products" | "downloads" | "avatars" | "attachments" | "temp";

// Generate unique filename
function generateFilename(originalName: string, category: FileCategory): string {
  const ext = originalName.split(".").pop() || "";
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  return `${category}/${timestamp}-${random}.${ext}`;
}

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  originalName: string,
  contentType: string,
  category: FileCategory = "temp"
): Promise<{ key: string; url: string; size: number }> {
  const key = generateFilename(originalName, category);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000", // 1 year cache
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
    size: file.length,
  };
}

// Get file from R2
export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    if (!response.Body) return null;

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

// Delete file from R2
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

// Check if file exists
export async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

// Generate presigned URL for secure downloads
export async function generateDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

// Generate presigned URL for direct upload (client-side uploads)
export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

// Move file (copy + delete)
export async function moveFile(oldKey: string, newKey: string): Promise<boolean> {
  try {
    const file = await getFromR2(oldKey);
    if (!file) return false;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newKey,
        Body: file,
      })
    );

    await deleteFromR2(oldKey);
    return true;
  } catch {
    return false;
  }
}

// Get public URL for a key
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Delivery Service
 * FAZ2-4: Otomatik ürün teslimat sistemi
 *
 * Dijital ürünlerin otomatik teslimatını yönetir:
 * - Lisans anahtarı oluşturma
 * - Download link oluşturma
 * - Erişim yönetimi
 */

import { prisma } from "@hyble/db";
import { createOrderNotification } from "../../server/routers/notification";
import crypto from "crypto";

// Types
export interface DeliveryContent {
  type: "LICENSE_KEY" | "DOWNLOAD_URL" | "ACCESS_CREDENTIALS" | "SUBSCRIPTION_ACCESS";
  licenseKey?: string;
  downloadUrl?: string;
  downloadExpiry?: Date;
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  instructions?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  deliveryId?: string;
  content?: DeliveryContent;
  error?: string;
}

/**
 * Process delivery for an order item
 */
export async function processDelivery(
  orderId: string,
  orderItemId: string,
  userId: string,
  productId: string,
  variantId?: string
): Promise<DeliveryResult> {
  try {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: variantId ? { where: { id: variantId } } : undefined,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Determine delivery type based on product type
    let deliveryContent: DeliveryContent;

    switch (product.type) {
      case "DIGITAL":
        deliveryContent = await createDigitalDelivery(product, variantId);
        break;

      case "SUBSCRIPTION":
        deliveryContent = await createSubscriptionDelivery(product, userId, variantId);
        break;

      case "SERVICE":
        deliveryContent = await createServiceDelivery(product, userId);
        break;

      default:
        deliveryContent = {
          type: "LICENSE_KEY",
          licenseKey: generateLicenseKey(),
          instructions: "Ürününüz hazırlanıyor. En kısa sürede size ulaşacaktır.",
        };
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        orderItemId,
        userId,
        type: "INSTANT",
        status: "DELIVERED",
        productId,
        productName: product.nameTr || product.nameEn,
        variantId,
        variantName: product.variants?.[0]?.name,
        deliveryData: deliveryContent as unknown as object,
        deliveredAt: new Date(),
      },
    });

    // Log delivery access
    await prisma.deliveryAccessLog.create({
      data: {
        deliveryId: delivery.id,
        userId,
        action: "delivered",
      },
    });

    // Notify user
    await createOrderNotification(
      userId,
      "Ürününüz Teslim Edildi",
      `${product.nameTr || product.nameEn} ürününüz hazır. Siparişlerim sayfasından erişebilirsiniz.`,
      orderId
    );

    return {
      success: true,
      deliveryId: delivery.id,
      content: deliveryContent,
    };
  } catch (error) {
    console.error("[DeliveryService] Error processing delivery:", error);

    // Create failed delivery record
    await prisma.delivery.create({
      data: {
        orderId,
        orderItemId,
        userId,
        type: "INSTANT",
        status: "FAILED",
        productId,
        productName: "Unknown",
        failureReason: error instanceof Error ? error.message : "Unknown error",
        retryCount: 0,
        nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Delivery failed",
    };
  }
}

/**
 * Create digital product delivery (download link, license key)
 */
async function createDigitalDelivery(
  product: { id: string; nameTr: string; nameEn: string },
  variantId?: string
): Promise<DeliveryContent> {
  // Generate secure download token
  const downloadToken = crypto.randomBytes(32).toString("hex");

  // Download link expires in 7 days
  const downloadExpiry = new Date();
  downloadExpiry.setDate(downloadExpiry.getDate() + 7);

  return {
    type: "DOWNLOAD_URL",
    downloadUrl: `/api/downloads/${downloadToken}`,
    downloadExpiry,
    licenseKey: generateLicenseKey(),
    instructions: `
İndirme bağlantınız 7 gün geçerlidir.
Lisans anahtarınızı güvenli bir yerde saklayın.
Teknik destek için destek sayfamızı ziyaret edebilirsiniz.
    `.trim(),
  };
}

/**
 * Create subscription delivery (access credentials)
 */
async function createSubscriptionDelivery(
  product: { id: string; nameTr: string; nameEn: string },
  userId: string,
  variantId?: string
): Promise<DeliveryContent> {
  // Generate API key for subscription access
  const apiKey = `hyb_${crypto.randomBytes(24).toString("hex")}`;

  return {
    type: "SUBSCRIPTION_ACCESS",
    credentials: {
      apiKey,
    },
    instructions: `
Aboneliğiniz aktif edildi!
API anahtarınızı kullanarak hizmetlere erişebilirsiniz.
Detaylı kullanım için dokümantasyonu inceleyiniz.
    `.trim(),
  };
}

/**
 * Create service delivery
 */
async function createServiceDelivery(
  product: { id: string; nameTr: string; nameEn: string },
  userId: string
): Promise<DeliveryContent> {
  return {
    type: "ACCESS_CREDENTIALS",
    instructions: `
Hizmetiniz başlatıldı!
Ekibimiz en kısa sürede sizinle iletişime geçecektir.
Sorularınız için destek talebi oluşturabilirsiniz.
    `.trim(),
    metadata: {
      serviceStarted: true,
      estimatedCompletion: "24-48 saat",
    },
  };
}

/**
 * Generate license key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 4;
  const segmentLength = 4;

  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }

  return parts.join("-");
}

/**
 * Process order deliveries
 * Called after successful payment
 */
export async function processOrderDeliveries(orderId: string): Promise<{
  total: number;
  delivered: number;
  failed: number;
  results: DeliveryResult[];
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const results: DeliveryResult[] = [];
  let delivered = 0;
  let failed = 0;

  for (const item of order.items) {
    const result = await processDelivery(
      orderId,
      item.id,
      order.userId,
      item.productId,
      item.variantId || undefined
    );

    results.push(result);

    if (result.success) {
      delivered++;
    } else {
      failed++;
    }
  }

  // Update order status
  if (failed === 0) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  } else if (delivered > 0) {
    // Partial delivery
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PROCESSING" },
    });
  }

  return {
    total: order.items.length,
    delivered,
    failed,
    results,
  };
}

/**
 * Retry failed deliveries
 * Cron: Her 15 dakikada bir
 */
export async function retryFailedDeliveries(): Promise<{
  retried: number;
  successful: number;
}> {
  const failedDeliveries = await prisma.delivery.findMany({
    where: {
      status: "FAILED",
      retryCount: { lt: 3 },
      nextRetryAt: { lte: new Date() },
    },
  });

  let retried = 0;
  let successful = 0;

  for (const delivery of failedDeliveries) {
    retried++;

    const result = await processDelivery(
      delivery.orderId,
      delivery.orderItemId,
      delivery.userId,
      delivery.productId,
      delivery.variantId || undefined
    );

    if (result.success) {
      // Delete old failed delivery
      await prisma.delivery.delete({
        where: { id: delivery.id },
      });
      successful++;
    } else {
      // Update retry count
      const nextRetryDelay = Math.pow(2, delivery.retryCount + 1) * 5 * 60 * 1000; // Exponential backoff
      await prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          retryCount: delivery.retryCount + 1,
          nextRetryAt: new Date(Date.now() + nextRetryDelay),
          failureReason: result.error,
        },
      });
    }
  }

  return { retried, successful };
}

/**
 * Get user's deliveries
 */
export async function getUserDeliveries(
  userId: string,
  limit = 20,
  cursor?: string
): Promise<{
  deliveries: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    status: string;
    deliveredAt: Date | null;
    content: DeliveryContent | null;
  }>;
  nextCursor?: string;
}> {
  const deliveries = await prisma.delivery.findMany({
    where: {
      userId,
      status: "DELIVERED",
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { deliveredAt: "desc" },
    select: {
      id: true,
      productName: true,
      variantName: true,
      status: true,
      deliveredAt: true,
      deliveryData: true,
      accessCount: true,
      maxAccessCount: true,
      accessExpiresAt: true,
    },
  });

  let nextCursor: string | undefined;
  if (deliveries.length > limit) {
    const nextItem = deliveries.pop();
    nextCursor = nextItem?.id;
  }

  return {
    deliveries: deliveries.map((d) => ({
      id: d.id,
      productName: d.productName,
      variantName: d.variantName,
      status: d.status,
      deliveredAt: d.deliveredAt,
      content: d.deliveryData as DeliveryContent | null,
    })),
    nextCursor,
  };
}

/**
 * Access delivery content
 */
export async function accessDelivery(
  deliveryId: string,
  userId: string,
  action: "view" | "download" | "activate",
  ipAddress?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  content?: DeliveryContent;
  error?: string;
}> {
  const delivery = await prisma.delivery.findFirst({
    where: {
      id: deliveryId,
      userId,
      status: "DELIVERED",
    },
  });

  if (!delivery) {
    return { success: false, error: "Teslimat bulunamadı" };
  }

  // Check access expiry
  if (delivery.accessExpiresAt && delivery.accessExpiresAt < new Date()) {
    return { success: false, error: "Erişim süresi dolmuş" };
  }

  // Check access count
  if (
    delivery.maxAccessCount &&
    delivery.accessCount >= delivery.maxAccessCount
  ) {
    return { success: false, error: "Maksimum erişim sayısına ulaşıldı" };
  }

  // Log access
  await prisma.deliveryAccessLog.create({
    data: {
      deliveryId,
      userId,
      action,
      ipAddress,
      userAgent,
    },
  });

  // Update access count and last accessed
  await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      accessCount: { increment: 1 },
      lastAccessedAt: new Date(),
      ...(delivery.firstAccessedAt ? {} : { firstAccessedAt: new Date() }),
    },
  });

  return {
    success: true,
    content: delivery.deliveryData as DeliveryContent,
  };
}

export default {
  processDelivery,
  processOrderDeliveries,
  retryFailedDeliveries,
  getUserDeliveries,
  accessDelivery,
};

/**
 * Subscription Renewal Worker
 * FAZ2-3: Abonelik yenileme sistemi
 *
 * Bu worker her gün çalışır ve:
 * 1. Süresi dolan abonelikleri yeniler
 * 2. Başarısız ödemeleri tekrar dener
 * 3. Süresi geçen abonelikleri askıya alır
 */

import { prisma, PaymentMethod } from "@hyble/db";
import { createBillingNotification, createNotification } from "../../server/routers/notification";

// Constants
const RENEWAL_DAYS_BEFORE = 3; // Abonelik bitişinden kaç gün önce yenilenecek
const GRACE_PERIOD_DAYS = 3; // Ödeme başarısız olduktan sonra kaç gün süre tanınacak
const MAX_RETRY_ATTEMPTS = 3; // Maksimum ödeme deneme sayısı

interface RenewalResult {
  subscriptionId: string;
  success: boolean;
  error?: string;
  newPeriodEnd?: Date;
}

/**
 * Process subscription renewals
 * Cron: Her gün 00:00 UTC
 */
export async function processSubscriptionRenewals(): Promise<{
  processed: number;
  renewed: number;
  failed: number;
  results: RenewalResult[];
}> {
  console.log("[SubscriptionWorker] Starting renewal process...");

  const results: RenewalResult[] = [];
  let processed = 0;
  let renewed = 0;
  let failed = 0;

  // Get subscriptions that need renewal
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + RENEWAL_DAYS_BEFORE);

  const subscriptionsToRenew = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      autoRenew: true,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: {
        lte: renewalDate,
      },
    },
    include: {
      order: true,
    },
  });

  console.log(`[SubscriptionWorker] Found ${subscriptionsToRenew.length} subscriptions to renew`);

  for (const subscription of subscriptionsToRenew) {
    processed++;

    try {
      const result = await renewSubscription(subscription.id, subscription.userId);
      results.push(result);

      if (result.success) {
        renewed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`[SubscriptionWorker] Error processing subscription ${subscription.id}:`, error);
      results.push({
        subscriptionId: subscription.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      failed++;
    }
  }

  console.log(`[SubscriptionWorker] Completed. Processed: ${processed}, Renewed: ${renewed}, Failed: ${failed}`);

  return { processed, renewed, failed, results };
}

/**
 * Renew a single subscription
 */
async function renewSubscription(
  subscriptionId: string,
  userId: string
): Promise<RenewalResult> {
  // Get user's wallet
  const wallet = await prisma.wallet.findFirst({
    where: { userId },
  });

  if (!wallet) {
    return {
      subscriptionId,
      success: false,
      error: "Wallet not found",
    };
  }

  // Get subscription details
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    return {
      subscriptionId,
      success: false,
      error: "Subscription not found",
    };
  }

  const renewalAmount = subscription.price;

  // Check wallet balance
  if (wallet.balance.lessThan(renewalAmount)) {
    // Insufficient balance - mark as past due
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "PAST_DUE" },
    });

    // Notify user
    await createBillingNotification(
      userId,
      "Abonelik Ödeme Hatası",
      `${subscription.productName} aboneliğiniz için bakiyeniz yetersiz. Lütfen bakiye yükleyiniz.`,
      "/wallet"
    );

    return {
      subscriptionId,
      success: false,
      error: "Insufficient balance",
    };
  }

  // Calculate new period
  const newPeriodStart = subscription.currentPeriodEnd;
  const newPeriodEnd = calculateNextPeriodEnd(
    newPeriodStart,
    subscription.billingPeriod
  );

  // Process payment
  const balanceBefore = wallet.balance;
  const balanceAfter = wallet.balance.minus(renewalAmount);

  // Create transaction and update subscription in a transaction
  await prisma.$transaction([
    // Deduct from wallet
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    }),
    // Create transaction record
    prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "CHARGE",
        status: "COMPLETED",
        amount: renewalAmount.negated(),
        balanceBefore,
        balanceAfter,
        currency: wallet.currency,
        description: `${subscription.productName} abonelik yenileme`,
        reference: `SUB-${subscriptionId}`,
        paymentMethod: PaymentMethod.WALLET,
      },
    }),
    // Update subscription
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
      },
    }),
  ]);

  // Notify user
  await createBillingNotification(
    userId,
    "Abonelik Yenilendi",
    `${subscription.productName} aboneliğiniz başarıyla yenilendi. Yeni dönem: ${newPeriodEnd.toLocaleDateString("tr-TR")}`,
    "/subscriptions"
  );

  console.log(`[SubscriptionWorker] Renewed subscription ${subscriptionId}, new period end: ${newPeriodEnd}`);

  return {
    subscriptionId,
    success: true,
    newPeriodEnd,
  };
}

/**
 * Calculate next billing period end date
 */
function calculateNextPeriodEnd(currentEnd: Date, billingPeriod: string): Date {
  const nextEnd = new Date(currentEnd);

  switch (billingPeriod) {
    case "monthly":
      nextEnd.setMonth(nextEnd.getMonth() + 1);
      break;
    case "quarterly":
      nextEnd.setMonth(nextEnd.getMonth() + 3);
      break;
    case "annually":
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
      break;
    default:
      nextEnd.setMonth(nextEnd.getMonth() + 1);
  }

  return nextEnd;
}

/**
 * Process expired subscriptions
 * Cron: Her gün 01:00 UTC
 */
export async function processExpiredSubscriptions(): Promise<{
  suspended: number;
  cancelled: number;
}> {
  console.log("[SubscriptionWorker] Processing expired subscriptions...");

  let suspended = 0;
  let cancelled = 0;

  // Find PAST_DUE subscriptions that have exceeded grace period
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);

  const pastDueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "PAST_DUE",
      currentPeriodEnd: {
        lte: gracePeriodEnd,
      },
    },
  });

  for (const subscription of pastDueSubscriptions) {
    // Suspend the subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "EXPIRED",
        cancelledAt: new Date(),
        cancelReason: "Payment failed after grace period",
      },
    });

    // Notify user
    await createNotification({
      userId: subscription.userId,
      type: "SUBSCRIPTION",
      priority: "HIGH",
      title: "Abonelik Askıya Alındı",
      message: `${subscription.productName} aboneliğiniz ödeme yapılmadığı için askıya alındı.`,
      actionUrl: "/wallet",
      actionLabel: "Bakiye Yükle",
      icon: "AlertTriangle",
    });

    suspended++;
  }

  // Find subscriptions that are set to cancel at period end
  const cancelAtEndSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: {
        lte: new Date(),
      },
    },
  });

  for (const subscription of cancelAtEndSubscriptions) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // Notify user
    await createNotification({
      userId: subscription.userId,
      type: "SUBSCRIPTION",
      title: "Abonelik İptal Edildi",
      message: `${subscription.productName} aboneliğiniz dönem sonunda iptal edildi.`,
      icon: "XCircle",
    });

    cancelled++;
  }

  console.log(`[SubscriptionWorker] Suspended: ${suspended}, Cancelled: ${cancelled}`);

  return { suspended, cancelled };
}

/**
 * Send renewal reminders
 * Cron: Her gün 09:00 UTC
 */
export async function sendRenewalReminders(): Promise<{ sent: number }> {
  console.log("[SubscriptionWorker] Sending renewal reminders...");

  let sent = 0;

  // Find subscriptions ending in 7 days
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 7);

  const subscriptionsEnding = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      autoRenew: true,
      currentPeriodEnd: {
        gte: new Date(),
        lte: reminderDate,
      },
    },
  });

  for (const subscription of subscriptionsEnding) {
    // Get wallet balance
    const wallet = await prisma.wallet.findFirst({
      where: { userId: subscription.userId },
    });

    if (!wallet) continue;

    // Check if balance is sufficient
    const isBalanceSufficient = wallet.balance.greaterThanOrEqualTo(subscription.price);

    if (!isBalanceSufficient) {
      // Send low balance warning
      await createBillingNotification(
        subscription.userId,
        "Yaklaşan Abonelik Ödemesi",
        `${subscription.productName} aboneliğiniz ${subscription.currentPeriodEnd.toLocaleDateString("tr-TR")} tarihinde yenilenecek. Bakiyeniz yetersiz, lütfen bakiye yükleyiniz.`,
        "/wallet"
      );

      sent++;
    }
  }

  console.log(`[SubscriptionWorker] Sent ${sent} renewal reminders`);

  return { sent };
}

/**
 * Process trial expirations
 */
export async function processTrialExpirations(): Promise<{ converted: number; expired: number }> {
  console.log("[SubscriptionWorker] Processing trial expirations...");

  let converted = 0;
  let expired = 0;

  const expiredTrials = await prisma.subscription.findMany({
    where: {
      status: "TRIAL",
      trialEnd: {
        lte: new Date(),
      },
    },
  });

  for (const subscription of expiredTrials) {
    if (subscription.autoRenew) {
      // Try to convert to paid subscription
      const result = await renewSubscription(subscription.id, subscription.userId);

      if (result.success) {
        converted++;
      } else {
        // Mark as expired
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" },
        });
        expired++;
      }
    } else {
      // Mark as expired
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
      expired++;

      // Notify user
      await createNotification({
        userId: subscription.userId,
        type: "SUBSCRIPTION",
        title: "Deneme Süresi Sona Erdi",
        message: `${subscription.productName} deneme süreniz sona erdi. Devam etmek için abonelik satın alabilirsiniz.`,
        actionUrl: "/pricing",
        actionLabel: "Planları İncele",
        icon: "Clock",
      });
    }
  }

  console.log(`[SubscriptionWorker] Trials - Converted: ${converted}, Expired: ${expired}`);

  return { converted, expired };
}

export default {
  processSubscriptionRenewals,
  processExpiredSubscriptions,
  sendRenewalReminders,
  processTrialExpirations,
};

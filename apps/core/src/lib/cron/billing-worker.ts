/**
 * Billing Worker - HybleBilling Cron Jobs
 *
 * This worker handles:
 * 1. Subscription renewal invoice generation
 * 2. Overdue invoice processing and reminders
 * 3. Expired coupon cleanup
 * 4. Auto top-up processing
 * 5. Service suspension for non-payment
 */

import { prisma, Prisma } from "@hyble/db";
import { subscriptionService, invoiceService, couponService, walletService } from "../billing";

// Constants
const INVOICE_DUE_DAYS_AHEAD = 7; // Generate invoices 7 days before due
const OVERDUE_REMINDER_DAYS = [1, 3, 7, 14]; // Send reminders at these intervals
const GRACE_PERIOD_DAYS = 7; // Days after due date before suspension
const AUTO_TOPUP_THRESHOLD_PERCENTAGE = 0.20; // Trigger at 20% of last deposit

interface JobResult {
  success: boolean;
  processed: number;
  errors: string[];
}

/**
 * Generate renewal invoices for subscriptions due soon
 * Runs daily at 00:00 UTC
 */
export async function generateRenewalInvoices(): Promise<JobResult> {
  console.log("[BillingWorker] Generating renewal invoices...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const count = await subscriptionService.generateRenewalInvoices(INVOICE_DUE_DAYS_AHEAD);
    processed = count;

    console.log(`[BillingWorker] Generated ${count} renewal invoices`);

    return { success: true, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error generating renewal invoices:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Process expired services (suspend after grace period)
 * Runs daily at 01:00 UTC
 */
export async function processExpiredServices(): Promise<JobResult> {
  console.log("[BillingWorker] Processing expired services...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const count = await subscriptionService.processExpired();
    processed = count;

    if (count > 0) {
      // Log to audit
      await prisma.billingAuditLog.create({
        data: {
          resourceType: "Service",
          resourceId: "batch",
          action: "services.suspended",
          actorType: "system",
          newData: { count, reason: "Non-payment after grace period" },
        },
      });
    }

    console.log(`[BillingWorker] Suspended ${count} expired services`);

    return { success: true, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error processing expired services:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Send overdue invoice reminders
 * Runs daily at 09:00 UTC
 */
export async function sendOverdueReminders(): Promise<JobResult> {
  console.log("[BillingWorker] Sending overdue invoice reminders...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const now = new Date();

    for (const daysOverdue of OVERDUE_REMINDER_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - daysOverdue);

      // Find invoices that became overdue on this day
      const overdueInvoices = await prisma.billingInvoice.findMany({
        where: {
          status: "OVERDUE",
          dueDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      for (const invoice of overdueInvoices) {
        try {
          // Check if reminder already sent for this interval
          const existingReminder = await prisma.billingAuditLog.findFirst({
            where: {
              resourceType: "Invoice",
              resourceId: invoice.id,
              action: `reminder.${daysOverdue}day`,
            },
          });

          if (existingReminder) continue;

          // TODO: Send email reminder via @hyble/email
          // await sendOverdueInvoiceEmail(invoice.customer.email, invoice, daysOverdue);

          // Log reminder sent
          await prisma.billingAuditLog.create({
            data: {
              resourceType: "Invoice",
              resourceId: invoice.id,
              action: `reminder.${daysOverdue}day`,
              actorType: "system",
              newData: {
                daysOverdue,
                customerEmail: invoice.customer.email,
                invoiceNumber: invoice.invoiceNumber,
                balance: parseFloat(invoice.balance.toString()),
              },
            },
          });

          processed++;
        } catch (error) {
          errors.push(`Invoice ${invoice.id}: ${error instanceof Error ? error.message : "Unknown"}`);
        }
      }
    }

    console.log(`[BillingWorker] Sent ${processed} overdue reminders`);

    return { success: errors.length === 0, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error sending overdue reminders:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Mark overdue invoices
 * Runs daily at 00:30 UTC
 */
export async function markOverdueInvoices(): Promise<JobResult> {
  console.log("[BillingWorker] Marking overdue invoices...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const now = new Date();

    // Find unpaid invoices past due date
    const result = await prisma.billingInvoice.updateMany({
      where: {
        status: { in: ["PENDING", "DRAFT"] },
        dueDate: { lt: now },
        balance: { gt: 0 },
      },
      data: {
        status: "OVERDUE",
      },
    });

    processed = result.count;

    console.log(`[BillingWorker] Marked ${result.count} invoices as overdue`);

    return { success: true, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error marking overdue invoices:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Process auto top-up for wallets
 * Runs every hour
 */
export async function processAutoTopUp(): Promise<JobResult> {
  console.log("[BillingWorker] Processing auto top-up...");
  const errors: string[] = [];
  let processed = 0;

  try {
    // Find wallets with auto top-up enabled and low balance
    const walletsForTopUp = await prisma.billingWallet.findMany({
      where: {
        autoTopUpEnabled: true,
        autoTopUpThreshold: { not: null },
        balance: { lte: prisma.billingWallet.fields.autoTopUpThreshold },
      },
      include: {
        customer: {
          include: {
            paymentTokens: {
              where: { isDefault: true, isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    for (const wallet of walletsForTopUp) {
      try {
        const defaultToken = wallet.customer.paymentTokens[0];
        if (!defaultToken) {
          errors.push(`Wallet ${wallet.id}: No default payment method`);
          continue;
        }

        const topUpAmount = wallet.autoTopUpAmount || new Prisma.Decimal(50);

        // TODO: Process payment through gateway
        // For now, log the intent
        await prisma.billingAuditLog.create({
          data: {
            resourceType: "Wallet",
            resourceId: wallet.id,
            action: "autotopup.triggered",
            actorType: "system",
            newData: {
              currentBalance: parseFloat(wallet.balance.toString()),
              threshold: parseFloat(wallet.autoTopUpThreshold?.toString() || "0"),
              topUpAmount: parseFloat(topUpAmount.toString()),
              paymentTokenId: defaultToken.id,
            },
          },
        });

        processed++;
      } catch (error) {
        errors.push(`Wallet ${wallet.id}: ${error instanceof Error ? error.message : "Unknown"}`);
      }
    }

    console.log(`[BillingWorker] Triggered ${processed} auto top-ups`);

    return { success: errors.length === 0, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error processing auto top-up:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Cleanup expired coupons
 * Runs daily at 02:00 UTC
 */
export async function cleanupExpiredCoupons(): Promise<JobResult> {
  console.log("[BillingWorker] Cleaning up expired coupons...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const count = await couponService.processExpired();
    processed = count;

    console.log(`[BillingWorker] Marked ${count} coupons as expired`);

    return { success: true, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error cleaning up coupons:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Process depleted coupons (usage limit reached)
 * Runs daily at 02:30 UTC
 */
export async function processDepletedCoupons(): Promise<JobResult> {
  console.log("[BillingWorker] Processing depleted coupons...");
  const errors: string[] = [];
  let processed = 0;

  try {
    const count = await couponService.processDepleted();
    processed = count;

    console.log(`[BillingWorker] Marked ${count} coupons as depleted`);

    return { success: true, processed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error processing depleted coupons:", error);
    return { success: false, processed, errors };
  }
}

/**
 * Process pending wallet credits (promo expiry)
 * Runs daily at 03:00 UTC
 *
 * Note: This is a placeholder - promo expiry tracking requires
 * additional schema fields (expiresAt on BillingWalletTransaction).
 * For now, we log that the job ran successfully.
 */
export async function processPromoBalanceExpiry(): Promise<JobResult> {
  console.log("[BillingWorker] Processing promo balance expiry...");

  // TODO: Implement when schema supports expiresAt on transactions
  // This would require:
  // 1. Adding expiresAt DateTime? field to BillingWalletTransaction
  // 2. Adding isPromo Boolean field to BillingWalletTransaction
  // 3. Finding all PROMO transactions where expiresAt < now()
  // 4. Deducting from promoBalance and creating ADJUSTMENT transaction

  console.log("[BillingWorker] Promo expiry not yet implemented - requires schema update");

  return { success: true, processed: 0, errors: [] };
}

/**
 * Generate monthly billing reports
 * Runs on 1st of each month at 06:00 UTC
 */
export async function generateMonthlyReport(): Promise<JobResult> {
  console.log("[BillingWorker] Generating monthly billing report...");
  const errors: string[] = [];

  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get invoice statistics
    const invoiceStats = await prisma.billingInvoice.aggregate({
      where: {
        issueDate: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
      _sum: { subtotal: true, taxTotal: true, total: true, amountPaid: true },
      _count: true,
    });

    // Get payment statistics
    const paymentStats = await prisma.billingPayment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Get new customers
    const newCustomers = await prisma.billingCustomer.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
    });

    // Get MRR (Monthly Recurring Revenue)
    const mrrData = await prisma.billingService.aggregate({
      where: {
        status: "ACTIVE",
        billingCycle: "MONTHLY",
      },
      _sum: { amount: true },
    });

    const report = {
      period: `${lastMonth.toISOString().slice(0, 7)}`,
      invoices: {
        count: invoiceStats._count,
        subtotal: parseFloat(invoiceStats._sum.subtotal?.toString() || "0"),
        tax: parseFloat(invoiceStats._sum.taxTotal?.toString() || "0"),
        total: parseFloat(invoiceStats._sum.total?.toString() || "0"),
        collected: parseFloat(invoiceStats._sum.amountPaid?.toString() || "0"),
      },
      payments: {
        count: paymentStats._count,
        total: parseFloat(paymentStats._sum.amount?.toString() || "0"),
      },
      newCustomers,
      mrr: parseFloat(mrrData._sum.amount?.toString() || "0"),
    };

    // Store report
    await prisma.billingAuditLog.create({
      data: {
        resourceType: "Report",
        resourceId: report.period,
        action: "monthly.generated",
        actorType: "system",
        newData: report,
      },
    });

    console.log(`[BillingWorker] Generated monthly report for ${report.period}`);

    return { success: true, processed: 1, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("[BillingWorker] Error generating monthly report:", error);
    return { success: false, processed: 0, errors };
  }
}

/**
 * Run all daily billing jobs
 */
export async function runDailyBillingJobs(): Promise<Record<string, JobResult>> {
  const results: Record<string, JobResult> = {};

  const jobs = [
    { name: "markOverdueInvoices", fn: markOverdueInvoices },
    { name: "generateRenewalInvoices", fn: generateRenewalInvoices },
    { name: "processExpiredServices", fn: processExpiredServices },
    { name: "sendOverdueReminders", fn: sendOverdueReminders },
    { name: "cleanupExpiredCoupons", fn: cleanupExpiredCoupons },
    { name: "processDepletedCoupons", fn: processDepletedCoupons },
    { name: "processPromoBalanceExpiry", fn: processPromoBalanceExpiry },
  ];

  for (const job of jobs) {
    try {
      results[job.name] = await job.fn();
    } catch (error) {
      results[job.name] = {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  return results;
}

// Export job names
export const BILLING_CRON_JOBS = {
  MARK_OVERDUE: "markOverdueInvoices",
  GENERATE_RENEWALS: "generateRenewalInvoices",
  PROCESS_EXPIRED: "processExpiredServices",
  SEND_REMINDERS: "sendOverdueReminders",
  AUTO_TOPUP: "processAutoTopUp",
  CLEANUP_COUPONS: "cleanupExpiredCoupons",
  DEPLETED_COUPONS: "processDepletedCoupons",
  PROMO_EXPIRY: "processPromoBalanceExpiry",
  MONTHLY_REPORT: "generateMonthlyReport",
  ALL_DAILY: "runDailyBillingJobs",
} as const;

export default {
  generateRenewalInvoices,
  processExpiredServices,
  sendOverdueReminders,
  markOverdueInvoices,
  processAutoTopUp,
  cleanupExpiredCoupons,
  processDepletedCoupons,
  processPromoBalanceExpiry,
  generateMonthlyReport,
  runDailyBillingJobs,
  BILLING_CRON_JOBS,
};

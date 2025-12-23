import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  runDailyJobs,
  cleanupGhostAccounts,
  cleanupExpiredSessions,
  cleanupExpiredTokens,
  processAccountDeletions,
  sendBirthdayCelebrations,
  sendAnniversaryCelebrations,
  unbanExpiredBans,
  cleanupExpiredApiKeys,
  CRON_JOBS,
  // Billing cron jobs
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
} from "@/lib/cron";

// Allowed IPs for cron requests (internal/cron service IPs)
const ALLOWED_CRON_IPS = [
  "127.0.0.1",
  "::1",
  "10.0.0.0/8",      // Internal network
  "172.16.0.0/12",   // Internal network
  "192.168.0.0/16",  // Internal network
];

// Check if IP is allowed
function isAllowedIp(ip: string): boolean {
  // In production, allow only from internal IPs or trusted cron services
  if (process.env.NODE_ENV !== "production") {
    return true; // Allow all IPs in development
  }

  // Check exact match
  if (ALLOWED_CRON_IPS.includes(ip)) {
    return true;
  }

  // Check CIDR ranges (simplified check)
  if (ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168.")) {
    return true;
  }

  // Allow Vercel cron if configured
  const vercelCronHeader = process.env.VERCEL_CRON_SECRET;
  if (vercelCronHeader) {
    return true; // Will be verified by secret
  }

  return false;
}

// Generate HMAC signature for time-based verification
function generateSignature(timestamp: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(timestamp)
    .digest("hex");
}

// Verify cron secret with enhanced security
function verifyCronAuth(request: NextRequest): { valid: boolean; error?: string } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // IP restriction (production only)
  if (process.env.NODE_ENV === "production" && !isAllowedIp(ip)) {
    console.warn(`[Cron] Blocked request from unauthorized IP: ${ip}`);
    return { valid: false, error: "IP not allowed" };
  }

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const timestampHeader = request.headers.get("x-cron-timestamp");

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET not configured");
    return { valid: false, error: "Server configuration error" };
  }

  // Basic Bearer token verification
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");

  // If timestamp provided, verify HMAC signature for replay attack prevention
  if (timestampHeader) {
    const timestamp = parseInt(timestampHeader, 10);
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (isNaN(timestamp) || Math.abs(now - timestamp) > maxAge) {
      return { valid: false, error: "Request timestamp expired" };
    }

    const expectedSignature = generateSignature(timestampHeader, cronSecret);
    try {
      const tokenBuffer = Buffer.from(token);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (tokenBuffer.length !== expectedBuffer.length ||
          !timingSafeEqual(tokenBuffer, expectedBuffer)) {
        return { valid: false, error: "Invalid signature" };
      }
    } catch {
      return { valid: false, error: "Invalid signature format" };
    }
  } else {
    // Fallback: simple token comparison with timing-safe check
    try {
      const tokenBuffer = Buffer.from(token);
      const secretBuffer = Buffer.from(cronSecret);

      if (tokenBuffer.length !== secretBuffer.length ||
          !timingSafeEqual(tokenBuffer, secretBuffer)) {
        return { valid: false, error: "Invalid token" };
      }
    } catch {
      return { valid: false, error: "Invalid token format" };
    }
  }

  return { valid: true };
}

// GET /api/cron - Run all daily jobs
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runDailyJobs();
    return NextResponse.json(results);
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/cron - Run specific job
export async function POST(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { job } = body;

    if (!job) {
      return NextResponse.json(
        { error: "Job name required", availableJobs: Object.values(CRON_JOBS) },
        { status: 400 }
      );
    }

    let result;
    switch (job) {
      case CRON_JOBS.GHOST_ACCOUNTS:
        result = await cleanupGhostAccounts();
        break;
      case CRON_JOBS.SESSIONS:
        result = await cleanupExpiredSessions();
        break;
      case CRON_JOBS.TOKENS:
        result = await cleanupExpiredTokens();
        break;
      case CRON_JOBS.DELETIONS:
        result = await processAccountDeletions();
        break;
      case CRON_JOBS.BIRTHDAYS:
        result = await sendBirthdayCelebrations();
        break;
      case CRON_JOBS.ANNIVERSARIES:
        result = await sendAnniversaryCelebrations();
        break;
      case CRON_JOBS.UNBANS:
        result = await unbanExpiredBans();
        break;
      case CRON_JOBS.API_KEYS:
        result = await cleanupExpiredApiKeys();
        break;
      case CRON_JOBS.ALL:
        result = await runDailyJobs();
        break;

      // Billing jobs
      case BILLING_CRON_JOBS.MARK_OVERDUE:
        result = await markOverdueInvoices();
        break;
      case BILLING_CRON_JOBS.GENERATE_RENEWALS:
        result = await generateRenewalInvoices();
        break;
      case BILLING_CRON_JOBS.PROCESS_EXPIRED:
        result = await processExpiredServices();
        break;
      case BILLING_CRON_JOBS.SEND_REMINDERS:
        result = await sendOverdueReminders();
        break;
      case BILLING_CRON_JOBS.AUTO_TOPUP:
        result = await processAutoTopUp();
        break;
      case BILLING_CRON_JOBS.CLEANUP_COUPONS:
        result = await cleanupExpiredCoupons();
        break;
      case BILLING_CRON_JOBS.DEPLETED_COUPONS:
        result = await processDepletedCoupons();
        break;
      case BILLING_CRON_JOBS.PROMO_EXPIRY:
        result = await processPromoBalanceExpiry();
        break;
      case BILLING_CRON_JOBS.MONTHLY_REPORT:
        result = await generateMonthlyReport();
        break;
      case BILLING_CRON_JOBS.ALL_DAILY:
        result = await runDailyBillingJobs();
        break;

      default:
        return NextResponse.json(
          {
            error: "Unknown job",
            availableJobs: {
              core: Object.values(CRON_JOBS),
              billing: Object.values(BILLING_CRON_JOBS),
            }
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      job,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}

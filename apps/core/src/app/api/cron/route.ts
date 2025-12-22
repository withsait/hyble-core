import { NextRequest, NextResponse } from "next/server";
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
} from "@/lib/cron";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn("CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron - Run all daily jobs
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      default:
        return NextResponse.json(
          { error: "Unknown job", availableJobs: Object.values(CRON_JOBS) },
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

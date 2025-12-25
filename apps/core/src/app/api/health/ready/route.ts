/**
 * Readiness Probe Endpoint
 * Kubernetes readiness check - is the app ready to receive traffic?
 */

import { NextResponse } from "next/server";
import { prisma } from "@hyble/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const checks = {
    database: false,
    redis: false,
  };

  let ready = true;

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Readiness check - Database not ready:", error);
    ready = false;
  }

  // Check Redis connection
  try {
    // Placeholder for Redis check
    checks.redis = true;
  } catch (error) {
    console.error("Readiness check - Redis not ready:", error);
    ready = false;
  }

  return NextResponse.json(
    {
      ready,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 }
  );
}

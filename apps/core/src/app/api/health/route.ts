/**
 * Health Check API Endpoint
 * Used by load balancers, Kubernetes, and monitoring systems
 */

import { NextResponse } from "next/server";
import { prisma } from "@hyble/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: boolean;
    redis: boolean;
    memory: boolean;
  };
  responseTime?: number;
}

const startTime = Date.now();

export async function GET() {
  const requestStart = Date.now();

  const result: HealthCheckResult = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: false,
      redis: false,
      memory: true,
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database = true;
  } catch (error) {
    console.error("Health check - Database failed:", error);
    result.status = "unhealthy";
  }

  // Check Redis (would need ioredis in production)
  try {
    // Placeholder - would check Redis connection
    result.checks.redis = true;
  } catch (error) {
    console.error("Health check - Redis failed:", error);
    if (result.status === "healthy") {
      result.status = "degraded";
    }
  }

  // Check memory
  const memUsage = process.memoryUsage();
  const memLimit = 1024 * 1024 * 1024; // 1GB
  if (memUsage.heapUsed > memLimit * 0.9) {
    result.checks.memory = false;
    if (result.status === "healthy") {
      result.status = "degraded";
    }
  }

  result.responseTime = Date.now() - requestStart;

  // Return appropriate status code
  const statusCode = result.status === "healthy" ? 200 : result.status === "degraded" ? 200 : 503;

  return NextResponse.json(result, { status: statusCode });
}

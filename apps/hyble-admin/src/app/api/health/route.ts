import { NextResponse } from "next/server";
import { prisma } from "@hyble/db";

export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        latency: `${dbLatency}ms`,
      },
      uptime: process.uptime(),
      version: process.version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          status: "disconnected",
          error: "Failed to connect to database",
        },
      },
      { status: 503 }
    );
  }
}

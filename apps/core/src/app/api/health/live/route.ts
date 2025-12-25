/**
 * Liveness Probe Endpoint
 * Kubernetes liveness check - is the app running?
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
}

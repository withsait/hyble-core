import { NextResponse } from "next/server";
import { generateOpenAPISpec } from "@/lib/docs/openapi";

export const dynamic = "force-static";

/**
 * GET /api/docs
 * Returns the OpenAPI specification in JSON format
 */
export async function GET() {
  const spec = generateOpenAPISpec();

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}

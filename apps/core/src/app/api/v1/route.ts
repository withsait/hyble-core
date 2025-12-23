import { NextResponse } from "next/server";

/**
 * Public API v1 - Root endpoint
 * GET /api/v1 - API information
 */
export async function GET() {
  return NextResponse.json({
    name: "Hyble API",
    version: "1.0.0",
    documentation: "https://docs.hyble.co/api",
    endpoints: {
      products: "/api/v1/products",
      invoices: "/api/v1/invoices",
      wallet: "/api/v1/wallet",
      webhooks: "/api/v1/webhooks",
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <api_key>",
      alternativeHeader: "X-API-Key: <api_key>",
    },
    rateLimits: {
      default: "100 requests per minute",
      burst: "200 requests per minute",
    },
  });
}

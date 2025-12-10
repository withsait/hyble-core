import { NextRequest, NextResponse } from "next/server";

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

const defaultConfig: CorsConfig = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://hyble.io",
    "https://panel.hyble.io",
    "https://mineble.io",
    "https://panel.mineble.io",
  ],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-Key",
    "X-CSRF-Token",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "X-Request-Id",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  // Check exact match
  if (allowedOrigins.includes(origin)) return true;

  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed === "*") return true;
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2);
      if (origin.endsWith(domain) || origin.endsWith(`.${domain}`)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * CORS middleware for API routes
 */
export function corsMiddleware(
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): NextResponse | null {
  const finalConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get("origin");
  const method = request.method;

  // Handle preflight request
  if (method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    if (isOriginAllowed(origin, finalConfig.allowedOrigins)) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      finalConfig.allowedMethods.join(", ")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      finalConfig.allowedHeaders.join(", ")
    );
    response.headers.set(
      "Access-Control-Expose-Headers",
      finalConfig.exposedHeaders.join(", ")
    );
    response.headers.set("Access-Control-Max-Age", String(finalConfig.maxAge));

    if (finalConfig.credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  }

  // For non-preflight requests, return null to continue
  // Headers will be added in the response
  return null;
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): NextResponse {
  const finalConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get("origin");

  if (isOriginAllowed(origin, finalConfig.allowedOrigins)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  }

  if (finalConfig.credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set(
    "Access-Control-Expose-Headers",
    finalConfig.exposedHeaders.join(", ")
  );

  return response;
}

/**
 * Get CORS config for specific routes
 */
export function getCorsConfig(pathname: string): Partial<CorsConfig> {
  // Public API routes - more permissive
  if (pathname.startsWith("/api/public")) {
    return {
      allowedOrigins: ["*"],
      credentials: false,
    };
  }

  // Webhook routes - specific origins
  if (pathname.startsWith("/api/webhooks")) {
    return {
      allowedOrigins: [
        "https://api.stripe.com",
        "https://hooks.stripe.com",
        "https://api.github.com",
      ],
      allowedMethods: ["POST"],
      credentials: false,
    };
  }

  // Internal API routes - strict
  if (pathname.startsWith("/api/admin")) {
    return {
      allowedOrigins: [
        "https://admin.hyble.io",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ],
    };
  }

  return {};
}

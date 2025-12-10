import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
  keyPrefix?: string;
}

const defaultConfig: RateLimitConfig = {
  limit: 100,
  windowSeconds: 60,
  keyPrefix: "api",
};

/**
 * Rate limit middleware for API routes
 * Uses Redis sliding window algorithm
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<NextResponse | null> {
  const { limit, windowSeconds, keyPrefix } = { ...defaultConfig, ...config };

  // Get identifier (prefer user ID, fall back to IP)
  const userId = request.headers.get("x-user-id");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const identifier = userId || ip;
  const key = `${keyPrefix}:${identifier}`;

  try {
    const result = await checkRateLimit(key, limit, windowSeconds);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    return null; // Continue to next middleware/handler
  } catch (error) {
    console.error("[RateLimit] Error:", error);
    // On Redis error, allow request to proceed
    return null;
  }
}

/**
 * Route-specific rate limit configurations
 */
export const rateLimitConfigs = {
  // Auth routes - stricter limits
  auth: {
    login: { limit: 5, windowSeconds: 60, keyPrefix: "auth:login" },
    register: { limit: 3, windowSeconds: 60, keyPrefix: "auth:register" },
    passwordReset: { limit: 3, windowSeconds: 300, keyPrefix: "auth:reset" },
    verifyEmail: { limit: 10, windowSeconds: 60, keyPrefix: "auth:verify" },
  },
  // API routes - standard limits
  api: {
    default: { limit: 100, windowSeconds: 60, keyPrefix: "api" },
    heavy: { limit: 10, windowSeconds: 60, keyPrefix: "api:heavy" },
    export: { limit: 5, windowSeconds: 300, keyPrefix: "api:export" },
  },
  // Webhook routes - higher limits
  webhook: {
    default: { limit: 1000, windowSeconds: 60, keyPrefix: "webhook" },
  },
} as const;

/**
 * Get rate limit config based on route path
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/auth/login")) {
    return rateLimitConfigs.auth.login;
  }
  if (pathname.startsWith("/api/auth/register")) {
    return rateLimitConfigs.auth.register;
  }
  if (pathname.startsWith("/api/auth/password")) {
    return rateLimitConfigs.auth.passwordReset;
  }
  if (pathname.startsWith("/api/webhooks")) {
    return rateLimitConfigs.webhook.default;
  }
  if (pathname.includes("/export")) {
    return rateLimitConfigs.api.export;
  }

  return rateLimitConfigs.api.default;
}

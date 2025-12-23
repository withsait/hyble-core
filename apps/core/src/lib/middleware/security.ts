import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  strictTransportSecurity?: string;
}

const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy - Hardened (no unsafe-inline/unsafe-eval)
  // Note: In development, Next.js requires unsafe-eval for hot reload
  contentSecurityPolicy: process.env.NODE_ENV === "production"
    ? [
        "default-src 'self'",
        "script-src 'self' https://cdn.jsdelivr.net https://www.googletagmanager.com 'nonce-{NONCE}'",
        "style-src 'self' https://fonts.googleapis.com 'nonce-{NONCE}'",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.hyble.io https://*.hyble.io wss://*.hyble.io https://www.google-analytics.com",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.hyble.io https://*.hyble.io wss://*.hyble.io ws://localhost:*",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join("; "),

  // Prevent clickjacking
  xFrameOptions: "DENY",

  // Prevent MIME type sniffing
  xContentTypeOptions: "nosniff",

  // Control referrer information
  referrerPolicy: "strict-origin-when-cross-origin",

  // Feature policy
  permissionsPolicy: [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),

  // HSTS (only in production with HTTPS)
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(
  response: NextResponse,
  config: Partial<SecurityHeadersConfig> = {}
): NextResponse {
  const headers = { ...defaultSecurityHeaders, ...config };

  if (headers.contentSecurityPolicy) {
    response.headers.set("Content-Security-Policy", headers.contentSecurityPolicy);
  }

  if (headers.xFrameOptions) {
    response.headers.set("X-Frame-Options", headers.xFrameOptions);
  }

  if (headers.xContentTypeOptions) {
    response.headers.set("X-Content-Type-Options", headers.xContentTypeOptions);
  }

  if (headers.referrerPolicy) {
    response.headers.set("Referrer-Policy", headers.referrerPolicy);
  }

  if (headers.permissionsPolicy) {
    response.headers.set("Permissions-Policy", headers.permissionsPolicy);
  }

  // Only add HSTS in production with HTTPS
  if (
    headers.strictTransportSecurity &&
    process.env.NODE_ENV === "production"
  ) {
    response.headers.set(
      "Strict-Transport-Security",
      headers.strictTransportSecurity
    );
  }

  // Additional security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return response;
}

/**
 * Validate API key from request
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ valid: boolean; keyId?: string; scopes?: string[]; error?: string }> {
  const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return { valid: false, error: "API key required" };
  }

  // Validate API key format
  if (!apiKey.startsWith("hbl_") && !apiKey.startsWith("mbl_")) {
    return { valid: false, error: "Invalid API key format" };
  }

  // TODO: Validate against database
  // This would call the apiKey.verify procedure

  return { valid: true };
}

/**
 * Check if request has valid CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Skip CSRF for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const csrfToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get("csrf-token")?.value;

  if (!csrfToken || !cookieToken) {
    return false;
  }

  return csrfToken === cookieToken;
}

/**
 * IP-based security checks
 */
export function checkIpSecurity(request: NextRequest): {
  allowed: boolean;
  reason?: string;
} {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check against blocklist (would be loaded from database/config)
  const blockedIps: string[] = [];

  if (blockedIps.includes(ip)) {
    return { allowed: false, reason: "IP blocked" };
  }

  return { allowed: true };
}

/**
 * Security middleware combining all security checks
 */
export async function securityMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // IP security check
  const ipCheck = checkIpSecurity(request);
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: ipCheck.reason },
      { status: 403 }
    );
  }

  // For API routes that require API key
  if (request.nextUrl.pathname.startsWith("/api/v1")) {
    const apiKeyValidation = await validateApiKey(request);
    if (!apiKeyValidation.valid) {
      return NextResponse.json(
        { error: apiKeyValidation.error },
        { status: 401 }
      );
    }
  }

  return null; // Continue to next middleware
}

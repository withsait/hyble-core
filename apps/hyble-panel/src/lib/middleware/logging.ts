import { NextRequest, NextResponse } from "next/server";

export interface RequestLog {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string>;
  ip: string;
  userAgent: string | null;
  userId: string | null;
  duration?: number;
  statusCode?: number;
  error?: string;
}

/**
 * Generate unique request ID (edge-compatible)
 * Uses crypto.randomUUID() which is available in Edge Runtime
 */
export function generateRequestId(): string {
  // crypto.randomUUID() is available in Edge Runtime
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract request metadata for logging
 */
export function extractRequestMetadata(request: NextRequest): Omit<RequestLog, "duration" | "statusCode" | "error"> {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    // Don't log sensitive query params
    if (!["token", "code", "password", "secret"].includes(key.toLowerCase())) {
      query[key] = value;
    }
  });

  return {
    requestId: request.headers.get("x-request-id") || generateRequestId(),
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    query,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent"),
    userId: request.headers.get("x-user-id"),
  };
}

/**
 * Log request/response
 */
export function logRequest(log: RequestLog): void {
  const logLevel = log.statusCode && log.statusCode >= 500 ? "error" : "info";

  const logData = {
    ...log,
    // Mask sensitive data
    userAgent: log.userAgent ? log.userAgent.slice(0, 100) : null,
  };

  if (process.env.NODE_ENV === "production") {
    // In production, use structured logging (JSON)
    console[logLevel](JSON.stringify(logData));
  } else {
    // In development, use human-readable format
    const statusEmoji = log.statusCode
      ? log.statusCode >= 500
        ? "💥"
        : log.statusCode >= 400
        ? "⚠️"
        : "✅"
      : "➡️";

    console[logLevel](
      `${statusEmoji} [${log.requestId.slice(0, 8)}] ${log.method} ${log.path} ${
        log.statusCode || "..."
      } ${log.duration ? `${log.duration}ms` : ""}`
    );

    if (log.error) {
      console.error(`   Error: ${log.error}`);
    }
  }
}

/**
 * Logging middleware
 */
export function loggingMiddleware(request: NextRequest): {
  requestId: string;
  startTime: number;
  metadata: Omit<RequestLog, "duration" | "statusCode" | "error">;
} {
  const startTime = Date.now();
  const metadata = extractRequestMetadata(request);

  // Log request start
  if (process.env.NODE_ENV === "development") {
    console.log(`➡️ [${metadata.requestId.slice(0, 8)}] ${metadata.method} ${metadata.path}`);
  }

  return {
    requestId: metadata.requestId,
    startTime,
    metadata,
  };
}

/**
 * Add request ID header to response and log completion
 */
export function completeLogging(
  response: NextResponse,
  loggingContext: ReturnType<typeof loggingMiddleware>,
  error?: Error
): NextResponse {
  const duration = Date.now() - loggingContext.startTime;

  // Add request ID to response
  response.headers.set("X-Request-Id", loggingContext.requestId);

  // Log completion
  logRequest({
    ...loggingContext.metadata,
    duration,
    statusCode: response.status,
    error: error?.message,
  });

  return response;
}

/**
 * Routes to skip logging (health checks, static files, etc.)
 */
const skipLoggingPaths = [
  "/api/health",
  "/api/ping",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
];

/**
 * Check if path should skip logging
 */
export function shouldSkipLogging(pathname: string): boolean {
  return skipLoggingPaths.some((path) => pathname.startsWith(path));
}

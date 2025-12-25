/**
 * Error Tracker for Hyble Core
 * Centralized error tracking and reporting
 */

import { prisma } from "@hyble/db";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error categories
export type ErrorCategory =
  | "runtime"
  | "database"
  | "network"
  | "auth"
  | "validation"
  | "payment"
  | "external"
  | "unknown";

// Error context
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  sessionId?: string;
  correlationId?: string;
}

// Error entry
export interface ErrorEntry {
  id: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint: string;
  occurredAt: Date;
  resolved: boolean;
  count: number;
  metadata?: Record<string, any>;
}

// Error stats
export interface ErrorStats {
  total: number;
  unresolved: number;
  bySeverity: Record<ErrorSeverity, number>;
  byCategory: Record<ErrorCategory, number>;
  last24h: number;
  topErrors: Array<{
    fingerprint: string;
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
}

/**
 * Error Tracker class
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errorBuffer: Map<string, ErrorEntry> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start periodic flush
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, 30000); // Flush every 30 seconds
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Generate error fingerprint for grouping
   */
  private generateFingerprint(error: Error, category: ErrorCategory): string {
    const stackLine = error.stack?.split("\n")[1] || "";
    const key = `${category}:${error.name}:${error.message.slice(0, 100)}:${stackLine.trim()}`;
    return Buffer.from(key).toString("base64").slice(0, 64);
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Critical errors
    if (category === "database" && error.message.includes("connection")) {
      return "critical";
    }
    if (category === "payment") {
      return "high";
    }
    if (error.message.includes("ECONNREFUSED") || error.message.includes("timeout")) {
      return "high";
    }

    // Medium errors
    if (category === "auth") {
      return "medium";
    }
    if (category === "validation") {
      return "low";
    }

    return "medium";
  }

  /**
   * Determine error category
   */
  private determineCategory(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes("prisma") || message.includes("database") || message.includes("sql")) {
      return "database";
    }
    if (message.includes("fetch") || message.includes("network") || message.includes("econnrefused")) {
      return "network";
    }
    if (message.includes("auth") || message.includes("unauthorized") || message.includes("forbidden")) {
      return "auth";
    }
    if (name.includes("validation") || message.includes("invalid") || message.includes("required")) {
      return "validation";
    }
    if (message.includes("payment") || message.includes("stripe") || message.includes("iyzico")) {
      return "payment";
    }
    if (message.includes("api") || message.includes("external")) {
      return "external";
    }

    return "runtime";
  }

  /**
   * Capture error
   */
  async capture(
    error: Error,
    context: ErrorContext = {},
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const category = options.category || this.determineCategory(error);
    const severity = options.severity || this.determineSeverity(error, category);
    const fingerprint = this.generateFingerprint(error, category);

    // Check if error already in buffer
    const existing = this.errorBuffer.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.occurredAt = new Date();
      existing.context = { ...existing.context, ...context };
      return existing.id;
    }

    const entry: ErrorEntry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      category,
      severity,
      context,
      fingerprint,
      occurredAt: new Date(),
      resolved: false,
      count: 1,
      metadata: options.metadata,
    };

    this.errorBuffer.set(fingerprint, entry);

    // Immediate flush for critical errors
    if (severity === "critical") {
      await this.flushBuffer();
      await this.notifyCriticalError(entry);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[${category.toUpperCase()}] ${error.message}`, {
        severity,
        context,
        stack: error.stack,
      });
    }

    return entry.id;
  }

  /**
   * Capture error from request
   */
  async captureRequest(
    error: Error,
    req: {
      url?: string;
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, any>;
      ip?: string;
      userId?: string;
    }
  ): Promise<string> {
    const context: ErrorContext = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: this.sanitizeBody(req.body),
      query: req.query,
      ip: req.ip,
      userId: req.userId,
      requestId: req.headers?.["x-request-id"],
    };

    return this.capture(error, context);
  }

  /**
   * Sanitize request body (remove sensitive data)
   */
  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    const sensitiveKeys = ["password", "token", "secret", "apiKey", "creditCard", "cvv"];
    const sanitized = { ...body };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Flush error buffer to database
   */
  private async flushBuffer(): Promise<void> {
    if (this.errorBuffer.size === 0) return;

    const errors = Array.from(this.errorBuffer.values());
    this.errorBuffer.clear();

    try {
      for (const error of errors) {
        // Upsert based on fingerprint
        await prisma.errorLog.upsert({
          where: { fingerprint: error.fingerprint },
          create: {
            id: error.id,
            message: error.message,
            stack: error.stack,
            category: error.category,
            severity: error.severity,
            context: error.context as any,
            fingerprint: error.fingerprint,
            occurredAt: error.occurredAt,
            resolved: false,
            count: error.count,
            metadata: error.metadata || {},
          },
          update: {
            count: { increment: error.count },
            occurredAt: error.occurredAt,
            context: error.context as any,
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to persist errors:", dbError);
      // Put errors back in buffer
      for (const error of errors) {
        this.errorBuffer.set(error.fingerprint, error);
      }
    }
  }

  /**
   * Notify about critical errors
   */
  private async notifyCriticalError(entry: ErrorEntry): Promise<void> {
    // In production, send to monitoring service (Sentry, Discord, Slack, etc.)
    console.error("🚨 CRITICAL ERROR:", {
      id: entry.id,
      message: entry.message,
      category: entry.category,
      context: entry.context,
    });

    // TODO: Integrate with notification service
    // await sendSlackNotification(entry);
    // await sendEmailAlert(entry);
  }

  /**
   * Get error statistics
   */
  async getStats(): Promise<ErrorStats> {
    const [total, unresolved, bySeverity, byCategory, last24h, topErrors] =
      await Promise.all([
        prisma.errorLog.count(),
        prisma.errorLog.count({ where: { resolved: false } }),
        prisma.errorLog.groupBy({
          by: ["severity"],
          _count: true,
        }),
        prisma.errorLog.groupBy({
          by: ["category"],
          _count: true,
        }),
        prisma.errorLog.count({
          where: {
            occurredAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.errorLog.findMany({
          where: { resolved: false },
          orderBy: { count: "desc" },
          take: 10,
          select: {
            fingerprint: true,
            message: true,
            count: true,
            occurredAt: true,
          },
        }),
      ]);

    return {
      total,
      unresolved,
      bySeverity: Object.fromEntries(
        bySeverity.map((s) => [s.severity, s._count])
      ) as Record<ErrorSeverity, number>,
      byCategory: Object.fromEntries(
        byCategory.map((c) => [c.category, c._count])
      ) as Record<ErrorCategory, number>,
      last24h,
      topErrors: topErrors.map((e) => ({
        fingerprint: e.fingerprint,
        message: e.message,
        count: e.count,
        lastOccurred: e.occurredAt,
      })),
    };
  }

  /**
   * List errors with filtering
   */
  async list(options: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    resolved?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{
    errors: ErrorEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.category) where.category = options.category;
    if (options.severity) where.severity = options.severity;
    if (options.resolved !== undefined) where.resolved = options.resolved;
    if (options.search) {
      where.message = { contains: options.search, mode: "insensitive" };
    }

    const [errors, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.errorLog.count({ where }),
    ]);

    return {
      errors: errors.map((e) => ({
        id: e.id,
        message: e.message,
        stack: e.stack || undefined,
        category: e.category as ErrorCategory,
        severity: e.severity as ErrorSeverity,
        context: e.context as ErrorContext,
        fingerprint: e.fingerprint,
        occurredAt: e.occurredAt,
        resolved: e.resolved,
        count: e.count,
        metadata: e.metadata as Record<string, any>,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Resolve error
   */
  async resolve(fingerprint: string): Promise<boolean> {
    try {
      await prisma.errorLog.update({
        where: { fingerprint },
        data: { resolved: true, resolvedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unresolve error
   */
  async unresolve(fingerprint: string): Promise<boolean> {
    try {
      await prisma.errorLog.update({
        where: { fingerprint },
        data: { resolved: false, resolvedAt: null },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete old resolved errors
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const result = await prisma.errorLog.deleteMany({
      where: {
        resolved: true,
        resolvedAt: { lt: cutoff },
      },
    });

    return result.count;
  }

  /**
   * Stop the tracker
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushBuffer();
  }
}

// Singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Helper function for try-catch blocks
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      await errorTracker.capture(error, context);
    }
    throw error;
  }
}

export default errorTracker;

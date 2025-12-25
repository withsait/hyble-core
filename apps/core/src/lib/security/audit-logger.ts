/**
 * Audit Logger for Hyble Core
 * Comprehensive audit logging system for security and compliance
 */

import { prisma } from "@hyble/db";

// Audit event types
export type AuditEventType =
  // Authentication events
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "auth.password_change"
  | "auth.password_reset"
  | "auth.2fa_enabled"
  | "auth.2fa_disabled"
  | "auth.session_revoked"
  // User events
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.role_changed"
  | "user.status_changed"
  | "user.email_verified"
  // Organization events
  | "org.created"
  | "org.updated"
  | "org.deleted"
  | "org.member_added"
  | "org.member_removed"
  | "org.member_role_changed"
  // Billing events
  | "billing.subscription_created"
  | "billing.subscription_updated"
  | "billing.subscription_cancelled"
  | "billing.payment_success"
  | "billing.payment_failed"
  | "billing.refund_issued"
  | "billing.invoice_created"
  // Admin events
  | "admin.user_impersonated"
  | "admin.settings_changed"
  | "admin.feature_toggled"
  | "admin.data_exported"
  | "admin.data_deleted"
  // Security events
  | "security.suspicious_activity"
  | "security.ip_blocked"
  | "security.rate_limit_exceeded"
  | "security.permission_denied"
  // Data events
  | "data.created"
  | "data.updated"
  | "data.deleted"
  | "data.exported"
  | "data.imported"
  // API events
  | "api.key_created"
  | "api.key_revoked"
  | "api.request"
  // System events
  | "system.startup"
  | "system.shutdown"
  | "system.error"
  | "system.maintenance";

// Audit event severity levels
export type AuditSeverity = "info" | "warning" | "error" | "critical";

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  description?: string;
  metadata?: Record<string, any>;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  timestamp?: Date;
  success: boolean;
}

// Audit log query options
export interface AuditLogQueryOptions {
  userId?: string;
  organizationId?: string;
  eventType?: AuditEventType | AuditEventType[];
  severity?: AuditSeverity | AuditSeverity[];
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "timestamp" | "severity" | "eventType";
  sortOrder?: "asc" | "desc";
}

// Event type to severity mapping
const eventSeverityMap: Record<AuditEventType, AuditSeverity> = {
  // Authentication
  "auth.login": "info",
  "auth.logout": "info",
  "auth.login_failed": "warning",
  "auth.password_change": "info",
  "auth.password_reset": "info",
  "auth.2fa_enabled": "info",
  "auth.2fa_disabled": "warning",
  "auth.session_revoked": "info",
  // User
  "user.created": "info",
  "user.updated": "info",
  "user.deleted": "warning",
  "user.role_changed": "warning",
  "user.status_changed": "warning",
  "user.email_verified": "info",
  // Organization
  "org.created": "info",
  "org.updated": "info",
  "org.deleted": "critical",
  "org.member_added": "info",
  "org.member_removed": "warning",
  "org.member_role_changed": "warning",
  // Billing
  "billing.subscription_created": "info",
  "billing.subscription_updated": "info",
  "billing.subscription_cancelled": "warning",
  "billing.payment_success": "info",
  "billing.payment_failed": "error",
  "billing.refund_issued": "warning",
  "billing.invoice_created": "info",
  // Admin
  "admin.user_impersonated": "critical",
  "admin.settings_changed": "warning",
  "admin.feature_toggled": "warning",
  "admin.data_exported": "warning",
  "admin.data_deleted": "critical",
  // Security
  "security.suspicious_activity": "critical",
  "security.ip_blocked": "warning",
  "security.rate_limit_exceeded": "warning",
  "security.permission_denied": "warning",
  // Data
  "data.created": "info",
  "data.updated": "info",
  "data.deleted": "warning",
  "data.exported": "info",
  "data.imported": "info",
  // API
  "api.key_created": "info",
  "api.key_revoked": "warning",
  "api.request": "info",
  // System
  "system.startup": "info",
  "system.shutdown": "info",
  "system.error": "error",
  "system.maintenance": "warning",
};

/**
 * Audit Logger class
 */
export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "severity" | "timestamp">): Promise<void> {
    try {
      const severity = eventSeverityMap[entry.eventType] || "info";
      const timestamp = new Date();

      // Create audit log entry in database
      await prisma.auditLog.create({
        data: {
          eventType: entry.eventType,
          severity,
          userId: entry.userId,
          userEmail: entry.userEmail,
          organizationId: entry.organizationId,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          action: entry.action,
          description: entry.description,
          metadata: entry.metadata || {},
          oldValue: entry.oldValue || {},
          newValue: entry.newValue || {},
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          requestId: entry.requestId,
          success: entry.success,
          createdAt: timestamp,
        },
      });

      // Log critical events to console as well
      if (severity === "critical" || severity === "error") {
        console.log(`[AUDIT ${severity.toUpperCase()}]`, {
          eventType: entry.eventType,
          userId: entry.userId,
          action: entry.action,
          timestamp: timestamp.toISOString(),
        });
      }
    } catch (error) {
      // Don't throw - audit logging should not break the application
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * Log an authentication event
   */
  async logAuth(
    eventType: Extract<AuditEventType, `auth.${string}`>,
    userId: string | undefined,
    options: {
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      userEmail: options.email,
      action: eventType.replace("auth.", "").replace(/_/g, " "),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: options.success ?? true,
      metadata: options.metadata,
    });
  }

  /**
   * Log a data change event
   */
  async logDataChange(
    eventType: Extract<AuditEventType, `data.${string}`>,
    userId: string,
    resourceType: string,
    resourceId: string,
    options: {
      oldValue?: Record<string, any>;
      newValue?: Record<string, any>;
      description?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      resourceType,
      resourceId,
      action: `${eventType.split(".")[1]} ${resourceType}`,
      description: options.description,
      oldValue: options.oldValue,
      newValue: options.newValue,
      metadata: options.metadata,
      success: true,
    });
  }

  /**
   * Log an admin action
   */
  async logAdminAction(
    eventType: Extract<AuditEventType, `admin.${string}`>,
    adminUserId: string,
    options: {
      targetUserId?: string;
      description?: string;
      metadata?: Record<string, any>;
      ipAddress?: string;
    } = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId: adminUserId,
      resourceType: "admin_action",
      resourceId: options.targetUserId,
      action: eventType.replace("admin.", "").replace(/_/g, " "),
      description: options.description,
      ipAddress: options.ipAddress,
      metadata: {
        ...options.metadata,
        targetUserId: options.targetUserId,
      },
      success: true,
    });
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(
    eventType: Extract<AuditEventType, `security.${string}`>,
    options: {
      userId?: string;
      ipAddress?: string;
      description?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId: options.userId,
      action: eventType.replace("security.", "").replace(/_/g, " "),
      description: options.description,
      ipAddress: options.ipAddress,
      metadata: options.metadata,
      success: false,
    });
  }

  /**
   * Query audit logs
   */
  async query(options: AuditLogQueryOptions = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.organizationId) {
      where.organizationId = options.organizationId;
    }

    if (options.eventType) {
      where.eventType = Array.isArray(options.eventType)
        ? { in: options.eventType }
        : options.eventType;
    }

    if (options.severity) {
      where.severity = Array.isArray(options.severity)
        ? { in: options.severity }
        : options.severity;
    }

    if (options.resourceType) {
      where.resourceType = options.resourceType;
    }

    if (options.resourceId) {
      where.resourceId = options.resourceId;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    if (options.search) {
      where.OR = [
        { action: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
        { userEmail: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [options.sortBy || "createdAt"]: options.sortOrder || "desc",
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        eventType: log.eventType as AuditEventType,
        severity: log.severity as AuditSeverity,
        userId: log.userId || undefined,
        userEmail: log.userEmail || undefined,
        organizationId: log.organizationId || undefined,
        resourceType: log.resourceType || undefined,
        resourceId: log.resourceId || undefined,
        action: log.action,
        description: log.description || undefined,
        metadata: log.metadata as Record<string, any>,
        oldValue: log.oldValue as Record<string, any>,
        newValue: log.newValue as Record<string, any>,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        requestId: log.requestId || undefined,
        timestamp: log.createdAt,
        success: log.success,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit log statistics
   */
  async getStats(options: {
    startDate?: Date;
    endDate?: Date;
    organizationId?: string;
  } = {}): Promise<{
    totalEvents: number;
    byEventType: Record<string, number>;
    bySeverity: Record<string, number>;
    successRate: number;
    topUsers: { userId: string; count: number }[];
  }> {
    const where: any = {};

    if (options.organizationId) {
      where.organizationId = options.organizationId;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [total, byEventType, bySeverity, successCount, topUsers] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ["eventType"],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ["severity"],
        where,
        _count: true,
      }),
      prisma.auditLog.count({ where: { ...where, success: true } }),
      prisma.auditLog.groupBy({
        by: ["userId"],
        where: { ...where, userId: { not: null } },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalEvents: total,
      byEventType: Object.fromEntries(
        byEventType.map((e) => [e.eventType, e._count])
      ),
      bySeverity: Object.fromEntries(
        bySeverity.map((e) => [e.severity, e._count])
      ),
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      topUsers: topUsers.map((u) => ({
        userId: u.userId!,
        count: u._count,
      })),
    };
  }

  /**
   * Delete old audit logs (for GDPR compliance)
   */
  async deleteOldLogs(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions
export const logAudit = auditLogger.log.bind(auditLogger);
export const logAuth = auditLogger.logAuth.bind(auditLogger);
export const logDataChange = auditLogger.logDataChange.bind(auditLogger);
export const logAdminAction = auditLogger.logAdminAction.bind(auditLogger);
export const logSecurityEvent = auditLogger.logSecurityEvent.bind(auditLogger);

export default auditLogger;

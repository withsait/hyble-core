/**
 * Backup Manager for Hyble Core
 * Automated backup system for database and files
 */

import { prisma } from "@hyble/db";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

// Backup types
export type BackupType = "full" | "incremental" | "database" | "files" | "config";

// Backup status
export type BackupStatus = "pending" | "in_progress" | "completed" | "failed";

// Backup configuration
export interface BackupConfig {
  type: BackupType;
  destination: string; // Local path or S3 URL
  compression: boolean;
  encryption: boolean;
  encryptionKey?: string;
  retentionDays: number;
  schedule?: string; // Cron expression
}

// Backup result
export interface BackupResult {
  id: string;
  type: BackupType;
  status: BackupStatus;
  startedAt: Date;
  completedAt?: Date;
  size?: number;
  path?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Default configurations
const defaultConfigs: Record<BackupType, BackupConfig> = {
  full: {
    type: "full",
    destination: "/backups/full",
    compression: true,
    encryption: true,
    retentionDays: 30,
    schedule: "0 2 * * 0", // Every Sunday at 2 AM
  },
  incremental: {
    type: "incremental",
    destination: "/backups/incremental",
    compression: true,
    encryption: true,
    retentionDays: 7,
    schedule: "0 2 * * *", // Every day at 2 AM
  },
  database: {
    type: "database",
    destination: "/backups/database",
    compression: true,
    encryption: true,
    retentionDays: 14,
    schedule: "0 */6 * * *", // Every 6 hours
  },
  files: {
    type: "files",
    destination: "/backups/files",
    compression: true,
    encryption: false,
    retentionDays: 7,
  },
  config: {
    type: "config",
    destination: "/backups/config",
    compression: false,
    encryption: true,
    retentionDays: 90,
  },
};

/**
 * Backup Manager class
 */
export class BackupManager {
  private static instance: BackupManager;
  private runningBackups: Map<string, BackupResult> = new Map();

  private constructor() {}

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `backup_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create database backup
   */
  async createDatabaseBackup(config?: Partial<BackupConfig>): Promise<BackupResult> {
    const mergedConfig = { ...defaultConfigs.database, ...config };
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `db_backup_${timestamp}.sql`;
    const filepath = path.join(mergedConfig.destination, filename);

    const result: BackupResult = {
      id: backupId,
      type: "database",
      status: "in_progress",
      startedAt: new Date(),
    };

    this.runningBackups.set(backupId, result);

    try {
      // Ensure destination directory exists
      await fs.mkdir(mergedConfig.destination, { recursive: true });

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL not configured");
      }

      // Parse database URL
      const url = new URL(databaseUrl);
      const host = url.hostname;
      const port = url.port || "5432";
      const database = url.pathname.slice(1);
      const username = url.username;
      const password = url.password;

      // Create pg_dump command
      const pgDumpCmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F c -f ${filepath}`;

      await execAsync(pgDumpCmd);

      // Compress if enabled
      let finalPath = filepath;
      if (mergedConfig.compression) {
        await execAsync(`gzip ${filepath}`);
        finalPath = `${filepath}.gz`;
      }

      // Get file size
      const stats = await fs.stat(finalPath);

      result.status = "completed";
      result.completedAt = new Date();
      result.path = finalPath;
      result.size = stats.size;

      // Log backup to database
      await this.logBackup(result);

      // Clean old backups
      await this.cleanOldBackups(mergedConfig);
    } catch (error) {
      result.status = "failed";
      result.completedAt = new Date();
      result.error = error instanceof Error ? error.message : "Backup failed";
      console.error("Database backup failed:", error);
    }

    this.runningBackups.delete(backupId);
    return result;
  }

  /**
   * Create file backup
   */
  async createFileBackup(
    sourcePath: string,
    config?: Partial<BackupConfig>
  ): Promise<BackupResult> {
    const mergedConfig = { ...defaultConfigs.files, ...config };
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `files_backup_${timestamp}.tar`;
    const filepath = path.join(mergedConfig.destination, filename);

    const result: BackupResult = {
      id: backupId,
      type: "files",
      status: "in_progress",
      startedAt: new Date(),
    };

    this.runningBackups.set(backupId, result);

    try {
      // Ensure destination directory exists
      await fs.mkdir(mergedConfig.destination, { recursive: true });

      // Create tar archive
      const tarCmd = mergedConfig.compression
        ? `tar -czf ${filepath}.gz -C ${path.dirname(sourcePath)} ${path.basename(sourcePath)}`
        : `tar -cf ${filepath} -C ${path.dirname(sourcePath)} ${path.basename(sourcePath)}`;

      await execAsync(tarCmd);

      const finalPath = mergedConfig.compression ? `${filepath}.gz` : filepath;
      const stats = await fs.stat(finalPath);

      result.status = "completed";
      result.completedAt = new Date();
      result.path = finalPath;
      result.size = stats.size;

      await this.logBackup(result);
      await this.cleanOldBackups(mergedConfig);
    } catch (error) {
      result.status = "failed";
      result.completedAt = new Date();
      result.error = error instanceof Error ? error.message : "Backup failed";
      console.error("File backup failed:", error);
    }

    this.runningBackups.delete(backupId);
    return result;
  }

  /**
   * Restore database from backup
   */
  async restoreDatabase(backupPath: string): Promise<boolean> {
    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL not configured");
      }

      const url = new URL(databaseUrl);
      const host = url.hostname;
      const port = url.port || "5432";
      const database = url.pathname.slice(1);
      const username = url.username;
      const password = url.password;

      // Decompress if needed
      let sqlPath = backupPath;
      if (backupPath.endsWith(".gz")) {
        await execAsync(`gunzip -c ${backupPath} > /tmp/restore.sql`);
        sqlPath = "/tmp/restore.sql";
      }

      // Restore database
      const pgRestoreCmd = `PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c ${sqlPath}`;

      await execAsync(pgRestoreCmd);

      console.log("Database restored successfully from:", backupPath);
      return true;
    } catch (error) {
      console.error("Database restore failed:", error);
      return false;
    }
  }

  /**
   * List available backups
   */
  async listBackups(
    type?: BackupType,
    limit: number = 50
  ): Promise<BackupResult[]> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const backups = await prisma.backup.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return backups.map((b) => ({
      id: b.id,
      type: b.type as BackupType,
      status: b.status as BackupStatus,
      startedAt: b.startedAt,
      completedAt: b.completedAt || undefined,
      size: b.size || undefined,
      path: b.path || undefined,
      error: b.error || undefined,
      metadata: b.metadata as Record<string, any>,
    }));
  }

  /**
   * Get backup by ID
   */
  async getBackup(backupId: string): Promise<BackupResult | null> {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) return null;

    return {
      id: backup.id,
      type: backup.type as BackupType,
      status: backup.status as BackupStatus,
      startedAt: backup.startedAt,
      completedAt: backup.completedAt || undefined,
      size: backup.size || undefined,
      path: backup.path || undefined,
      error: backup.error || undefined,
      metadata: backup.metadata as Record<string, any>,
    };
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) return false;

      // Delete file if exists
      if (backup.path) {
        try {
          await fs.unlink(backup.path);
        } catch {
          // File might not exist
        }
      }

      await prisma.backup.delete({
        where: { id: backupId },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete backup:", error);
      return false;
    }
  }

  /**
   * Log backup to database
   */
  private async logBackup(result: BackupResult): Promise<void> {
    try {
      await prisma.backup.create({
        data: {
          id: result.id,
          type: result.type,
          status: result.status,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          size: result.size,
          path: result.path,
          error: result.error,
          metadata: result.metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to log backup:", error);
    }
  }

  /**
   * Clean old backups based on retention policy
   */
  private async cleanOldBackups(config: BackupConfig): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

      const oldBackups = await prisma.backup.findMany({
        where: {
          type: config.type,
          startedAt: { lt: cutoffDate },
        },
      });

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.id);
      }

      console.log(
        `Cleaned ${oldBackups.length} old ${config.type} backups`
      );
    } catch (error) {
      console.error("Failed to clean old backups:", error);
    }
  }

  /**
   * Get backup statistics
   */
  async getStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup?: BackupResult;
    byType: Record<BackupType, { count: number; size: number }>;
    successRate: number;
  }> {
    const [
      totalBackups,
      totalSize,
      lastBackup,
      byType,
      successCount,
    ] = await Promise.all([
      prisma.backup.count(),
      prisma.backup.aggregate({ _sum: { size: true } }),
      prisma.backup.findFirst({
        where: { status: "completed" },
        orderBy: { startedAt: "desc" },
      }),
      prisma.backup.groupBy({
        by: ["type"],
        _count: true,
        _sum: { size: true },
      }),
      prisma.backup.count({ where: { status: "completed" } }),
    ]);

    return {
      totalBackups,
      totalSize: totalSize._sum.size || 0,
      lastBackup: lastBackup
        ? {
            id: lastBackup.id,
            type: lastBackup.type as BackupType,
            status: lastBackup.status as BackupStatus,
            startedAt: lastBackup.startedAt,
            completedAt: lastBackup.completedAt || undefined,
            size: lastBackup.size || undefined,
            path: lastBackup.path || undefined,
          }
        : undefined,
      byType: Object.fromEntries(
        byType.map((b) => [
          b.type,
          { count: b._count, size: b._sum.size || 0 },
        ])
      ) as Record<BackupType, { count: number; size: number }>,
      successRate: totalBackups > 0 ? (successCount / totalBackups) * 100 : 0,
    };
  }

  /**
   * Get running backups
   */
  getRunningBackups(): BackupResult[] {
    return Array.from(this.runningBackups.values());
  }
}

// Singleton instance
export const backupManager = BackupManager.getInstance();

export default backupManager;

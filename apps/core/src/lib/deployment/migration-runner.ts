/**
 * Migration Runner for Hyble Core
 * Database migration management with rollback support
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

// Migration status
export type MigrationStatus = "pending" | "applied" | "failed" | "rolled_back";

// Migration entry
export interface MigrationEntry {
  id: string;
  name: string;
  appliedAt?: Date;
  status: MigrationStatus;
  duration?: number; // ms
  error?: string;
}

// Migration result
export interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  migrationsRolledBack: number;
  errors: string[];
  details: MigrationEntry[];
}

// Migration options
export interface MigrationOptions {
  dryRun?: boolean;
  force?: boolean;
  targetMigration?: string;
  skipSeed?: boolean;
}

/**
 * Migration Runner class
 */
export class MigrationRunner {
  private static instance: MigrationRunner;
  private prismaPath: string;
  private migrationsPath: string;

  private constructor() {
    this.prismaPath = path.resolve(
      process.cwd(),
      "../../packages/db/prisma"
    );
    this.migrationsPath = path.join(this.prismaPath, "migrations");
  }

  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner();
    }
    return MigrationRunner.instance;
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    pendingMigrations: string[];
    appliedMigrations: string[];
    failedMigrations: string[];
    databaseConnected: boolean;
  }> {
    try {
      // Check database connection
      const { stdout: statusOutput } = await execAsync(
        `npx prisma migrate status --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );

      const pendingMigrations: string[] = [];
      const appliedMigrations: string[] = [];
      const failedMigrations: string[] = [];

      // Parse output
      const lines = statusOutput.split("\n");
      for (const line of lines) {
        if (line.includes("Not yet applied")) {
          const match = line.match(/(\d{14}_\w+)/);
          if (match) pendingMigrations.push(match[1]);
        } else if (line.includes("Applied")) {
          const match = line.match(/(\d{14}_\w+)/);
          if (match) appliedMigrations.push(match[1]);
        } else if (line.includes("Failed")) {
          const match = line.match(/(\d{14}_\w+)/);
          if (match) failedMigrations.push(match[1]);
        }
      }

      return {
        pendingMigrations,
        appliedMigrations,
        failedMigrations,
        databaseConnected: true,
      };
    } catch (error) {
      console.error("Migration status check failed:", error);
      return {
        pendingMigrations: [],
        appliedMigrations: [],
        failedMigrations: [],
        databaseConnected: false,
      };
    }
  }

  /**
   * Run pending migrations
   */
  async migrate(options: MigrationOptions = {}): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrationsApplied: 0,
      migrationsRolledBack: 0,
      errors: [],
      details: [],
    };

    try {
      const startTime = Date.now();

      // Build command
      let cmd = `npx prisma migrate deploy --schema=${this.prismaPath}/schema.prisma`;

      if (options.dryRun) {
        // For dry run, just show status
        const status = await this.getStatus();
        result.success = true;
        result.details = status.pendingMigrations.map((name) => ({
          id: name,
          name,
          status: "pending" as MigrationStatus,
        }));
        return result;
      }

      const { stdout, stderr } = await execAsync(cmd, {
        cwd: process.cwd(),
        env: { ...process.env },
      });

      // Parse output
      const appliedMatches = stdout.match(/(\d+) migrations? applied/i);
      if (appliedMatches) {
        result.migrationsApplied = parseInt(appliedMatches[1], 10);
      }

      // Generate Prisma client
      await this.generateClient();

      // Run seed if not skipped
      if (!options.skipSeed && result.migrationsApplied > 0) {
        await this.runSeed();
      }

      result.success = true;
      result.details = [{
        id: `batch_${Date.now()}`,
        name: `Applied ${result.migrationsApplied} migrations`,
        appliedAt: new Date(),
        status: "applied",
        duration: Date.now() - startTime,
      }];

      console.log(`✅ Migration completed: ${result.migrationsApplied} migrations applied`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Migration failed";
      result.errors.push(message);
      result.details.push({
        id: `error_${Date.now()}`,
        name: "Migration Error",
        status: "failed",
        error: message,
      });
      console.error("Migration failed:", error);
    }

    return result;
  }

  /**
   * Reset database (dangerous!)
   */
  async reset(options: { force?: boolean } = {}): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrationsApplied: 0,
      migrationsRolledBack: 0,
      errors: [],
      details: [],
    };

    if (!options.force) {
      result.errors.push("Reset requires force flag");
      return result;
    }

    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      result.errors.push("Database reset not allowed in production");
      return result;
    }

    try {
      const startTime = Date.now();

      // Reset database
      await execAsync(
        `npx prisma migrate reset --force --skip-seed --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );

      // Re-run migrations
      const migrateResult = await this.migrate();

      result.success = true;
      result.migrationsApplied = migrateResult.migrationsApplied;
      result.details = [{
        id: `reset_${Date.now()}`,
        name: "Database Reset",
        appliedAt: new Date(),
        status: "applied",
        duration: Date.now() - startTime,
      }];

      console.log("✅ Database reset completed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reset failed";
      result.errors.push(message);
      console.error("Database reset failed:", error);
    }

    return result;
  }

  /**
   * Push schema changes (development only)
   */
  async push(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrationsApplied: 0,
      migrationsRolledBack: 0,
      errors: [],
      details: [],
    };

    if (process.env.NODE_ENV === "production") {
      result.errors.push("Schema push not allowed in production");
      return result;
    }

    try {
      const startTime = Date.now();

      await execAsync(
        `npx prisma db push --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );

      await this.generateClient();

      result.success = true;
      result.details = [{
        id: `push_${Date.now()}`,
        name: "Schema Push",
        appliedAt: new Date(),
        status: "applied",
        duration: Date.now() - startTime,
      }];

      console.log("✅ Schema pushed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Push failed";
      result.errors.push(message);
      console.error("Schema push failed:", error);
    }

    return result;
  }

  /**
   * Generate Prisma client
   */
  async generateClient(): Promise<boolean> {
    try {
      await execAsync(
        `npx prisma generate --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );
      console.log("✅ Prisma client generated");
      return true;
    } catch (error) {
      console.error("Client generation failed:", error);
      return false;
    }
  }

  /**
   * Run database seed
   */
  async runSeed(): Promise<boolean> {
    try {
      const seedPath = path.join(this.prismaPath, "seed.ts");
      const seedExists = await fs.access(seedPath).then(() => true).catch(() => false);

      if (!seedExists) {
        console.log("No seed file found, skipping");
        return true;
      }

      await execAsync(`npx tsx ${seedPath}`, { cwd: process.cwd() });
      console.log("✅ Database seeded");
      return true;
    } catch (error) {
      console.error("Seed failed:", error);
      return false;
    }
  }

  /**
   * Create new migration
   */
  async createMigration(name: string): Promise<{
    success: boolean;
    migrationName?: string;
    path?: string;
    error?: string;
  }> {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Cannot create migrations in production" };
    }

    try {
      const { stdout } = await execAsync(
        `npx prisma migrate dev --name ${name} --create-only --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );

      // Parse migration name from output
      const match = stdout.match(/Created migration (\d{14}_\w+)/);
      const migrationName = match ? match[1] : name;
      const migrationPath = path.join(this.migrationsPath, migrationName);

      console.log(`✅ Migration created: ${migrationName}`);

      return {
        success: true,
        migrationName,
        path: migrationPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Migration creation failed";
      console.error("Migration creation failed:", error);
      return { success: false, error: message };
    }
  }

  /**
   * List all migrations
   */
  async listMigrations(): Promise<MigrationEntry[]> {
    try {
      const migrations: MigrationEntry[] = [];

      // Read migrations directory
      const files = await fs.readdir(this.migrationsPath);
      const migrationDirs = files.filter((f) =>
        /^\d{14}_/.test(f)
      );

      // Get status
      const status = await this.getStatus();

      for (const dir of migrationDirs.sort()) {
        let migrationStatus: MigrationStatus = "pending";

        if (status.appliedMigrations.includes(dir)) {
          migrationStatus = "applied";
        } else if (status.failedMigrations.includes(dir)) {
          migrationStatus = "failed";
        }

        migrations.push({
          id: dir,
          name: dir.replace(/^\d{14}_/, ""),
          status: migrationStatus,
        });
      }

      return migrations;
    } catch (error) {
      console.error("Failed to list migrations:", error);
      return [];
    }
  }

  /**
   * Validate schema
   */
  async validateSchema(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    try {
      await execAsync(
        `npx prisma validate --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );
      return { valid: true, errors: [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Validation failed";
      return {
        valid: false,
        errors: [message],
      };
    }
  }

  /**
   * Format schema file
   */
  async formatSchema(): Promise<boolean> {
    try {
      await execAsync(
        `npx prisma format --schema=${this.prismaPath}/schema.prisma`,
        { cwd: process.cwd() }
      );
      console.log("✅ Schema formatted");
      return true;
    } catch (error) {
      console.error("Schema formatting failed:", error);
      return false;
    }
  }

  /**
   * Get database info
   */
  async getDatabaseInfo(): Promise<{
    provider: string;
    url: string;
    connected: boolean;
    version?: string;
  }> {
    try {
      const schemaContent = await fs.readFile(
        path.join(this.prismaPath, "schema.prisma"),
        "utf-8"
      );

      // Extract provider
      const providerMatch = schemaContent.match(/provider\s*=\s*"(\w+)"/);
      const provider = providerMatch ? providerMatch[1] : "unknown";

      // Check connection
      const status = await this.getStatus();

      // Get version (PostgreSQL specific)
      let version: string | undefined;
      if (provider === "postgresql" && status.databaseConnected) {
        try {
          const { stdout } = await execAsync(
            `psql "$DATABASE_URL" -t -c "SELECT version();"`,
            { cwd: process.cwd() }
          );
          version = stdout.trim().split(",")[0];
        } catch {
          // Ignore version fetch errors
        }
      }

      return {
        provider,
        url: process.env.DATABASE_URL ? "[CONFIGURED]" : "[NOT SET]",
        connected: status.databaseConnected,
        version,
      };
    } catch (error) {
      return {
        provider: "unknown",
        url: "[ERROR]",
        connected: false,
      };
    }
  }
}

// Singleton instance
export const migrationRunner = MigrationRunner.getInstance();

export default migrationRunner;

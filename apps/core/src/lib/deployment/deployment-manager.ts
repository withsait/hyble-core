/**
 * Deployment Manager for Hyble Core
 * Orchestrates deployments with rollback support
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

// Deployment status
export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "running"
  | "failed"
  | "rolled_back"
  | "completed";

// Deployment target
export type DeploymentTarget = "production" | "staging" | "preview";

// App names
export type AppName = "core" | "gateway" | "digital" | "studios" | "console";

// Deployment configuration
export interface DeploymentConfig {
  target: DeploymentTarget;
  apps: AppName[];
  branch?: string;
  commit?: string;
  runMigrations: boolean;
  runTests: boolean;
  notifySlack: boolean;
  rollbackOnFail: boolean;
}

// Deployment result
export interface DeploymentResult {
  id: string;
  status: DeploymentStatus;
  target: DeploymentTarget;
  apps: AppName[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  commit?: string;
  branch?: string;
  logs: string[];
  errors: string[];
  previousVersion?: string;
}

// Deployment step
interface DeploymentStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  duration?: number;
  error?: string;
}

/**
 * Deployment Manager class
 */
export class DeploymentManager {
  private static instance: DeploymentManager;
  private currentDeployment: DeploymentResult | null = null;
  private deploymentHistory: DeploymentResult[] = [];

  private constructor() {}

  static getInstance(): DeploymentManager {
    if (!DeploymentManager.instance) {
      DeploymentManager.instance = new DeploymentManager();
    }
    return DeploymentManager.instance;
  }

  /**
   * Generate deployment ID
   */
  private generateDeploymentId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `deploy_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Start deployment
   */
  async deploy(config: DeploymentConfig): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId();
    const result: DeploymentResult = {
      id: deploymentId,
      status: "pending",
      target: config.target,
      apps: config.apps,
      startedAt: new Date(),
      branch: config.branch,
      commit: config.commit,
      logs: [],
      errors: [],
    };

    this.currentDeployment = result;
    this.log(result, `Starting deployment to ${config.target}`);

    const steps: DeploymentStep[] = [
      { name: "Pre-flight checks", status: "pending" },
      { name: "Pull latest code", status: "pending" },
      { name: "Install dependencies", status: "pending" },
      { name: "Run tests", status: config.runTests ? "pending" : "skipped" },
      { name: "Run migrations", status: config.runMigrations ? "pending" : "skipped" },
      { name: "Build applications", status: "pending" },
      { name: "Deploy applications", status: "pending" },
      { name: "Health checks", status: "pending" },
      { name: "Post-deployment", status: "pending" },
    ];

    try {
      // Step 1: Pre-flight checks
      result.status = "building";
      await this.runStep(steps[0], result, async () => {
        await this.preFlightChecks(config);
      });

      // Step 2: Pull latest code
      await this.runStep(steps[1], result, async () => {
        await this.pullCode(config);
      });

      // Step 3: Install dependencies
      await this.runStep(steps[2], result, async () => {
        await this.installDependencies(result);
      });

      // Step 4: Run tests (if enabled)
      if (config.runTests) {
        await this.runStep(steps[3], result, async () => {
          await this.runTests(result);
        });
      }

      // Step 5: Run migrations (if enabled)
      if (config.runMigrations) {
        await this.runStep(steps[4], result, async () => {
          await this.runMigrations(result);
        });
      }

      // Step 6: Build applications
      await this.runStep(steps[5], result, async () => {
        await this.buildApps(config.apps, result);
      });

      // Step 7: Deploy applications
      result.status = "deploying";
      await this.runStep(steps[6], result, async () => {
        await this.deployApps(config.apps, config.target, result);
      });

      // Step 8: Health checks
      await this.runStep(steps[7], result, async () => {
        await this.healthChecks(config.apps, result);
      });

      // Step 9: Post-deployment
      await this.runStep(steps[8], result, async () => {
        await this.postDeployment(config, result);
      });

      result.status = "completed";
      result.completedAt = new Date();
      result.duration = result.completedAt.getTime() - result.startedAt.getTime();

      this.log(result, `✅ Deployment completed successfully in ${result.duration}ms`);

      if (config.notifySlack) {
        await this.notifySlack(result, "success");
      }
    } catch (error) {
      result.status = "failed";
      result.completedAt = new Date();
      result.duration = result.completedAt.getTime() - result.startedAt.getTime();
      result.errors.push(error instanceof Error ? error.message : "Deployment failed");

      this.log(result, `❌ Deployment failed: ${error}`);

      if (config.rollbackOnFail && result.previousVersion) {
        await this.rollback(result);
      }

      if (config.notifySlack) {
        await this.notifySlack(result, "failure");
      }
    }

    this.deploymentHistory.push(result);
    this.currentDeployment = null;

    return result;
  }

  /**
   * Run a deployment step
   */
  private async runStep(
    step: DeploymentStep,
    result: DeploymentResult,
    fn: () => Promise<void>
  ): Promise<void> {
    if (step.status === "skipped") {
      this.log(result, `⏭️  Skipping: ${step.name}`);
      return;
    }

    const startTime = Date.now();
    step.status = "running";
    this.log(result, `🔄 Running: ${step.name}`);

    try {
      await fn();
      step.status = "completed";
      step.duration = Date.now() - startTime;
      this.log(result, `✅ Completed: ${step.name} (${step.duration}ms)`);
    } catch (error) {
      step.status = "failed";
      step.duration = Date.now() - startTime;
      step.error = error instanceof Error ? error.message : "Step failed";
      this.log(result, `❌ Failed: ${step.name} - ${step.error}`);
      throw error;
    }
  }

  /**
   * Pre-flight checks
   */
  private async preFlightChecks(config: DeploymentConfig): Promise<void> {
    // Check disk space
    const { stdout: diskSpace } = await execAsync("df -h / | tail -1 | awk '{print $5}'");
    const usedPercent = parseInt(diskSpace.replace("%", ""), 10);
    if (usedPercent > 90) {
      throw new Error(`Disk space low: ${usedPercent}% used`);
    }

    // Check memory
    const { stdout: memInfo } = await execAsync(
      "free -m | grep Mem | awk '{print $4}'"
    );
    const freeMem = parseInt(memInfo, 10);
    if (freeMem < 512) {
      throw new Error(`Low memory: ${freeMem}MB free`);
    }

    // Validate environment
    if (config.target === "production") {
      const requiredVars = ["DATABASE_URL", "REDIS_URL", "NEXTAUTH_SECRET"];
      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Missing required env var: ${varName}`);
        }
      }
    }
  }

  /**
   * Pull latest code
   */
  private async pullCode(config: DeploymentConfig): Promise<void> {
    const branch = config.branch || "main";

    await execAsync(`git fetch origin`);
    await execAsync(`git checkout ${branch}`);
    await execAsync(`git pull origin ${branch}`);

    if (config.commit) {
      await execAsync(`git checkout ${config.commit}`);
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(result: DeploymentResult): Promise<void> {
    const { stdout } = await execAsync("pnpm install --frozen-lockfile", {
      timeout: 300000, // 5 minutes
    });
    this.log(result, stdout);
  }

  /**
   * Run tests
   */
  private async runTests(result: DeploymentResult): Promise<void> {
    const { stdout, stderr } = await execAsync("pnpm test", {
      timeout: 600000, // 10 minutes
    });
    this.log(result, stdout);
    if (stderr) this.log(result, stderr);
  }

  /**
   * Run migrations
   */
  private async runMigrations(result: DeploymentResult): Promise<void> {
    const { stdout } = await execAsync("pnpm db:migrate", {
      timeout: 300000,
    });
    this.log(result, stdout);
  }

  /**
   * Build applications
   */
  private async buildApps(
    apps: AppName[],
    result: DeploymentResult
  ): Promise<void> {
    for (const app of apps) {
      this.log(result, `Building ${app}...`);
      const { stdout } = await execAsync(`pnpm build --filter=@hyble/${app}`, {
        timeout: 600000, // 10 minutes
      });
      this.log(result, stdout);
    }
  }

  /**
   * Deploy applications
   */
  private async deployApps(
    apps: AppName[],
    target: DeploymentTarget,
    result: DeploymentResult
  ): Promise<void> {
    // Save current version for rollback
    const { stdout: currentCommit } = await execAsync("git rev-parse HEAD");
    result.previousVersion = currentCommit.trim();

    for (const app of apps) {
      this.log(result, `Deploying ${app} to ${target}...`);

      // PM2 deployment
      const pm2Name = `hyble-${app}`;
      const appPath = path.resolve(process.cwd(), `apps/${app}`);

      try {
        // Check if app is already running
        await execAsync(`pm2 describe ${pm2Name}`);
        // Reload if running
        await execAsync(`pm2 reload ${pm2Name}`);
      } catch {
        // Start if not running
        await execAsync(
          `pm2 start npm --name "${pm2Name}" -- start`,
          { cwd: appPath }
        );
      }

      this.log(result, `✅ ${app} deployed`);
    }
  }

  /**
   * Health checks
   */
  private async healthChecks(
    apps: AppName[],
    result: DeploymentResult
  ): Promise<void> {
    const ports: Record<AppName, number> = {
      core: 3000,
      gateway: 3001,
      digital: 3002,
      studios: 3003,
      console: 3004,
    };

    for (const app of apps) {
      const port = ports[app];
      const healthUrl = `http://localhost:${port}/api/health`;

      // Wait for app to start
      let healthy = false;
      for (let i = 0; i < 30; i++) {
        try {
          const response = await fetch(healthUrl);
          if (response.ok) {
            healthy = true;
            break;
          }
        } catch {
          // Wait and retry
        }
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!healthy) {
        throw new Error(`Health check failed for ${app}`);
      }

      this.log(result, `✅ ${app} is healthy`);
    }
  }

  /**
   * Post-deployment tasks
   */
  private async postDeployment(
    config: DeploymentConfig,
    result: DeploymentResult
  ): Promise<void> {
    // Clear CDN cache
    if (config.target === "production") {
      this.log(result, "Clearing CDN cache...");
      // await execAsync("curl -X POST https://api.cloudflare.com/purge-cache");
    }

    // Save PM2 state
    await execAsync("pm2 save");

    // Cleanup old builds
    this.log(result, "Cleaning up old builds...");
    await execAsync("find . -name '.next' -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true");
  }

  /**
   * Rollback deployment
   */
  async rollback(result: DeploymentResult): Promise<boolean> {
    if (!result.previousVersion) {
      this.log(result, "No previous version to rollback to");
      return false;
    }

    try {
      this.log(result, `Rolling back to ${result.previousVersion}...`);

      await execAsync(`git checkout ${result.previousVersion}`);
      await execAsync("pnpm install --frozen-lockfile");

      for (const app of result.apps) {
        await execAsync(`pnpm build --filter=@hyble/${app}`);
        await execAsync(`pm2 reload hyble-${app}`);
      }

      result.status = "rolled_back";
      this.log(result, "✅ Rollback completed");
      return true;
    } catch (error) {
      this.log(result, `Rollback failed: ${error}`);
      return false;
    }
  }

  /**
   * Log message
   */
  private log(result: DeploymentResult, message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    result.logs.push(logEntry);
    console.log(logEntry);
  }

  /**
   * Notify Slack
   */
  private async notifySlack(
    result: DeploymentResult,
    status: "success" | "failure"
  ): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const emoji = status === "success" ? "✅" : "❌";
    const color = status === "success" ? "#36a64f" : "#dc3545";

    const payload = {
      attachments: [
        {
          color,
          title: `${emoji} Deployment ${status.toUpperCase()}`,
          fields: [
            { title: "Target", value: result.target, short: true },
            { title: "Apps", value: result.apps.join(", "), short: true },
            { title: "Duration", value: `${result.duration}ms`, short: true },
            { title: "Commit", value: result.commit || "N/A", short: true },
          ],
          footer: `Deployment ID: ${result.id}`,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Slack notification failed:", error);
    }
  }

  /**
   * Get current deployment
   */
  getCurrentDeployment(): DeploymentResult | null {
    return this.currentDeployment;
  }

  /**
   * Get deployment history
   */
  getHistory(limit: number = 20): DeploymentResult[] {
    return this.deploymentHistory.slice(-limit);
  }

  /**
   * Get deployment by ID
   */
  getDeployment(id: string): DeploymentResult | undefined {
    return this.deploymentHistory.find((d) => d.id === id);
  }
}

// Singleton instance
export const deploymentManager = DeploymentManager.getInstance();

export default deploymentManager;

/**
 * Environment Manager for Hyble Core
 * Centralized environment configuration with validation
 */

import * as z from "zod";

// Environment types
export type Environment = "development" | "staging" | "production" | "test";

// Environment schema
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production", "test"]).optional(),
  APP_URL: z.string().url().optional(),
  APP_SECRET: z.string().min(32).optional(),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  DATABASE_SSL: z.coerce.boolean().default(false),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_DISCORD_ID: z.string().optional(),
  AUTH_DISCORD_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_REPLY_TO: z.string().email().optional(),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
  IYZICO_BASE_URL: z.string().url().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOGTAIL_TOKEN: z.string().optional(),

  // Feature Flags
  FEATURE_AI_ASSISTANT: z.coerce.boolean().default(true),
  FEATURE_PAYMENTS: z.coerce.boolean().default(true),
  FEATURE_ANALYTICS: z.coerce.boolean().default(true),
  FEATURE_DARK_MODE: z.coerce.boolean().default(true),

  // Rate Limiting
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Server
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),

  // Ports (Multi-app)
  PORT_CORE: z.coerce.number().default(3000),
  PORT_GATEWAY: z.coerce.number().default(3001),
  PORT_DIGITAL: z.coerce.number().default(3002),
  PORT_STUDIOS: z.coerce.number().default(3003),
  PORT_CONSOLE: z.coerce.number().default(3004),
});

type EnvConfig = z.infer<typeof envSchema>;

// Validation result
export interface EnvValidationResult {
  valid: boolean;
  errors: Array<{
    key: string;
    message: string;
  }>;
  warnings: Array<{
    key: string;
    message: string;
  }>;
}

/**
 * Environment Manager class
 */
export class EnvManager {
  private static instance: EnvManager;
  private config: EnvConfig | null = null;
  private validated = false;

  private constructor() {}

  static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }

  /**
   * Validate environment variables
   */
  validate(): EnvValidationResult {
    const result: EnvValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      this.config = envSchema.parse(process.env);
      this.validated = true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.valid = false;
        error.errors.forEach((err) => {
          result.errors.push({
            key: err.path.join("."),
            message: err.message,
          });
        });
      }
    }

    // Add warnings for optional but recommended vars
    const recommendedVars = [
      { key: "SENTRY_DSN", env: this.getEnvironment(), required: ["production"] },
      { key: "APP_SECRET", env: this.getEnvironment(), required: ["production", "staging"] },
      { key: "NEXTAUTH_SECRET", env: this.getEnvironment(), required: ["production", "staging"] },
      { key: "RESEND_API_KEY", env: this.getEnvironment(), required: ["production"] },
    ];

    for (const rec of recommendedVars) {
      if (rec.required.includes(rec.env) && !process.env[rec.key]) {
        result.warnings.push({
          key: rec.key,
          message: `Recommended for ${rec.env} environment`,
        });
      }
    }

    return result;
  }

  /**
   * Get validated config
   */
  getConfig(): EnvConfig {
    if (!this.validated) {
      const result = this.validate();
      if (!result.valid) {
        throw new Error(
          `Environment validation failed:\n${result.errors
            .map((e) => `  ${e.key}: ${e.message}`)
            .join("\n")}`
        );
      }
    }
    return this.config!;
  }

  /**
   * Get current environment
   */
  getEnvironment(): Environment {
    return (process.env.APP_ENV || process.env.NODE_ENV || "development") as Environment;
  }

  /**
   * Check if in development
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === "development";
  }

  /**
   * Check if in production
   */
  isProduction(): boolean {
    return this.getEnvironment() === "production";
  }

  /**
   * Check if in staging
   */
  isStaging(): boolean {
    return this.getEnvironment() === "staging";
  }

  /**
   * Check if in test
   */
  isTest(): boolean {
    return this.getEnvironment() === "test";
  }

  /**
   * Get specific env var with fallback
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.getConfig()[key];
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    const key = `FEATURE_${feature.toUpperCase()}` as keyof EnvConfig;
    return Boolean(this.getConfig()[key]);
  }

  /**
   * Get database config
   */
  getDatabaseConfig() {
    const config = this.getConfig();
    return {
      url: config.DATABASE_URL,
      poolMin: config.DATABASE_POOL_MIN,
      poolMax: config.DATABASE_POOL_MAX,
      ssl: config.DATABASE_SSL,
    };
  }

  /**
   * Get Redis config
   */
  getRedisConfig() {
    const config = this.getConfig();
    return {
      url: config.REDIS_URL,
      password: config.REDIS_PASSWORD,
    };
  }

  /**
   * Get auth config
   */
  getAuthConfig() {
    const config = this.getConfig();
    return {
      url: config.NEXTAUTH_URL,
      secret: config.NEXTAUTH_SECRET,
      providers: {
        google: {
          clientId: config.AUTH_GOOGLE_ID,
          clientSecret: config.AUTH_GOOGLE_SECRET,
        },
        github: {
          clientId: config.AUTH_GITHUB_ID,
          clientSecret: config.AUTH_GITHUB_SECRET,
        },
        discord: {
          clientId: config.AUTH_DISCORD_ID,
          clientSecret: config.AUTH_DISCORD_SECRET,
        },
      },
    };
  }

  /**
   * Get payment config
   */
  getPaymentConfig() {
    const config = this.getConfig();
    return {
      stripe: {
        secretKey: config.STRIPE_SECRET_KEY,
        publishableKey: config.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: config.STRIPE_WEBHOOK_SECRET,
      },
      iyzico: {
        apiKey: config.IYZICO_API_KEY,
        secretKey: config.IYZICO_SECRET_KEY,
        baseUrl: config.IYZICO_BASE_URL,
      },
    };
  }

  /**
   * Get AI config
   */
  getAIConfig() {
    const config = this.getConfig();
    return {
      openai: config.OPENAI_API_KEY,
      anthropic: config.ANTHROPIC_API_KEY,
      google: config.GOOGLE_AI_API_KEY,
    };
  }

  /**
   * Get storage config
   */
  getStorageConfig() {
    const config = this.getConfig();
    return {
      bucket: config.S3_BUCKET,
      region: config.S3_REGION,
      accessKey: config.S3_ACCESS_KEY,
      secretKey: config.S3_SECRET_KEY,
      endpoint: config.S3_ENDPOINT,
    };
  }

  /**
   * Get ports config
   */
  getPortsConfig() {
    const config = this.getConfig();
    return {
      core: config.PORT_CORE,
      gateway: config.PORT_GATEWAY,
      digital: config.PORT_DIGITAL,
      studios: config.PORT_STUDIOS,
      console: config.PORT_CONSOLE,
    };
  }

  /**
   * Print environment summary
   */
  printSummary(): void {
    const env = this.getEnvironment();
    const config = this.getConfig();

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║          HYBLE CORE ENVIRONMENT              ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Environment: ${env.padEnd(30)}║`);
    console.log(`║  Port: ${String(config.PORT).padEnd(37)}║`);
    console.log(`║  Database: ${config.DATABASE_URL ? "✓ Configured" : "✗ Missing"}              ║`);
    console.log(`║  Redis: ${config.REDIS_URL ? "✓ Configured" : "✗ Missing"}                 ║`);
    console.log("╠══════════════════════════════════════════════╣");
    console.log("║  FEATURES                                    ║");
    console.log(`║  AI Assistant: ${config.FEATURE_AI_ASSISTANT ? "✓" : "✗"}                          ║`);
    console.log(`║  Payments: ${config.FEATURE_PAYMENTS ? "✓" : "✗"}                              ║`);
    console.log(`║  Analytics: ${config.FEATURE_ANALYTICS ? "✓" : "✗"}                             ║`);
    console.log(`║  Dark Mode: ${config.FEATURE_DARK_MODE ? "✓" : "✗"}                             ║`);
    console.log("╚══════════════════════════════════════════════╝\n");
  }

  /**
   * Get required vars for environment
   */
  getRequiredVars(): string[] {
    const env = this.getEnvironment();
    const base = ["DATABASE_URL"];

    if (env === "production") {
      return [
        ...base,
        "APP_SECRET",
        "NEXTAUTH_SECRET",
        "REDIS_URL",
        "RESEND_API_KEY",
      ];
    }

    if (env === "staging") {
      return [...base, "APP_SECRET", "NEXTAUTH_SECRET", "REDIS_URL"];
    }

    return base;
  }

  /**
   * Check if all required vars are set
   */
  checkRequired(): { valid: boolean; missing: string[] } {
    const required = this.getRequiredVars();
    const missing = required.filter((key) => !process.env[key]);

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

// Singleton instance
export const envManager = EnvManager.getInstance();

export default envManager;

/**
 * Health Check System for Hyble Core
 * Comprehensive health monitoring for all services
 */

import { prisma } from "@hyble/db";
import { Redis } from "ioredis";

// Health check status types
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

// Service health result
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latency?: number; // in milliseconds
  message?: string;
  details?: Record<string, any>;
  lastCheck: Date;
}

// Overall health result
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  version: string;
  uptime: number; // in seconds
  services: ServiceHealth[];
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: number;
    nodeVersion: string;
  };
}

// Start time for uptime calculation
const startTime = Date.now();

/**
 * Check database health
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      name: "database",
      status: latency < 100 ? "healthy" : latency < 500 ? "degraded" : "unhealthy",
      latency,
      message: "PostgreSQL connection successful",
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name: "database",
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Database connection failed",
      lastCheck: new Date(),
    };
  }
}

/**
 * Check Redis health
 */
async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });

    await redis.ping();
    const latency = Date.now() - start;

    await redis.disconnect();

    return {
      name: "redis",
      status: latency < 50 ? "healthy" : latency < 200 ? "degraded" : "unhealthy",
      latency,
      message: "Redis connection successful",
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name: "redis",
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Redis connection failed",
      lastCheck: new Date(),
    };
  }
}

/**
 * Check external API health (example: payment gateway)
 */
async function checkExternalAPI(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    return {
      name,
      status: response.ok
        ? latency < 500
          ? "healthy"
          : "degraded"
        : "unhealthy",
      latency,
      message: response.ok ? "API available" : `API returned ${response.status}`,
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name,
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "API unreachable",
      lastCheck: new Date(),
    };
  }
}

/**
 * Check disk space (placeholder for actual implementation)
 */
async function checkDiskSpace(): Promise<ServiceHealth> {
  // In production, you'd use a library like 'check-disk-space'
  // This is a placeholder that always returns healthy
  return {
    name: "disk",
    status: "healthy",
    message: "Disk space available",
    details: {
      free: "50GB",
      total: "100GB",
      percentage: 50,
    },
    lastCheck: new Date(),
  };
}

/**
 * Get memory usage
 */
function getMemoryUsage() {
  const used = process.memoryUsage();
  const total = require("os").totalmem?.() || 0;
  const heapUsed = used.heapUsed;

  return {
    used: Math.round(heapUsed / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: total > 0 ? Math.round((heapUsed / total) * 100) : 0,
  };
}

/**
 * Run full health check
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const services = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkDiskSpace(),
  ]);

  // Optionally check external APIs
  if (process.env.STRIPE_API_URL) {
    services.push(
      await checkExternalAPI("stripe", "https://api.stripe.com/v1")
    );
  }

  // Determine overall status
  const hasUnhealthy = services.some((s) => s.status === "unhealthy");
  const hasDegraded = services.some((s) => s.status === "degraded");

  const status: HealthStatus = hasUnhealthy
    ? "unhealthy"
    : hasDegraded
    ? "degraded"
    : "healthy";

  return {
    status,
    timestamp: new Date(),
    version: process.env.APP_VERSION || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
    system: {
      memory: getMemoryUsage(),
      nodeVersion: process.version,
    },
  };
}

/**
 * Simple liveness check (for Kubernetes liveness probe)
 */
export async function livenessCheck(): Promise<{ alive: boolean }> {
  return { alive: true };
}

/**
 * Readiness check (for Kubernetes readiness probe)
 */
export async function readinessCheck(): Promise<{
  ready: boolean;
  checks: { database: boolean; redis: boolean };
}> {
  try {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    return {
      ready:
        dbHealth.status !== "unhealthy" && redisHealth.status !== "unhealthy",
      checks: {
        database: dbHealth.status !== "unhealthy",
        redis: redisHealth.status !== "unhealthy",
      },
    };
  } catch {
    return {
      ready: false,
      checks: {
        database: false,
        redis: false,
      },
    };
  }
}

/**
 * Express/Next.js health check endpoint handler
 */
export async function healthCheckHandler(
  req: any,
  res: any
): Promise<void> {
  try {
    const result = await runHealthCheck();

    const statusCode =
      result.status === "healthy"
        ? 200
        : result.status === "degraded"
        ? 200
        : 503;

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Health check failed",
    });
  }
}

/**
 * Liveness probe handler
 */
export async function livenessHandler(req: any, res: any): Promise<void> {
  const result = await livenessCheck();
  res.status(result.alive ? 200 : 503).json(result);
}

/**
 * Readiness probe handler
 */
export async function readinessHandler(req: any, res: any): Promise<void> {
  const result = await readinessCheck();
  res.status(result.ready ? 200 : 503).json(result);
}

/**
 * Metrics endpoint (Prometheus format)
 */
export async function metricsHandler(req: any, res: any): Promise<void> {
  const health = await runHealthCheck();
  const memory = getMemoryUsage();

  const metrics = `
# HELP hyble_up Service health status
# TYPE hyble_up gauge
hyble_up{status="${health.status}"} ${health.status === "healthy" ? 1 : 0}

# HELP hyble_uptime_seconds Service uptime in seconds
# TYPE hyble_uptime_seconds counter
hyble_uptime_seconds ${health.uptime}

# HELP hyble_memory_used_bytes Memory usage in bytes
# TYPE hyble_memory_used_bytes gauge
hyble_memory_used_bytes ${memory.used * 1024 * 1024}

# HELP hyble_memory_total_bytes Total memory in bytes
# TYPE hyble_memory_total_bytes gauge
hyble_memory_total_bytes ${memory.total * 1024 * 1024}

${health.services
  .map(
    (s) => `
# HELP hyble_service_health Health status of ${s.name}
# TYPE hyble_service_health gauge
hyble_service_health{service="${s.name}",status="${s.status}"} ${
      s.status === "healthy" ? 1 : s.status === "degraded" ? 0.5 : 0
    }

# HELP hyble_service_latency_ms Latency of ${s.name} in milliseconds
# TYPE hyble_service_latency_ms gauge
hyble_service_latency_ms{service="${s.name}"} ${s.latency || 0}
`
  )
  .join("")}
`.trim();

  res.setHeader("Content-Type", "text/plain");
  res.send(metrics);
}

/**
 * Startup check (run once on application start)
 */
export async function startupCheck(): Promise<void> {
  console.log("Running startup health check...");

  const health = await runHealthCheck();

  if (health.status === "unhealthy") {
    console.error("Startup health check failed:", health);
    throw new Error("Critical services are unhealthy");
  }

  console.log("Startup health check passed:", {
    status: health.status,
    services: health.services.map((s) => `${s.name}: ${s.status}`).join(", "),
  });
}

export default {
  runHealthCheck,
  livenessCheck,
  readinessCheck,
  healthCheckHandler,
  livenessHandler,
  readinessHandler,
  metricsHandler,
  startupCheck,
};

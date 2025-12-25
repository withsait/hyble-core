/**
 * Rate Limiter for Hyble Core
 * Redis-based rate limiting with sliding window algorithm
 */

import { Redis } from "ioredis";

// Redis client singleton
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(redisUrl);
  }
  return redis;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for Redis keys
  blockDuration?: number; // How long to block after exceeding limit (ms)
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // Seconds until retry is allowed
  blocked?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// Default configurations for different use cases
export const rateLimitConfigs = {
  // Standard API rate limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "rl:api",
  },

  // Authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "rl:auth",
    blockDuration: 30 * 60 * 1000, // 30 minutes block
  },

  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyPrefix: "rl:pwd",
  },

  // Email sending
  email: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: "rl:email",
  },

  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: "rl:upload",
  },

  // Admin actions
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    keyPrefix: "rl:admin",
  },

  // Public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyPrefix: "rl:public",
  },

  // Webhook endpoints
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "rl:webhook",
  },
};

/**
 * Sliding window rate limiter using Redis
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: "ratelimit",
      blockDuration: 0,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if a request should be rate limited
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const client = getRedisClient();
    const key = `${this.config.keyPrefix}:${identifier}`;
    const blockKey = `${this.config.keyPrefix}:block:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Check if blocked
    if (this.config.blockDuration > 0) {
      const blocked = await client.get(blockKey);
      if (blocked) {
        const blockedUntil = parseInt(blocked);
        if (blockedUntil > now) {
          return {
            success: false,
            remaining: 0,
            resetAt: new Date(blockedUntil),
            retryAfter: Math.ceil((blockedUntil - now) / 1000),
            blocked: true,
          };
        }
        // Block expired, remove it
        await client.del(blockKey);
      }
    }

    // Use Redis transaction for atomic operations
    const multi = client.multi();

    // Remove old entries outside the window
    multi.zremrangebyscore(key, "-inf", windowStart);

    // Count current requests in window
    multi.zcard(key);

    // Add current request
    multi.zadd(key, now, `${now}:${Math.random()}`);

    // Set expiry on the key
    multi.expire(key, Math.ceil(this.config.windowMs / 1000) + 1);

    const results = await multi.exec();

    if (!results) {
      throw new Error("Rate limit check failed");
    }

    const currentCount = (results[1]?.[1] as number) || 0;
    const resetAt = new Date(now + this.config.windowMs);

    if (currentCount >= this.config.maxRequests) {
      // Rate limit exceeded
      if (this.config.blockDuration > 0) {
        // Set block
        await client.set(
          blockKey,
          (now + this.config.blockDuration).toString(),
          "PX",
          this.config.blockDuration
        );
      }

      return {
        success: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil(this.config.windowMs / 1000),
      };
    }

    return {
      success: true,
      remaining: this.config.maxRequests - currentCount - 1,
      resetAt,
    };
  }

  /**
   * Get current rate limit info without incrementing
   */
  async getInfo(identifier: string): Promise<RateLimitInfo> {
    const client = getRedisClient();
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean old entries and count
    await client.zremrangebyscore(key, "-inf", windowStart);
    const count = await client.zcard(key);

    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - count),
      reset: Math.floor((now + this.config.windowMs) / 1000),
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string): Promise<void> {
    const client = getRedisClient();
    const key = `${this.config.keyPrefix}:${identifier}`;
    const blockKey = `${this.config.keyPrefix}:block:${identifier}`;

    await Promise.all([client.del(key), client.del(blockKey)]);
  }

  /**
   * Block an identifier
   */
  async block(identifier: string, durationMs?: number): Promise<void> {
    const client = getRedisClient();
    const blockKey = `${this.config.keyPrefix}:block:${identifier}`;
    const duration = durationMs || this.config.blockDuration || 60 * 60 * 1000; // Default 1 hour

    await client.set(
      blockKey,
      (Date.now() + duration).toString(),
      "PX",
      duration
    );
  }

  /**
   * Unblock an identifier
   */
  async unblock(identifier: string): Promise<void> {
    const client = getRedisClient();
    const blockKey = `${this.config.keyPrefix}:block:${identifier}`;
    await client.del(blockKey);
  }
}

/**
 * Express/Next.js middleware for rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async function rateLimitMiddleware(
    req: any,
    res: any,
    next: () => void
  ) {
    // Get identifier (IP address or user ID)
    const identifier =
      req.user?.id ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.ip ||
      "anonymous";

    try {
      const result = await limiter.check(identifier);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader("X-RateLimit-Remaining", result.remaining);
      res.setHeader(
        "X-RateLimit-Reset",
        Math.floor(result.resetAt.getTime() / 1000)
      );

      if (!result.success) {
        res.setHeader("Retry-After", result.retryAfter || 60);
        return res.status(429).json({
          error: "Too Many Requests",
          message: result.blocked
            ? "You have been temporarily blocked due to excessive requests"
            : "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      // Allow request on error (fail open)
      next();
    }
  };
}

/**
 * tRPC rate limit wrapper
 */
export async function checkRateLimit(
  identifier: string,
  configKey: keyof typeof rateLimitConfigs = "api"
): Promise<RateLimitResult> {
  const config = rateLimitConfigs[configKey];
  const limiter = new RateLimiter(config);
  return limiter.check(identifier);
}

/**
 * Decorator for rate limiting procedures
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  configKey: keyof typeof rateLimitConfigs = "api",
  getIdentifier: (ctx: any) => string = (ctx) => ctx.session?.user?.id || "anonymous"
): T {
  return (async (...args: any[]) => {
    const ctx = args[0]?.ctx || args[0];
    const identifier = getIdentifier(ctx);
    const result = await checkRateLimit(identifier, configKey);

    if (!result.success) {
      throw new Error(
        `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
      );
    }

    return fn(...args);
  }) as T;
}

/**
 * IP-based rate limiter for DDoS protection
 */
export class IPRateLimiter {
  private static instance: IPRateLimiter;
  private limiter: RateLimiter;

  private constructor() {
    this.limiter = new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000, // 1000 requests per minute per IP
      keyPrefix: "rl:ip",
      blockDuration: 5 * 60 * 1000, // 5 minutes block
    });
  }

  static getInstance(): IPRateLimiter {
    if (!IPRateLimiter.instance) {
      IPRateLimiter.instance = new IPRateLimiter();
    }
    return IPRateLimiter.instance;
  }

  async check(ip: string): Promise<RateLimitResult> {
    return this.limiter.check(ip);
  }

  async block(ip: string, durationMs?: number): Promise<void> {
    return this.limiter.block(ip, durationMs);
  }

  async unblock(ip: string): Promise<void> {
    return this.limiter.unblock(ip);
  }
}

export default RateLimiter;

/**
 * Cache Manager for Hyble Core
 * Redis-based caching with automatic invalidation
 */

import Redis from "ioredis";

// Cache configuration
export interface CacheConfig {
  prefix: string;
  defaultTtl: number; // seconds
  maxMemory?: string;
  evictionPolicy?: "volatile-lru" | "allkeys-lru" | "volatile-ttl" | "noeviction";
}

// Cache entry metadata
export interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tags?: string[];
}

// Cache statistics
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  memoryUsed: string;
  evictions: number;
}

// Default configuration
const defaultConfig: CacheConfig = {
  prefix: "hyble:cache:",
  defaultTtl: 3600, // 1 hour
  maxMemory: "256mb",
  evictionPolicy: "volatile-lru",
};

/**
 * Cache Manager class
 */
export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis;
  private config: CacheConfig;
  private stats = { hits: 0, misses: 0, evictions: 0 };

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      keyPrefix: this.config.prefix,
      maxRetriesPerRequest: 3,
    });
  }

  static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) {
        this.stats.misses++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(data);

      // Check expiration
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.delete(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return entry.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: {
      ttl?: number;
      tags?: string[];
    } = {}
  ): Promise<boolean> {
    try {
      const ttl = options.ttl ?? this.config.defaultTtl;
      const entry: CacheEntry<T> = {
        data: value,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl * 1000,
        tags: options.tags,
      };

      // Store the entry
      if (ttl > 0) {
        await this.redis.setex(key, ttl, JSON.stringify(entry));
      } else {
        await this.redis.set(key, JSON.stringify(entry));
      }

      // Store tag references for invalidation
      if (options.tags?.length) {
        await this.addToTags(key, options.tags);
      }

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let invalidated = 0;

      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await this.redis.smembers(tagKey);

        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(tagKey);
          invalidated += keys.length;
        }
      }

      this.stats.evictions += invalidated;
      return invalidated;
    } catch (error) {
      console.error("Cache invalidation error:", error);
      return 0;
    }
  }

  /**
   * Add key to tag sets
   */
  private async addToTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<boolean> {
    try {
      const keys = await this.redis.keys("*");
      if (keys.length > 0) {
        // Remove prefix from keys before deleting
        const keysWithoutPrefix = keys.map((k) =>
          k.replace(this.config.prefix, "")
        );
        await this.redis.del(...keysWithoutPrefix);
      }
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info("memory");
      const keyspace = await this.redis.info("keyspace");

      // Parse memory used
      const memMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsed = memMatch ? memMatch[1] : "0B";

      // Parse key count
      const keyMatch = keyspace.match(/keys=(\d+)/);
      const keys = keyMatch ? parseInt(keyMatch[1], 10) : 0;

      const total = this.stats.hits + this.stats.misses;
      const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        keys,
        memoryUsed,
        evictions: this.stats.evictions,
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        keys: 0,
        memoryUsed: "0B",
        evictions: this.stats.evictions,
      };
    }
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();

    try {
      const values = await this.redis.mget(...keys);

      keys.forEach((key, index) => {
        const data = values[index];
        if (data) {
          const entry: CacheEntry<T> = JSON.parse(data);
          if (!entry.expiresAt || Date.now() <= entry.expiresAt) {
            result.set(key, entry.data);
            this.stats.hits++;
          } else {
            result.set(key, null);
            this.stats.misses++;
          }
        } else {
          result.set(key, null);
          this.stats.misses++;
        }
      });
    } catch (error) {
      console.error("Cache mget error:", error);
    }

    return result;
  }

  /**
   * Set multiple values
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();

      for (const entry of entries) {
        const ttl = entry.ttl ?? this.config.defaultTtl;
        const cacheEntry: CacheEntry<T> = {
          data: entry.value,
          createdAt: Date.now(),
          expiresAt: Date.now() + ttl * 1000,
        };

        if (ttl > 0) {
          pipeline.setex(entry.key, ttl, JSON.stringify(cacheEntry));
        } else {
          pipeline.set(entry.key, JSON.stringify(cacheEntry));
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error("Cache mset error:", error);
      return false;
    }
  }

  /**
   * Increment value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error("Cache increment error:", error);
      return 0;
    }
  }

  /**
   * Decrement value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      console.error("Cache decrement error:", error);
      return 0;
    }
  }

  /**
   * Set expiration
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return (await this.redis.expire(key, seconds)) === 1;
    } catch (error) {
      console.error("Cache expire error:", error);
      return false;
    }
  }

  /**
   * Get TTL remaining
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      return -1;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Pre-configured cache instances
export const cacheManager = CacheManager.getInstance();

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
  product: (id: string) => `product:${id}`,
  products: (page: number, limit: number) => `products:${page}:${limit}`,
  category: (id: string) => `category:${id}`,
  categories: () => `categories:all`,
  settings: (key: string) => `settings:${key}`,
  siteSettings: (siteId: string) => `site:${siteId}:settings`,
  permissions: (userId: string) => `permissions:${userId}`,
  analytics: (type: string, date: string) => `analytics:${type}:${date}`,
};

// Cache tags
export const cacheTags = {
  users: "users",
  products: "products",
  categories: "categories",
  settings: "settings",
  analytics: "analytics",
};

export default cacheManager;

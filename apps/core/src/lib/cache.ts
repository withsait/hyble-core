/**
 * Redis Cache Layer
 * High-performance caching for frequently accessed data
 */

import { getRedis } from "./redis";

// Cache key prefixes
const CACHE_PREFIX = {
  USER: "cache:user:",
  SETTINGS: "cache:settings:",
  BLOG: "cache:blog:",
  PRODUCT: "cache:product:",
  STATS: "cache:stats:",
  QUERY: "cache:query:",
} as const;

// Default TTLs (in seconds)
const DEFAULT_TTL = {
  USER: 5 * 60, // 5 minutes
  SETTINGS: 30 * 60, // 30 minutes
  BLOG: 10 * 60, // 10 minutes
  PRODUCT: 15 * 60, // 15 minutes
  STATS: 2 * 60, // 2 minutes
  QUERY: 60, // 1 minute
} as const;

/**
 * Generic cache get with JSON parsing
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[Cache] Get error for ${key}:`, error);
    return null;
  }
}

/**
 * Generic cache set with JSON serialization
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error(`[Cache] Set error for ${key}:`, error);
  }
}

/**
 * Delete cache entry
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (error) {
    console.error(`[Cache] Delete error for ${key}:`, error);
  }
}

/**
 * Delete multiple cache entries by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.error(`[Cache] Delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Cache-aside pattern: Get from cache or fetch and cache
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache it
  await cacheSet(key, data, ttlSeconds);

  return data;
}

// ==================== USER CACHE ====================

export interface CachedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  trustLevel: string;
  emailVerified: Date | null;
  image: string | null;
}

export async function getUserFromCache(userId: string): Promise<CachedUser | null> {
  return cacheGet<CachedUser>(`${CACHE_PREFIX.USER}${userId}`);
}

export async function setUserCache(user: CachedUser): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.USER}${user.id}`, user, DEFAULT_TTL.USER);
}

export async function invalidateUserCache(userId: string): Promise<void> {
  await cacheDelete(`${CACHE_PREFIX.USER}${userId}`);
}

// ==================== SETTINGS CACHE ====================

export async function getSettingsFromCache(section: string): Promise<Record<string, unknown> | null> {
  return cacheGet<Record<string, unknown>>(`${CACHE_PREFIX.SETTINGS}${section}`);
}

export async function setSettingsCache(
  section: string,
  settings: Record<string, unknown>
): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.SETTINGS}${section}`, settings, DEFAULT_TTL.SETTINGS);
}

export async function invalidateSettingsCache(section?: string): Promise<void> {
  if (section) {
    await cacheDelete(`${CACHE_PREFIX.SETTINGS}${section}`);
  } else {
    await cacheDeletePattern(`${CACHE_PREFIX.SETTINGS}*`);
  }
}

// ==================== BLOG CACHE ====================

export async function getBlogPostFromCache(slug: string): Promise<unknown | null> {
  return cacheGet(`${CACHE_PREFIX.BLOG}post:${slug}`);
}

export async function setBlogPostCache(slug: string, post: unknown): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.BLOG}post:${slug}`, post, DEFAULT_TTL.BLOG);
}

export async function getBlogListFromCache(
  vertical: string,
  page: number
): Promise<unknown | null> {
  return cacheGet(`${CACHE_PREFIX.BLOG}list:${vertical}:${page}`);
}

export async function setBlogListCache(
  vertical: string,
  page: number,
  posts: unknown
): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.BLOG}list:${vertical}:${page}`, posts, DEFAULT_TTL.BLOG);
}

export async function invalidateBlogCache(slug?: string): Promise<void> {
  if (slug) {
    await cacheDelete(`${CACHE_PREFIX.BLOG}post:${slug}`);
  }
  // Always invalidate lists when any post changes
  await cacheDeletePattern(`${CACHE_PREFIX.BLOG}list:*`);
}

// ==================== PRODUCT CACHE ====================

export async function getProductFromCache(slug: string): Promise<unknown | null> {
  return cacheGet(`${CACHE_PREFIX.PRODUCT}${slug}`);
}

export async function setProductCache(slug: string, product: unknown): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.PRODUCT}${slug}`, product, DEFAULT_TTL.PRODUCT);
}

export async function invalidateProductCache(slug?: string): Promise<void> {
  if (slug) {
    await cacheDelete(`${CACHE_PREFIX.PRODUCT}${slug}`);
  } else {
    await cacheDeletePattern(`${CACHE_PREFIX.PRODUCT}*`);
  }
}

// ==================== STATS CACHE ====================

export async function getStatsFromCache(key: string): Promise<unknown | null> {
  return cacheGet(`${CACHE_PREFIX.STATS}${key}`);
}

export async function setStatsCache(key: string, stats: unknown): Promise<void> {
  await cacheSet(`${CACHE_PREFIX.STATS}${key}`, stats, DEFAULT_TTL.STATS);
}

export async function invalidateStatsCache(): Promise<void> {
  await cacheDeletePattern(`${CACHE_PREFIX.STATS}*`);
}

// ==================== QUERY CACHE (for expensive queries) ====================

/**
 * Generate a cache key for a query based on parameters
 */
export function generateQueryCacheKey(
  queryName: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join("|");
  return `${CACHE_PREFIX.QUERY}${queryName}:${sortedParams}`;
}

/**
 * Cached query execution
 */
export async function cachedQuery<T>(
  queryName: string,
  params: Record<string, unknown>,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL.QUERY
): Promise<T> {
  const key = generateQueryCacheKey(queryName, params);
  return cacheGetOrSet(key, fetcher, ttlSeconds);
}

// ==================== CACHE WARMING ====================

/**
 * Warm up cache with commonly accessed data
 * Called on server startup or periodically
 */
export async function warmCache(): Promise<void> {
  console.log("[Cache] Warming cache...");

  try {
    // This would be called from a cron job or startup script
    // Example: pre-cache system settings
    // const settings = await prisma.systemSetting.findMany();
    // Group by section and cache

    console.log("[Cache] Cache warming completed");
  } catch (error) {
    console.error("[Cache] Cache warming failed:", error);
  }
}

// ==================== CACHE STATS ====================

export async function getCacheStats(): Promise<{
  keys: number;
  memoryUsage: string;
}> {
  try {
    const redis = getRedis();
    const info = await redis.info("memory");
    const dbsize = await redis.dbsize();

    // Parse memory usage from info
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    const memoryUsage: string = memoryMatch?.[1] ?? "unknown";

    return {
      keys: dbsize,
      memoryUsage,
    };
  } catch (error) {
    console.error("[Cache] Stats error:", error);
    return { keys: 0, memoryUsage: "error" };
  }
}

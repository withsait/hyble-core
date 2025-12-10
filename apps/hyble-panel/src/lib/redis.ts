import Redis from "ioredis";

// Redis connection singleton
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    redis.on("ready", () => {
      console.log("[Redis] Ready to accept commands");
    });
  }

  return redis;
}

// Session key helpers
const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";
const LOGIN_ATTEMPTS_PREFIX = "login_attempts:";
const RATE_LIMIT_PREFIX = "rate_limit:";
const EMAIL_VERIFICATION_PREFIX = "email_verify:";
const PASSWORD_RESET_PREFIX = "password_reset:";
const TWO_FACTOR_PREFIX = "2fa_pending:";

// Session TTL (30 days in seconds)
const SESSION_TTL = 30 * 24 * 60 * 60;
// Remember me TTL (90 days)
const REMEMBER_ME_TTL = 90 * 24 * 60 * 60;
// 2FA pending TTL (5 minutes)
const TWO_FACTOR_TTL = 5 * 60;

export interface RedisSession {
  userId: string;
  email: string;
  role: string;
  trustLevel: string;
  platform: "HYBLE" | "MINEBLE" | "BOTH";
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

// ==================== SESSION MANAGEMENT ====================

export async function createSession(
  sessionToken: string,
  data: RedisSession,
  rememberMe = false
): Promise<void> {
  const redis = getRedis();
  const ttl = rememberMe ? REMEMBER_ME_TTL : SESSION_TTL;

  // Store session data
  await redis.setex(
    `${SESSION_PREFIX}${sessionToken}`,
    ttl,
    JSON.stringify(data)
  );

  // Add to user's session list
  await redis.sadd(`${USER_SESSIONS_PREFIX}${data.userId}`, sessionToken);
}

export async function getSession(sessionToken: string): Promise<RedisSession | null> {
  const redis = getRedis();
  const data = await redis.get(`${SESSION_PREFIX}${sessionToken}`);

  if (!data) return null;

  return JSON.parse(data) as RedisSession;
}

export async function updateSessionActivity(sessionToken: string): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sessionToken);

  if (session) {
    session.lastActiveAt = Date.now();
    const ttl = await redis.ttl(`${SESSION_PREFIX}${sessionToken}`);

    if (ttl > 0) {
      await redis.setex(
        `${SESSION_PREFIX}${sessionToken}`,
        ttl,
        JSON.stringify(session)
      );
    }
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sessionToken);

  if (session) {
    // Remove from user's session list
    await redis.srem(`${USER_SESSIONS_PREFIX}${session.userId}`, sessionToken);
  }

  // Delete session
  await redis.del(`${SESSION_PREFIX}${sessionToken}`);
}

export async function deleteAllUserSessions(userId: string, exceptToken?: string): Promise<number> {
  const redis = getRedis();
  const sessionTokens = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);

  let deletedCount = 0;

  for (const token of sessionTokens) {
    if (exceptToken && token === exceptToken) continue;

    await redis.del(`${SESSION_PREFIX}${token}`);
    deletedCount++;
  }

  // Clear user's session list (except current)
  if (exceptToken) {
    await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);
    await redis.sadd(`${USER_SESSIONS_PREFIX}${userId}`, exceptToken);
  } else {
    await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);
  }

  return deletedCount;
}

export async function getUserSessions(userId: string): Promise<string[]> {
  const redis = getRedis();
  return redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);
}

// ==================== LOGIN ATTEMPTS / BRUTE FORCE ====================

export interface LoginAttemptData {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export async function recordLoginAttempt(
  identifier: string, // email or IP
  success: boolean
): Promise<LoginAttemptData> {
  const redis = getRedis();
  const key = `${LOGIN_ATTEMPTS_PREFIX}${identifier}`;

  if (success) {
    // Reset on successful login
    await redis.del(key);
    return { count: 0, firstAttempt: 0, lastAttempt: 0 };
  }

  const now = Date.now();
  const existing = await redis.get(key);
  let data: LoginAttemptData;

  if (existing) {
    data = JSON.parse(existing);
    data.count++;
    data.lastAttempt = now;
  } else {
    data = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  }

  // Kademeli kilit sistemi
  // 5 hata → 5 dakika
  // 10 hata → 30 dakika
  // 15+ hata → 60 dakika
  if (data.count >= 15) {
    data.lockedUntil = now + 60 * 60 * 1000; // 60 minutes
  } else if (data.count >= 10) {
    data.lockedUntil = now + 30 * 60 * 1000; // 30 minutes
  } else if (data.count >= 5) {
    data.lockedUntil = now + 5 * 60 * 1000; // 5 minutes
  }

  // Store for 24 hours
  await redis.setex(key, 24 * 60 * 60, JSON.stringify(data));

  return data;
}

export async function getLoginAttempts(identifier: string): Promise<LoginAttemptData | null> {
  const redis = getRedis();
  const data = await redis.get(`${LOGIN_ATTEMPTS_PREFIX}${identifier}`);

  if (!data) return null;

  return JSON.parse(data) as LoginAttemptData;
}

export async function isLockedOut(identifier: string): Promise<{ locked: boolean; until?: number }> {
  const data = await getLoginAttempts(identifier);

  if (!data || !data.lockedUntil) {
    return { locked: false };
  }

  if (data.lockedUntil > Date.now()) {
    return { locked: true, until: data.lockedUntil };
  }

  return { locked: false };
}

// ==================== RATE LIMITING ====================

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, now - windowMs);

  // Count current entries
  const count = await redis.zcard(redisKey);

  if (count >= limit) {
    const oldestEntry = await redis.zrange(redisKey, 0, 0, "WITHSCORES");
    const resetAt = oldestEntry.length > 1 && oldestEntry[1]
      ? parseInt(oldestEntry[1]) + windowMs
      : now + windowMs;

    return { allowed: false, remaining: 0, resetAt };
  }

  // Add new entry
  await redis.zadd(redisKey, now, `${now}`);
  await redis.expire(redisKey, windowSeconds);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: now + windowMs
  };
}

// ==================== 2FA PENDING SESSION ====================

export interface TwoFactorPending {
  userId: string;
  email: string;
  sessionData: Omit<RedisSession, "userId" | "email">;
}

export async function create2FAPendingSession(
  token: string,
  data: TwoFactorPending
): Promise<void> {
  const redis = getRedis();
  await redis.setex(
    `${TWO_FACTOR_PREFIX}${token}`,
    TWO_FACTOR_TTL,
    JSON.stringify(data)
  );
}

export async function get2FAPendingSession(token: string): Promise<TwoFactorPending | null> {
  const redis = getRedis();
  const data = await redis.get(`${TWO_FACTOR_PREFIX}${token}`);

  if (!data) return null;

  return JSON.parse(data) as TwoFactorPending;
}

export async function delete2FAPendingSession(token: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${TWO_FACTOR_PREFIX}${token}`);
}

// ==================== EMAIL VERIFICATION ====================

export async function storeEmailVerificationToken(
  token: string,
  userId: string,
  ttlSeconds = 24 * 60 * 60 // 24 hours
): Promise<void> {
  const redis = getRedis();
  await redis.setex(`${EMAIL_VERIFICATION_PREFIX}${token}`, ttlSeconds, userId);
}

export async function getEmailVerificationUserId(token: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get(`${EMAIL_VERIFICATION_PREFIX}${token}`);
}

export async function deleteEmailVerificationToken(token: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${EMAIL_VERIFICATION_PREFIX}${token}`);
}

// ==================== PASSWORD RESET ====================

export async function storePasswordResetToken(
  token: string,
  userId: string,
  ttlSeconds = 15 * 60 // 15 minutes
): Promise<void> {
  const redis = getRedis();
  await redis.setex(`${PASSWORD_RESET_PREFIX}${token}`, ttlSeconds, userId);
}

export async function getPasswordResetUserId(token: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get(`${PASSWORD_RESET_PREFIX}${token}`);
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${PASSWORD_RESET_PREFIX}${token}`);
}

// ==================== CLEANUP ====================

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

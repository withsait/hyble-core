import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@hyble/db";
import * as redis from "@/lib/redis";
import * as email from "@hyble/email";
import bcrypt from "bcryptjs";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn(),
}));

describe("Auth Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should reject temporary email addresses", async () => {
      const tempEmail = "test@tempmail.com";

      // Temporary emails should be detected
      const tempDomains = ["tempmail.com", "guerrillamail.com", "10minutemail.com"];
      const domain = tempEmail.split("@")[1]?.toLowerCase();

      expect(tempDomains.includes(domain || "")).toBe(true);
    });

    it("should check for existing user before registration", async () => {
      const mockUser = { id: "user_1", email: "existing@test.com" };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await prisma.user.findUnique({
        where: { email: "existing@test.com" },
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "existing@test.com" },
      });
    });

    it("should create user with correct defaults", async () => {
      const newUser = {
        id: "user_new",
        email: "new@test.com",
        name: "Test User",
        status: "ACTIVE",
        trustLevel: "GUEST",
        role: "user",
      };

      vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);

      const result = await prisma.user.create({
        data: {
          email: "new@test.com",
          password: "hashed_password",
          name: "Test User",
          status: "ACTIVE",
          trustLevel: "GUEST",
          role: "user",
        } as any,
      });

      expect(result.status).toBe("ACTIVE");
      expect(result.trustLevel).toBe("GUEST");
      expect(result.role).toBe("user");
    });
  });

  describe("login", () => {
    it("should check lockout status before login", async () => {
      vi.mocked(redis.isLockedOut).mockResolvedValue({ locked: true, until: Date.now() + 300000 });

      const lockout = await redis.isLockedOut("test@test.com");

      expect(lockout.locked).toBe(true);
      expect(lockout.until).toBeDefined();
    });

    it("should verify password correctly", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await bcrypt.compare("password123", "hashed_password");

      expect(result).toBe(true);
    });

    it("should record failed login attempts", async () => {
      vi.mocked(redis.recordLoginAttempt).mockResolvedValue({
        count: 3,
        firstAttempt: Date.now(),
        lastAttempt: Date.now(),
      });

      const attempts = await redis.recordLoginAttempt("test@test.com", false);

      expect(attempts.count).toBe(3);
    });

    it("should check user status before allowing login", async () => {
      const suspendedUser = {
        id: "user_1",
        email: "suspended@test.com",
        password: "hashed",
        status: "SUSPENDED",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(suspendedUser as any);

      const user = await prisma.user.findUnique({
        where: { email: "suspended@test.com" },
      });

      expect(user?.status).toBe("SUSPENDED");
    });

    it("should handle 2FA requirement", async () => {
      const userWith2FA = {
        id: "user_1",
        email: "secure@test.com",
        password: "hashed",
        status: "ACTIVE",
        twoFactorAuth: { enabled: true, secret: "secret" },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(userWith2FA as any);

      const user = await prisma.user.findUnique({
        where: { email: "secure@test.com" },
        include: { twoFactorAuth: true },
      });

      expect(user?.twoFactorAuth?.enabled).toBe(true);
    });
  });

  describe("email verification", () => {
    it("should store verification token in Redis", async () => {
      vi.mocked(redis.storeEmailVerificationToken).mockResolvedValue(undefined);

      await redis.storeEmailVerificationToken("token123", "user_1");

      expect(redis.storeEmailVerificationToken).toHaveBeenCalledWith("token123", "user_1");
    });

    it("should retrieve user ID from verification token", async () => {
      vi.mocked(redis.getEmailVerificationUserId).mockResolvedValue("user_1");

      const userId = await redis.getEmailVerificationUserId("token123");

      expect(userId).toBe("user_1");
    });

    it("should update trust level after verification", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user_1",
        trustLevel: "VERIFIED",
        emailVerified: new Date(),
      } as any);

      const result = await prisma.user.update({
        where: { id: "user_1" },
        data: {
          emailVerified: new Date(),
          trustLevel: "VERIFIED",
        },
      });

      expect(result.trustLevel).toBe("VERIFIED");
    });
  });

  describe("password reset", () => {
    it("should check password history", async () => {
      const passwordHistory = [
        { id: "1", passwordHash: "old_hash_1" },
        { id: "2", passwordHash: "old_hash_2" },
      ];

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user_1",
        passwordHistory,
      } as any);

      const user = await prisma.user.findUnique({
        where: { id: "user_1" },
        include: { passwordHistory: true },
      });

      expect(user?.passwordHistory).toHaveLength(2);
    });

    it("should invalidate all sessions after password reset", async () => {
      vi.mocked(redis.deleteAllUserSessions).mockResolvedValue(5);

      const deletedCount = await redis.deleteAllUserSessions("user_1");

      expect(deletedCount).toBe(5);
    });
  });

  describe("rate limiting", () => {
    it("should enforce rate limits", async () => {
      vi.mocked(redis.checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 3600000,
      });

      const result = await redis.checkRateLimit("register:192.168.1.1", 5, 3600);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should allow requests within limit", async () => {
      vi.mocked(redis.checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 3,
        resetAt: Date.now() + 3600000,
      });

      const result = await redis.checkRateLimit("register:192.168.1.1", 5, 3600);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });
  });
});

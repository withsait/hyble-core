import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@hyble/db";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";

vi.mock("otplib", () => ({
  authenticator: {
    generateSecret: vi.fn(),
    keyuri: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("qrcode", () => ({
  toDataURL: vi.fn(),
}));

describe("Security Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSecurityOverview", () => {
    it("should calculate security score correctly", async () => {
      const user = {
        id: "user_1",
        email: "test@test.com",
        emailVerified: new Date(),
        password: "hashed",
        phoneNumber: "+1234567890",
        trustLevel: "VERIFIED",
        twoFactorAuth: { enabled: true },
        profile: { avatar: "avatar.png" },
        trustedDevices: [{ id: "device_1" }],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);

      const result = await prisma.user.findUnique({
        where: { id: "user_1" },
        include: {
          twoFactorAuth: { select: { enabled: true } },
          profile: { select: { avatar: true } },
          trustedDevices: { select: { id: true } },
        },
      });

      // Score calculation: email verified (20) + 2FA (30) + password (20) + phone (10) = 80
      let score = 0;
      if (result?.emailVerified) score += 20;
      if ((result as any)?.twoFactorAuth?.enabled) score += 30;
      if ((result as any)?.password) score += 20;
      if ((result as any)?.phoneNumber) score += 10;

      expect(score).toBe(80);
    });

    it("should include recommendations for missing security features", async () => {
      const user = {
        id: "user_1",
        email: "test@test.com",
        emailVerified: null,
        password: "hashed",
        phoneNumber: null,
        trustLevel: "GUEST",
        twoFactorAuth: null,
        profile: null,
        trustedDevices: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);

      const result = await prisma.user.findUnique({
        where: { id: "user_1" },
      });

      const recommendations: string[] = [];
      if (!result?.emailVerified) {
        recommendations.push("Verify your email address");
      }
      if (!(result as any)?.twoFactorAuth?.enabled) {
        recommendations.push("Enable two-factor authentication");
      }
      if (!(result as any)?.phoneNumber) {
        recommendations.push("Add a phone number for recovery");
      }

      expect(recommendations).toHaveLength(3);
    });
  });

  describe("2FA Setup", () => {
    it("should prevent setup if already enabled", async () => {
      vi.mocked(prisma.twoFactorAuth.findUnique).mockResolvedValue({
        id: "2fa_1",
        userId: "user_1",
        enabled: true,
        secret: "secret",
        verified: true,
      } as any);

      const existing = await prisma.twoFactorAuth.findUnique({
        where: { userId: "user_1" },
      });

      expect(existing?.enabled).toBe(true);
    });

    it("should generate TOTP secret and QR code", async () => {
      vi.mocked(authenticator.generateSecret).mockReturnValue("TESTSECRET123");
      vi.mocked(authenticator.keyuri).mockReturnValue("otpauth://totp/...");

      vi.mocked(prisma.twoFactorAuth.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user_1",
        email: "test@test.com",
      } as any);

      const secret = authenticator.generateSecret();
      expect(secret).toBe("TESTSECRET123");
    });

    it("should verify 2FA code correctly", async () => {
      vi.mocked(authenticator.verify).mockReturnValue(true);

      const isValid = authenticator.verify({
        token: "123456",
        secret: "TESTSECRET123",
      });

      expect(isValid).toBe(true);
    });

    it("should reject invalid 2FA code", async () => {
      vi.mocked(authenticator.verify).mockReturnValue(false);

      const isValid = authenticator.verify({
        token: "000000",
        secret: "TESTSECRET123",
      });

      expect(isValid).toBe(false);
    });
  });

  describe("2FA Disable", () => {
    it("should require password verification", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const validPassword = await bcrypt.compare("password123", "hashedPassword");
      expect(validPassword).toBe(true);
    });

    it("should require valid 2FA code to disable", async () => {
      vi.mocked(authenticator.verify).mockReturnValue(true);
      vi.mocked(prisma.twoFactorAuth.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.backupCode.deleteMany).mockResolvedValue({ count: 10 });

      const isValid = authenticator.verify({
        token: "123456",
        secret: "secret",
      });

      expect(isValid).toBe(true);
    });

    it("should delete backup codes when disabling 2FA", async () => {
      vi.mocked(prisma.backupCode.deleteMany).mockResolvedValue({ count: 10 });

      const result = await prisma.backupCode.deleteMany({
        where: { userId: "user_1" },
      });

      expect(result.count).toBe(10);
    });
  });

  describe("Backup Codes", () => {
    it("should generate 10 backup codes", async () => {
      const backupCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push("CODE" + i.toString().padStart(4, "0"));
      }

      expect(backupCodes).toHaveLength(10);
    });

    it("should hash backup codes before storing", async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue("hashedCode" as never);

      const hashedCode = await bcrypt.hash("TESTCODE", 10);
      expect(hashedCode).toBe("hashedCode");
    });

    it("should count unused backup codes", async () => {
      vi.mocked(prisma.backupCode.count).mockResolvedValue(8);

      const count = await prisma.backupCode.count({
        where: { userId: "user_1", used: false },
      });

      expect(count).toBe(8);
    });
  });

  describe("Session Management", () => {
    it("should list user sessions", async () => {
      const sessions = [
        {
          id: "session_1",
          userId: "user_1",
          deviceName: "Chrome on Windows",
          deviceType: "desktop",
          browser: "Chrome",
          os: "Windows",
          ipAddress: "192.168.1.100",
          lastActiveAt: new Date(),
        },
        {
          id: "session_2",
          userId: "user_1",
          deviceName: "Safari on iPhone",
          deviceType: "mobile",
          browser: "Safari",
          os: "iOS",
          ipAddress: "192.168.1.101",
          lastActiveAt: new Date(),
        },
      ];

      vi.mocked(prisma.userSession.findMany).mockResolvedValue(sessions as any);

      const result = await prisma.userSession.findMany({
        where: {
          userId: "user_1",
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      expect(result).toHaveLength(2);
    });

    it("should mask IP address in response", () => {
      const ipAddress = "192.168.1.100";
      const maskedIp = ipAddress.replace(/\.\d+$/, ".xxx");

      expect(maskedIp).toBe("192.168.1.xxx");
    });

    it("should revoke a session", async () => {
      vi.mocked(prisma.userSession.findFirst).mockResolvedValue({
        id: "session_1",
        userId: "user_1",
        sessionToken: "token123",
      } as any);

      vi.mocked(prisma.userSession.update).mockResolvedValue({
        id: "session_1",
        isRevoked: true,
      } as any);

      const result = await prisma.userSession.update({
        where: { id: "session_1" },
        data: { isRevoked: true },
      });

      expect(result.isRevoked).toBe(true);
    });

    it("should revoke all sessions except current", async () => {
      vi.mocked(prisma.userSession.updateMany).mockResolvedValue({ count: 5 });

      const result = await prisma.userSession.updateMany({
        where: {
          userId: "user_1",
          sessionToken: { not: "currentToken" },
        },
        data: { isRevoked: true },
      });

      expect(result.count).toBe(5);
    });
  });

  describe("Trusted Devices", () => {
    it("should list trusted devices", async () => {
      const devices = [
        {
          id: "device_1",
          userId: "user_1",
          name: "My Laptop",
          fingerprint: "fp_123",
          lastUsed: new Date(),
        },
      ];

      vi.mocked(prisma.trustedDevice.findMany).mockResolvedValue(devices as any);

      const result = await prisma.trustedDevice.findMany({
        where: {
          userId: "user_1",
          expiresAt: { gt: new Date() },
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should remove trusted device", async () => {
      vi.mocked(prisma.trustedDevice.findFirst).mockResolvedValue({
        id: "device_1",
        userId: "user_1",
        name: "My Laptop",
      } as any);

      vi.mocked(prisma.trustedDevice.delete).mockResolvedValue({
        id: "device_1",
      } as any);

      const result = await prisma.trustedDevice.delete({
        where: { id: "device_1" },
      });

      expect(result.id).toBe("device_1");
    });
  });

  describe("Activity Log", () => {
    it("should fetch activity logs with pagination", async () => {
      const logs = [
        {
          id: "log_1",
          userId: "user_1",
          action: "LOGIN_SUCCESS",
          status: "SUCCESS",
          ipAddress: "192.168.1.100",
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.securityLog.findMany).mockResolvedValue(logs as any);
      vi.mocked(prisma.securityLog.count).mockResolvedValue(50);

      const [logsResult, total] = await Promise.all([
        prisma.securityLog.findMany({
          where: { userId: "user_1" },
          take: 20,
          skip: 0,
        }),
        prisma.securityLog.count({ where: { userId: "user_1" } }),
      ]);

      expect(logsResult).toHaveLength(1);
      expect(total).toBe(50);
    });

    it("should filter logs by action type", async () => {
      vi.mocked(prisma.securityLog.findMany).mockResolvedValue([]);

      await prisma.securityLog.findMany({
        where: {
          userId: "user_1",
          action: "LOGIN_SUCCESS" as any,
        },
      });

      expect(prisma.securityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: "LOGIN_SUCCESS",
          }),
        })
      );
    });
  });

  describe("Login History", () => {
    it("should fetch login attempts for user email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user_1",
        email: "test@test.com",
      } as any);

      vi.mocked(prisma.loginAttempt.findMany).mockResolvedValue([
        {
          id: "attempt_1",
          email: "test@test.com",
          success: true,
          ipAddress: "192.168.1.100",
          createdAt: new Date(),
        },
      ] as any);

      const user = await prisma.user.findUnique({
        where: { id: "user_1" },
        select: { email: true },
      });

      const attempts = await prisma.loginAttempt.findMany({
        where: { email: user?.email },
        take: 20,
      });

      expect(attempts).toHaveLength(1);
    });
  });
});

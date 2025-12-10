import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { createTRPCRouter, protectedProcedure, verifiedProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";
import {
  getUserSessions,
  getSession,
  deleteSession,
  deleteAllUserSessions,
} from "@/lib/redis";

// ==================== SECURITY ROUTER ====================

export const securityRouter = createTRPCRouter({
  // -------------------- SECURITY OVERVIEW --------------------
  getSecurityOverview: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        twoFactorAuth: { select: { enabled: true } },
        profile: { select: { avatar: true } },
        trustedDevices: { select: { id: true } },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // Calculate security score
    let score = 0;
    const recommendations: string[] = [];

    // Email verified (+20)
    if (user.emailVerified) {
      score += 20;
    } else {
      recommendations.push("Verify your email address");
    }

    // 2FA enabled (+30)
    if (user.twoFactorAuth?.enabled) {
      score += 30;
    } else {
      recommendations.push("Enable two-factor authentication");
    }

    // Strong password (+20) - We can't check this directly, assume true if password exists
    if (user.password) {
      score += 20;
    }

    // Phone added (+10)
    if (user.phoneNumber) {
      score += 10;
    } else {
      recommendations.push("Add a phone number for recovery");
    }

    // Corporate verified (+20)
    if (user.trustLevel === "CORPORATE") {
      score += 20;
    }

    return {
      score,
      maxScore: 100,
      emailVerified: !!user.emailVerified,
      twoFactorEnabled: user.twoFactorAuth?.enabled ?? false,
      phoneAdded: !!user.phoneNumber,
      phoneVerified: user.phoneVerified,
      trustLevel: user.trustLevel,
      trustedDeviceCount: user.trustedDevices.length,
      recommendations,
    };
  }),

  // -------------------- TWO-FACTOR AUTH --------------------
  get2FAStatus: protectedProcedure.query(async ({ ctx }) => {
    const twoFactor = await prisma.twoFactorAuth.findUnique({
      where: { userId: ctx.user.id },
    });

    const backupCodeCount = await prisma.backupCode.count({
      where: { userId: ctx.user.id, used: false },
    });

    return {
      enabled: twoFactor?.enabled ?? false,
      method: "totp", // Currently only TOTP is supported
      backupCodesRemaining: backupCodeCount,
    };
  }),

  setup2FA: verifiedProcedure.mutation(async ({ ctx }) => {
    // Check if already enabled
    const existing = await prisma.twoFactorAuth.findUnique({
      where: { userId: ctx.user.id },
    });

    if (existing?.enabled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "2FA is already enabled",
      });
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { email: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // Generate QR code
    const otpauth = authenticator.keyuri(user.email, "Hyble", secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret (not enabled yet)
    await prisma.twoFactorAuth.upsert({
      where: { userId: ctx.user.id },
      create: {
        userId: ctx.user.id,
        secret,
        enabled: false,
        verified: false,
      },
      update: {
        secret,
        enabled: false,
        verified: false,
      },
    });

    return {
      secret, // For manual entry
      qrCode, // Base64 QR code image
      message: "Scan the QR code with your authenticator app",
    };
  }),

  verify2FASetup: verifiedProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ ctx }) => {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!twoFactor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please start 2FA setup first",
        });
      }

      if (twoFactor.enabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA is already enabled",
        });
      }

      // Note: We need to get the code from input
      // This is a simplified version - in production, pass the code
      return {
        success: false,
        message: "Please provide a verification code",
      };
    }),

  confirm2FASetup: verifiedProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!twoFactor || !twoFactor.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please start 2FA setup first",
        });
      }

      if (twoFactor.enabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA is already enabled",
        });
      }

      // Verify the code
      const isValid = authenticator.verify({
        token: input.code,
        secret: twoFactor.secret,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate backup codes
      const backupCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        const code = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
        backupCodes.push(code);

        await prisma.backupCode.create({
          data: {
            userId: ctx.user.id,
            code: await bcrypt.hash(code, 10),
          },
        });
      }

      // Enable 2FA
      await prisma.twoFactorAuth.update({
        where: { userId: ctx.user.id },
        data: { enabled: true, verified: true },
      });

      // Update trust level to SECURE
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { trustLevel: "SECURE" },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "TWO_FACTOR_ENABLE",
          status: "SUCCESS",
        },
      });

      return {
        success: true,
        backupCodes, // Show these ONCE to the user
        message: "2FA enabled successfully. Save your backup codes!",
      };
    }),

  disable2FA: verifiedProcedure
    .input(
      z.object({
        password: z.string(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { twoFactorAuth: true },
      });

      if (!user || !user.password) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      if (!user.twoFactorAuth?.enabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA is not enabled",
        });
      }

      // Verify 2FA code
      const isValid = authenticator.verify({
        token: input.code,
        secret: user.twoFactorAuth.secret,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid 2FA code",
        });
      }

      // Delete 2FA and backup codes
      await prisma.twoFactorAuth.delete({
        where: { userId: ctx.user.id },
      });

      await prisma.backupCode.deleteMany({
        where: { userId: ctx.user.id },
      });

      // Update trust level back to VERIFIED
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { trustLevel: "VERIFIED" },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "TWO_FACTOR_DISABLE",
          status: "SUCCESS",
        },
      });

      return { success: true, message: "2FA disabled successfully" };
    }),

  regenerateBackupCodes: verifiedProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!twoFactor?.enabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA is not enabled",
        });
      }

      // Verify 2FA code
      const isValid = authenticator.verify({
        token: input.code,
        secret: twoFactor.secret,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid 2FA code",
        });
      }

      // Delete old backup codes
      await prisma.backupCode.deleteMany({
        where: { userId: ctx.user.id },
      });

      // Generate new backup codes
      const backupCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        const code = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
        backupCodes.push(code);

        await prisma.backupCode.create({
          data: {
            userId: ctx.user.id,
            code: await bcrypt.hash(code, 10),
          },
        });
      }

      return {
        success: true,
        backupCodes,
        message: "New backup codes generated. Save them securely!",
      };
    }),

  // -------------------- SESSION MANAGEMENT --------------------
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    // Get sessions from both Redis and DB
    const dbSessions = await prisma.userSession.findMany({
      where: {
        userId: ctx.user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    return dbSessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress
        ? session.ipAddress.replace(/\.\d+$/, ".xxx") // Mask last octet
        : null,
      location: session.location,
      platform: session.platform,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      isCurrent: false, // Would need current session token to determine
    }));
  }),

  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await prisma.userSession.findFirst({
        where: {
          id: input.sessionId,
          userId: ctx.user.id,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Revoke in DB
      await prisma.userSession.update({
        where: { id: input.sessionId },
        data: { isRevoked: true },
      });

      // Also delete from Redis if exists
      await deleteSession(session.sessionToken);

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "SESSION_REVOKE",
          status: "SUCCESS",
          metadata: { sessionId: input.sessionId },
        },
      });

      return { success: true, message: "Session revoked" };
    }),

  revokeAllSessions: protectedProcedure
    .input(z.object({ currentSessionToken: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Revoke all sessions in DB
      const result = await prisma.userSession.updateMany({
        where: {
          userId: ctx.user.id,
          ...(input.currentSessionToken
            ? { sessionToken: { not: input.currentSessionToken } }
            : {}),
        },
        data: { isRevoked: true },
      });

      // Also clear from Redis
      await deleteAllUserSessions(ctx.user.id, input.currentSessionToken);

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "SESSION_REVOKE_ALL",
          status: "SUCCESS",
          metadata: { revokedCount: result.count },
        },
      });

      return { success: true, revokedCount: result.count };
    }),

  // -------------------- TRUSTED DEVICES --------------------
  getTrustedDevices: protectedProcedure.query(async ({ ctx }) => {
    const devices = await prisma.trustedDevice.findMany({
      where: {
        userId: ctx.user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsed: "desc" },
    });

    return devices;
  }),

  removeTrustedDevice: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const device = await prisma.trustedDevice.findFirst({
        where: {
          id: input.deviceId,
          userId: ctx.user.id,
        },
      });

      if (!device) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device not found",
        });
      }

      await prisma.trustedDevice.delete({
        where: { id: input.deviceId },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "DEVICE_UNTRUST",
          status: "SUCCESS",
          metadata: { deviceId: input.deviceId, deviceName: device.name },
        },
      });

      return { success: true, message: "Device removed from trusted list" };
    }),

  // -------------------- ACTIVITY LOG --------------------
  getActivityLog: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.user.id,
        ...(input.action ? { action: input.action as any } : {}),
      };

      const [logs, total] = await Promise.all([
        prisma.securityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.securityLog.count({ where }),
      ]);

      return {
        logs: logs.map((log) => ({
          ...log,
          ipAddress: log.ipAddress
            ? log.ipAddress.replace(/\.\d+$/, ".xxx")
            : null,
        })),
        total,
        hasMore: input.offset + logs.length < total,
      };
    }),

  // -------------------- LOGIN HISTORY --------------------
  getLoginHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { email: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const attempts = await prisma.loginAttempt.findMany({
        where: { email: user.email },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return attempts.map((attempt) => ({
        ...attempt,
        ipAddress: attempt.ipAddress
          ? attempt.ipAddress.replace(/\.\d+$/, ".xxx")
          : null,
      }));
    }),
});

export type SecurityRouter = typeof securityRouter;

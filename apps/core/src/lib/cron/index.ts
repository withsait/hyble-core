/**
 * Cron Jobs for Hyble Panel
 *
 * These jobs can be triggered by:
 * 1. Vercel Cron (production)
 * 2. External cron service
 * 3. Manual API calls
 *
 * Jobs:
 * - cleanupGhostAccounts: Remove unverified accounts after 7 days
 * - cleanupExpiredSessions: Remove expired sessions
 * - cleanupExpiredTokens: Remove expired verification/reset tokens
 * - processAccountDeletions: Execute scheduled account deletions
 * - sendBirthdayCelebrations: Send birthday emails
 * - sendAnniversaryCelebrations: Send work anniversary emails
 * - unbanExpiredBans: Remove temporary bans that have expired
 * - cleanupExpiredApiKeys: Mark expired API keys
 */

import { prisma } from "@hyble/db";
import {
  sendBirthdayEmail,
  sendAnniversaryEmail,
} from "@hyble/email";

// ==================== GHOST ACCOUNT CLEANUP ====================

export async function cleanupGhostAccounts() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find ghost accounts (unverified, older than 7 days, no activity)
  const ghostAccounts = await prisma.user.findMany({
    where: {
      emailVerified: null,
      createdAt: { lt: sevenDaysAgo },
      lastActiveAt: null, // Never logged in
      status: "ACTIVE",
    },
    select: { id: true, email: true },
  });

  if (ghostAccounts.length === 0) {
    return { deleted: 0, message: "No ghost accounts found" };
  }

  const ghostIds = ghostAccounts.map((u) => u.id);

  // Delete related data first
  await prisma.$transaction([
    // Delete profiles
    prisma.userProfile.deleteMany({ where: { userId: { in: ghostIds } } }),
    // Delete sessions
    prisma.userSession.deleteMany({ where: { userId: { in: ghostIds } } }),
    // Delete verification tokens
    prisma.verificationToken.deleteMany({
      where: { identifier: { in: ghostAccounts.map((u) => u.email) } },
    }),
    // Delete accounts
    prisma.account.deleteMany({ where: { userId: { in: ghostIds } } }),
    // Finally delete users
    prisma.user.deleteMany({ where: { id: { in: ghostIds } } }),
  ]);

  // Log the cleanup
  await prisma.securityLog.create({
    data: {
      userId: "system",
      action: "GHOST_ACCOUNT_CLEANUP",
      status: "SUCCESS",
      metadata: JSON.parse(
        JSON.stringify({
          deletedCount: ghostIds.length,
          deletedEmails: ghostAccounts.map((u) => u.email),
        })
      ),
    },
  });

  return {
    deleted: ghostIds.length,
    accounts: ghostAccounts.map((u) => u.email),
    message: `Deleted ${ghostIds.length} ghost accounts`,
  };
}

// ==================== SESSION CLEANUP ====================

export async function cleanupExpiredSessions() {
  const result = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true },
      ],
    },
  });

  return {
    deleted: result.count,
    message: `Deleted ${result.count} expired sessions`,
  };
}

// ==================== TOKEN CLEANUP ====================

export async function cleanupExpiredTokens() {
  const [verificationTokens, passwordResetTokens] = await Promise.all([
    prisma.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: new Date() } },
    }),
  ]);

  return {
    verificationTokens: verificationTokens.count,
    passwordResetTokens: passwordResetTokens.count,
    message: `Deleted ${verificationTokens.count} verification tokens and ${passwordResetTokens.count} password reset tokens`,
  };
}

// ==================== ACCOUNT DELETION PROCESSING ====================

export async function processAccountDeletions() {
  const now = new Date();

  // Find accounts scheduled for deletion
  const pendingDeletions = await prisma.accountDeletion.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (pendingDeletions.length === 0) {
    return { processed: 0, message: "No pending deletions" };
  }

  const results: Array<{ userId: string; email: string; success: boolean; error?: string }> = [];

  for (const deletion of pendingDeletions) {
    try {
      await prisma.$transaction(async (tx) => {
        const userId = deletion.userId;

        // Delete all user data
        await tx.userProfile.deleteMany({ where: { userId } });
        await tx.userAddress.deleteMany({ where: { userId } });
        await tx.userSession.deleteMany({ where: { userId } });
        await tx.twoFactorAuth.deleteMany({ where: { userId } });
        await tx.backupCode.deleteMany({ where: { userId } });
        await tx.trustedDevice.deleteMany({ where: { userId } });
        await tx.apiKey.deleteMany({ where: { userId } });
        await tx.securityLog.deleteMany({ where: { userId } });
        await tx.loginAttempt.deleteMany({ where: { email: deletion.user.email } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.notificationPreferences.deleteMany({ where: { userId } });
        await tx.clientCalendar.deleteMany({ where: { userId } });
        await tx.accountFreeze.deleteMany({ where: { userId } });

        // Remove from organizations
        await tx.organizationMember.deleteMany({ where: { userId } });
        await tx.organizationInvite.deleteMany({ where: { invitedBy: userId } });

        // Update deletion status
        await tx.accountDeletion.update({
          where: { id: deletion.id },
          data: { status: "COMPLETED", completedAt: now },
        });

        // Anonymize user instead of hard delete (for audit purposes)
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted_${userId}@deleted.hyble.io`,
            name: "Deleted User",
            password: null,
            phoneNumber: null,
            image: null,
            status: "PENDING_DELETION",
          },
        });
      });

      results.push({
        userId: deletion.userId,
        email: deletion.user?.email || "unknown",
        success: true,
      });
    } catch (error) {
      results.push({
        userId: deletion.userId,
        email: deletion.user?.email || "unknown",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Mark as failed
      await prisma.accountDeletion.update({
        where: { id: deletion.id },
        data: { status: "CANCELLED" },
      });
    }
  }

  return {
    processed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

// ==================== BIRTHDAY CELEBRATIONS ====================

export async function sendBirthdayCelebrations() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Find users with birthdays today who haven't been celebrated this year
  const usersWithBirthday = await prisma.userProfile.findMany({
    where: {
      birthMonth: currentMonth,
      birthDay: currentDay,
      birthDateVisibility: { not: "private" },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
        },
      },
    },
  });

  const activeUsers = usersWithBirthday.filter((p) => p.user.status === "ACTIVE");

  if (activeUsers.length === 0) {
    return { sent: 0, message: "No birthdays today" };
  }

  const results: Array<{ userId: string; success: boolean }> = [];

  for (const profile of activeUsers) {
    try {
      // Get or create calendar entry
      const calendar = await prisma.clientCalendar.upsert({
        where: {
          userId_eventType: {
            userId: profile.userId,
            eventType: "BIRTHDAY",
          },
        },
        create: {
          userId: profile.userId,
          eventType: "BIRTHDAY",
          eventDate: new Date(today.getFullYear(), currentMonth - 1, currentDay),
        },
        update: {
          eventDate: new Date(today.getFullYear(), currentMonth - 1, currentDay),
        },
      });

      // Check if already celebrated this year
      const alreadyCelebrated = await prisma.celebrationLog.findFirst({
        where: {
          calendarId: calendar.id,
          year: today.getFullYear(),
        },
      });

      if (alreadyCelebrated) continue;

      // Send birthday email
      await sendBirthdayEmail(
        profile.user.email,
        profile.user.name || "Valued User"
      );

      // Log the celebration
      await prisma.celebrationLog.create({
        data: {
          calendarId: calendar.id,
          userId: profile.userId,
          type: "BIRTHDAY",
          year: today.getFullYear(),
          emailSentAt: new Date(),
        },
      });

      results.push({ userId: profile.userId, success: true });
    } catch {
      results.push({ userId: profile.userId, success: false });
    }
  }

  return {
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    message: `Sent ${results.filter((r) => r.success).length} birthday emails`,
  };
}

// ==================== ANNIVERSARY CELEBRATIONS ====================

export async function sendAnniversaryCelebrations() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Find users with registration anniversary today
  const usersWithAnniversary = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      createdAt: {
        // Same month and day, at least 1 year ago
        lte: new Date(today.getFullYear() - 1, currentMonth, currentDay + 1),
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Filter to only those whose anniversary is today
  const anniversaryUsers = usersWithAnniversary.filter((user) => {
    const regDate = new Date(user.createdAt);
    return regDate.getMonth() === currentMonth && regDate.getDate() === currentDay;
  });

  if (anniversaryUsers.length === 0) {
    return { sent: 0, message: "No anniversaries today" };
  }

  const results: Array<{ userId: string; years: number; success: boolean }> = [];

  for (const user of anniversaryUsers) {
    const years = today.getFullYear() - new Date(user.createdAt).getFullYear();

    try {
      // Get or create calendar entry
      const calendar = await prisma.clientCalendar.upsert({
        where: {
          userId_eventType: {
            userId: user.id,
            eventType: "PARTNERSHIP_ANNIVERSARY",
          },
        },
        create: {
          userId: user.id,
          eventType: "PARTNERSHIP_ANNIVERSARY",
          eventDate: user.createdAt,
        },
        update: {
          eventDate: user.createdAt,
        },
      });

      // Check if already celebrated this year
      const alreadyCelebrated = await prisma.celebrationLog.findFirst({
        where: {
          calendarId: calendar.id,
          year: today.getFullYear(),
        },
      });

      if (alreadyCelebrated) continue;

      // Send anniversary email
      await sendAnniversaryEmail(user.email, user.name || "Valued User", years);

      // Log the celebration
      await prisma.celebrationLog.create({
        data: {
          calendarId: calendar.id,
          userId: user.id,
          type: "ANNIVERSARY",
          year: today.getFullYear(),
          emailSentAt: new Date(),
        },
      });

      results.push({ userId: user.id, years, success: true });
    } catch {
      results.push({ userId: user.id, years, success: false });
    }
  }

  return {
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results: results.filter((r) => r.success),
    message: `Sent ${results.filter((r) => r.success).length} anniversary emails`,
  };
}

// ==================== UNBAN EXPIRED BANS ====================

export async function unbanExpiredBans() {
  const now = new Date();

  // Find expired temporary bans
  const expiredBans = await prisma.userBan.findMany({
    where: {
      active: true,
      type: "TEMPORARY",
      expiresAt: { lte: now },
    },
  });

  if (expiredBans.length === 0) {
    return { unbanned: 0, message: "No expired bans" };
  }

  const userIds = expiredBans.map((b) => b.userId);

  // Deactivate bans
  await prisma.userBan.updateMany({
    where: { id: { in: expiredBans.map((b) => b.id) } },
    data: { active: false, unbannedAt: now },
  });

  // Reactivate users
  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { status: "ACTIVE" },
  });

  // Log the unban
  for (const ban of expiredBans) {
    await prisma.securityLog.create({
      data: {
        userId: ban.userId,
        action: "ACCOUNT_UNBAN",
        status: "SUCCESS",
        metadata: JSON.parse(
          JSON.stringify({
            reason: "Ban expired",
            banId: ban.id,
          })
        ),
      },
    });
  }

  return {
    unbanned: expiredBans.length,
    userIds,
    message: `Unbanned ${expiredBans.length} users`,
  };
}

// ==================== CLEANUP EXPIRED API KEYS ====================

export async function cleanupExpiredApiKeys() {
  const now = new Date();

  // Mark expired API keys as revoked
  const result = await prisma.apiKey.updateMany({
    where: {
      expiresAt: { lte: now },
      revokedAt: null,
    },
    data: { revokedAt: now },
  });

  return {
    revoked: result.count,
    message: `Revoked ${result.count} expired API keys`,
  };
}

// ==================== RUN ALL DAILY JOBS ====================

export async function runDailyJobs() {
  const results: Record<string, any> = {};

  try {
    results.ghostAccounts = await cleanupGhostAccounts();
  } catch (error) {
    results.ghostAccounts = { error: (error as Error).message };
  }

  try {
    results.sessions = await cleanupExpiredSessions();
  } catch (error) {
    results.sessions = { error: (error as Error).message };
  }

  try {
    results.tokens = await cleanupExpiredTokens();
  } catch (error) {
    results.tokens = { error: (error as Error).message };
  }

  try {
    results.deletions = await processAccountDeletions();
  } catch (error) {
    results.deletions = { error: (error as Error).message };
  }

  try {
    results.birthdays = await sendBirthdayCelebrations();
  } catch (error) {
    results.birthdays = { error: (error as Error).message };
  }

  try {
    results.anniversaries = await sendAnniversaryCelebrations();
  } catch (error) {
    results.anniversaries = { error: (error as Error).message };
  }

  try {
    results.unbans = await unbanExpiredBans();
  } catch (error) {
    results.unbans = { error: (error as Error).message };
  }

  try {
    results.apiKeys = await cleanupExpiredApiKeys();
  } catch (error) {
    results.apiKeys = { error: (error as Error).message };
  }

  return {
    timestamp: new Date().toISOString(),
    results,
  };
}

// Export individual job names for selective execution
export const CRON_JOBS = {
  GHOST_ACCOUNTS: "cleanupGhostAccounts",
  SESSIONS: "cleanupExpiredSessions",
  TOKENS: "cleanupExpiredTokens",
  DELETIONS: "processAccountDeletions",
  BIRTHDAYS: "sendBirthdayCelebrations",
  ANNIVERSARIES: "sendAnniversaryCelebrations",
  UNBANS: "unbanExpiredBans",
  API_KEYS: "cleanupExpiredApiKeys",
  ALL: "runDailyJobs",
} as const;

// Re-export billing cron jobs
export {
  generateRenewalInvoices,
  processExpiredServices,
  sendOverdueReminders,
  markOverdueInvoices,
  processAutoTopUp,
  cleanupExpiredCoupons,
  processDepletedCoupons,
  processPromoBalanceExpiry,
  generateMonthlyReport,
  runDailyBillingJobs,
  BILLING_CRON_JOBS,
} from "./billing-worker";

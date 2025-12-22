import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";
import {
  createSession,
  deleteSession,
  deleteAllUserSessions,
  recordLoginAttempt,
  isLockedOut,
  checkRateLimit,
  create2FAPendingSession,
  get2FAPendingSession,
  delete2FAPendingSession,
  storeEmailVerificationToken,
  getEmailVerificationUserId,
  deleteEmailVerificationToken,
  storePasswordResetToken,
  getPasswordResetUserId,
  deletePasswordResetToken,
  type RedisSession,
} from "@/lib/redis";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@hyble/email";
import { authenticator } from "otplib";

// ==================== VALIDATION SCHEMAS ====================

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  platform: z.enum(["HYBLE", "MINEBLE"]).default("HYBLE"),
  turnstileToken: z.string().optional(), // Cloudflare Turnstile
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
  platform: z.enum(["HYBLE", "MINEBLE"]).default("HYBLE"),
  turnstileToken: z.string().optional(),
});

const verify2FASchema = z.object({
  token: z.string(), // Pending 2FA session token
  code: z.string().length(6, "Code must be 6 digits"),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().optional(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  logoutOtherSessions: z.boolean().default(false),
});

// ==================== HELPER FUNCTIONS ====================

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!token) return true; // Skip if not provided (dev mode)
  if (!process.env.TURNSTILE_SECRET_KEY) return true;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

function isTemporaryEmail(email: string): boolean {
  const tempDomains = [
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com",
    "10minutemail.com",
    "temp-mail.org",
    "fakeinbox.com",
    "mailinator.com",
    "yopmail.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return tempDomains.includes(domain || "");
}

async function logSecurityAction(
  userId: string,
  action: string,
  status: "SUCCESS" | "FAILURE" | "BLOCKED",
  ctx: { ip: string | null; userAgent: string | null },
  metadata?: Record<string, unknown>
) {
  await prisma.securityLog.create({
    data: {
      userId,
      action: action as any,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      status,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

// ==================== AUTH ROUTER ====================

export const authRouter = createTRPCRouter({
  // -------------------- REGISTER --------------------
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Rate limiting: 5 registrations per hour per IP
      if (ctx.ip) {
        const rateLimit = await checkRateLimit(`register:${ctx.ip}`, 5, 3600);
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many registration attempts. Please try again later.",
          });
        }
      }

      // Verify Turnstile
      const turnstileValid = await verifyTurnstile(input.turnstileToken);
      if (!turnstileValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Captcha verification failed",
        });
      }

      // Check for temporary email
      if (isTemporaryEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Temporary email addresses are not allowed",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: passwordHash,
          name: input.name,
          status: "ACTIVE",
          trustLevel: "GUEST", // Unverified
          role: "user",
          profile: {
            create: {
              firstName: input.name.split(" ")[0],
              lastName: input.name.split(" ").slice(1).join(" ") || null,
            },
          },
          passwordHistory: {
            create: {
              passwordHash,
            },
          },
          notificationPrefs: {
            create: {},
          },
        },
        include: {
          profile: true,
        },
      });

      // Generate verification token
      const verificationToken = uuidv4();
      await storeEmailVerificationToken(verificationToken, user.id);

      // Create verification token in DB as well (for tracking)
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: verificationToken,
          type: "email",
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Send verification email
      try {
        await sendVerificationEmail(
          user.email,
          verificationToken,
          input.platform.toLowerCase() as "hyble" | "mineble"
        );
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Don't fail registration if email fails
      }

      // Log registration
      await logSecurityAction(user.id, "REGISTER", "SUCCESS", ctx, {
        platform: input.platform,
      });

      return {
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      };
    }),

  // -------------------- LOGIN --------------------
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();

      // Check lockout status (by email and IP)
      const emailLockout = await isLockedOut(email);
      if (emailLockout.locked) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Account temporarily locked. Please try again after ${new Date(emailLockout.until!).toLocaleTimeString()}`,
        });
      }

      if (ctx.ip) {
        const ipLockout = await isLockedOut(ctx.ip);
        if (ipLockout.locked) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many failed attempts from your IP. Please try again later.",
          });
        }
      }

      // Verify Turnstile (after 3 failed attempts)
      const attempts = await recordLoginAttempt(email, true); // Just check count
      if (attempts.count >= 3) {
        const turnstileValid = await verifyTurnstile(input.turnstileToken);
        if (!turnstileValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Captcha verification required",
          });
        }
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          twoFactorAuth: true,
          profile: true,
        },
      });

      if (!user || !user.password) {
        // Record failed attempt
        await recordLoginAttempt(email, false);
        if (ctx.ip) await recordLoginAttempt(ctx.ip, false);

        // Log failed login in DB
        await prisma.loginAttempt.create({
          data: {
            email,
            ipAddress: ctx.ip,
            userAgent: ctx.userAgent,
            success: false,
            failReason: "User not found",
            platform: input.platform,
          },
        });

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check user status
      if (user.status === "SUSPENDED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been suspended. Please contact support.",
        });
      }

      if (user.status === "FROZEN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account is frozen. Please unfreeze it from your email.",
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        await recordLoginAttempt(email, false);
        if (ctx.ip) await recordLoginAttempt(ctx.ip, false);

        await prisma.loginAttempt.create({
          data: {
            email,
            ipAddress: ctx.ip,
            userAgent: ctx.userAgent,
            success: false,
            failReason: "Invalid password",
            platform: input.platform,
          },
        });

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check if 2FA is enabled
      if (user.twoFactorAuth?.enabled) {
        // Create pending 2FA session
        const pendingToken = uuidv4();
        await create2FAPendingSession(pendingToken, {
          userId: user.id,
          email: user.email,
          sessionData: {
            role: user.role,
            trustLevel: user.trustLevel,
            platform: input.platform,
            ipAddress: ctx.ip || undefined,
            userAgent: ctx.userAgent || undefined,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            expiresAt: Date.now() + (input.rememberMe ? 90 : 30) * 24 * 60 * 60 * 1000,
            rememberMe: input.rememberMe,
          },
        });

        return {
          success: true,
          requires2FA: true,
          pendingToken,
          message: "Please enter your 2FA code",
        };
      }

      // Create session
      const sessionToken = uuidv4();
      const sessionData: RedisSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
        platform: input.platform,
        ipAddress: ctx.ip || undefined,
        userAgent: ctx.userAgent || undefined,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        expiresAt: Date.now() + (input.rememberMe ? 90 : 30) * 24 * 60 * 60 * 1000,
        rememberMe: input.rememberMe,
      };

      await createSession(sessionToken, sessionData, input.rememberMe);

      // Record successful login
      await recordLoginAttempt(email, true);
      if (ctx.ip) await recordLoginAttempt(ctx.ip, true);

      // Log in DB
      await prisma.loginAttempt.create({
        data: {
          email,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
          success: true,
          platform: input.platform,
        },
      });

      await logSecurityAction(user.id, "LOGIN", "SUCCESS", ctx, {
        platform: input.platform,
        rememberMe: input.rememberMe,
      });

      return {
        success: true,
        requires2FA: false,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          trustLevel: user.trustLevel,
          emailVerified: !!user.emailVerified,
          profile: user.profile,
        },
      };
    }),

  // -------------------- VERIFY 2FA --------------------
  verify2FA: publicProcedure
    .input(verify2FASchema)
    .mutation(async ({ input, ctx }) => {
      const pending = await get2FAPendingSession(input.token);

      if (!pending) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired 2FA session",
        });
      }

      // Get user's 2FA secret
      const user = await prisma.user.findUnique({
        where: { id: pending.userId },
        include: {
          twoFactorAuth: true,
          profile: true,
        },
      });

      if (!user || !user.twoFactorAuth?.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA not configured",
        });
      }

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: input.code,
        secret: user.twoFactorAuth.secret,
      });

      if (!isValid) {
        // Check backup codes
        const backupCode = await prisma.backupCode.findFirst({
          where: {
            userId: user.id,
            code: input.code,
            used: false,
          },
        });

        if (backupCode) {
          // Mark backup code as used
          await prisma.backupCode.update({
            where: { id: backupCode.id },
            data: { used: true, usedAt: new Date() },
          });

          await logSecurityAction(user.id, "BACKUP_CODE_USED", "SUCCESS", ctx);
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid 2FA code",
          });
        }
      }

      // Delete pending session
      await delete2FAPendingSession(input.token);

      // Create actual session
      const sessionToken = uuidv4();
      const sessionData: RedisSession = {
        userId: user.id,
        email: user.email,
        ...pending.sessionData,
      };

      await createSession(sessionToken, sessionData, pending.sessionData.rememberMe);

      await logSecurityAction(user.id, "TWO_FACTOR_VERIFY", "SUCCESS", ctx);

      return {
        success: true,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          trustLevel: user.trustLevel,
          emailVerified: !!user.emailVerified,
          profile: user.profile,
        },
      };
    }),

  // -------------------- LOGOUT --------------------
  logout: protectedProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deleteSession(input.sessionToken);

      await logSecurityAction(ctx.user.id, "LOGOUT", "SUCCESS", ctx);

      return { success: true };
    }),

  // -------------------- LOGOUT ALL SESSIONS --------------------
  logoutAllSessions: protectedProcedure
    .input(z.object({ exceptCurrent: z.boolean().default(true), currentToken: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const deletedCount = await deleteAllUserSessions(
        ctx.user.id,
        input.exceptCurrent ? input.currentToken : undefined
      );

      await logSecurityAction(ctx.user.id, "SESSION_REVOKE_ALL", "SUCCESS", ctx, {
        deletedCount,
      });

      return { success: true, deletedCount };
    }),

  // -------------------- VERIFY EMAIL --------------------
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = await getEmailVerificationUserId(input.token);

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification link",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.emailVerified) {
        return { success: true, message: "Email already verified" };
      }

      // Update user
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date(),
          emailVerifiedAt: new Date(),
          trustLevel: "VERIFIED",
        },
      });

      // Delete token
      await deleteEmailVerificationToken(input.token);
      await prisma.verificationToken.deleteMany({
        where: { identifier: user.email },
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.name || "there", "hyble");
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

      await logSecurityAction(userId, "EMAIL_VERIFIED", "SUCCESS", ctx);

      return { success: true, message: "Email verified successfully" };
    }),

  // -------------------- RESEND VERIFICATION --------------------
  resendVerification: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email already verified",
      });
    }

    // Rate limit: 3 per hour
    const rateLimit = await checkRateLimit(`resend_verify:${user.id}`, 3, 3600);
    if (!rateLimit.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Please wait before requesting another verification email",
      });
    }

    // Generate new token
    const verificationToken = uuidv4();
    await storeEmailVerificationToken(verificationToken, user.id);

    // Send email
    await sendVerificationEmail(user.email, verificationToken, "hyble");

    return { success: true, message: "Verification email sent" };
  }),

  // -------------------- FORGOT PASSWORD --------------------
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 3 per hour per email, 5 per hour per IP
      const emailLimit = await checkRateLimit(`forgot_pwd:${input.email}`, 3, 3600);
      if (!emailLimit.allowed) {
        // Don't reveal that email exists
        return { success: true, message: "If an account exists, a reset email has been sent" };
      }

      if (ctx.ip) {
        const ipLimit = await checkRateLimit(`forgot_pwd_ip:${ctx.ip}`, 5, 3600);
        if (!ipLimit.allowed) {
          return { success: true, message: "If an account exists, a reset email has been sent" };
        }
      }

      // Verify Turnstile
      const turnstileValid = await verifyTurnstile(input.turnstileToken);
      if (!turnstileValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Captcha verification failed",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return { success: true, message: "If an account exists, a reset email has been sent" };
      }

      // Delete existing reset tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Generate reset token
      const resetToken = uuidv4();
      await storePasswordResetToken(resetToken, user.id);

      // Store in DB (hashed)
      const tokenHash = await bcrypt.hash(resetToken, 10);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: tokenHash,
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // Send email
      try {
        await sendPasswordResetEmail(user.email, resetToken, "hyble");
      } catch (error) {
        console.error("Failed to send password reset email:", error);
      }

      await logSecurityAction(user.id, "PASSWORD_RESET_REQUEST", "SUCCESS", ctx);

      return { success: true, message: "If an account exists, a reset email has been sent" };
    }),

  // -------------------- RESET PASSWORD --------------------
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = await getPasswordResetUserId(input.token);

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset link",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          passwordHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check password history (last 5)
      for (const history of user.passwordHistory) {
        const isSame = await bcrypt.compare(input.password, history.passwordHash);
        if (isSame) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot reuse your last 5 passwords",
          });
        }
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Update user
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          passwordHistory: {
            create: { passwordHash },
          },
        },
      });

      // Delete reset token
      await deletePasswordResetToken(input.token);
      await prisma.passwordResetToken.deleteMany({
        where: { userId },
      });

      // Invalidate all sessions
      await deleteAllUserSessions(userId);

      await logSecurityAction(userId, "PASSWORD_RESET", "SUCCESS", ctx);

      return { success: true, message: "Password reset successfully. Please log in with your new password." };
    }),

  // -------------------- CHANGE PASSWORD --------------------
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          passwordHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(input.currentPassword, user.password);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Check password history
      for (const history of user.passwordHistory) {
        const isSame = await bcrypt.compare(input.newPassword, history.passwordHash);
        if (isSame) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot reuse your last 5 passwords",
          });
        }
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      // Update user
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          password: passwordHash,
          passwordHistory: {
            create: { passwordHash },
          },
        },
      });

      // Logout other sessions if requested
      if (input.logoutOtherSessions) {
        // Note: We need the current session token here
        await deleteAllUserSessions(ctx.user.id);
      }

      await logSecurityAction(ctx.user.id, "PASSWORD_CHANGE", "SUCCESS", ctx);

      return { success: true, message: "Password changed successfully" };
    }),

  // -------------------- GET SESSION --------------------
  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      return null;
    }

    return {
      user: ctx.session.user,
      expires: ctx.session.expires,
    };
  }),

  // -------------------- CHECK EMAIL EXISTS --------------------
  checkEmailExists: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
        select: { id: true },
      });

      return { exists: !!user };
    }),
});

export type AuthRouter = typeof authRouter;

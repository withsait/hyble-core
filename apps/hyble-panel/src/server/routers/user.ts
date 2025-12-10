import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, verifiedProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";

// ==================== VALIDATION SCHEMAS ====================

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().max(50).optional(),
  position: z.string().max(100).optional(),
  language: z.enum(["tr", "en"]).optional(),
  currency: z.enum(["EUR", "USD", "TRY", "GBP"]).optional(),
  timezone: z.string().optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
});

const updateBirthDateSchema = z.object({
  birthDate: z.string().datetime(),
});

const createAddressSchema = z.object({
  type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]),
  title: z.string().min(1).max(50),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2).max(2), // ISO country code
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

const updateAddressSchema = createAddressSchema.partial().extend({
  id: z.string(),
});

const updateNotificationPrefsSchema = z.object({
  billingEmail: z.boolean().optional(),
  billingPanel: z.boolean().optional(),
  projectsEmail: z.boolean().optional(),
  projectsPanel: z.boolean().optional(),
  supportEmail: z.boolean().optional(),
  supportPanel: z.boolean().optional(),
  updatesEmail: z.boolean().optional(),
  updatesPanel: z.boolean().optional(),
  marketingEmail: z.boolean().optional(),
  marketingPanel: z.boolean().optional(),
  discordDm: z.boolean().optional(),
  appreciationEmail: z.boolean().optional(),
});

// ==================== USER ROUTER ====================

export const userRouter = createTRPCRouter({
  // -------------------- GET PROFILE --------------------
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        profile: true,
        addresses: {
          orderBy: { isDefault: "desc" },
        },
        notificationPrefs: true,
        twoFactorAuth: {
          select: { enabled: true },
        },
        _count: {
          select: {
            userSessions: true,
            memberships: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      status: user.status,
      trustLevel: user.trustLevel,
      emailVerified: !!user.emailVerified,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      profile: user.profile,
      addresses: user.addresses,
      notificationPrefs: user.notificationPrefs,
      twoFactorEnabled: user.twoFactorAuth?.enabled ?? false,
      sessionCount: user._count.userSessions,
      organizationCount: user._count.memberships,
    };
  }),

  // -------------------- UPDATE PROFILE --------------------
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const profile = await prisma.userProfile.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          ...input,
        },
        update: input,
      });

      // Update name on user if firstName/lastName changed
      if (input.firstName !== undefined || input.lastName !== undefined) {
        const fullName = [input.firstName, input.lastName]
          .filter(Boolean)
          .join(" ");

        if (fullName) {
          await prisma.user.update({
            where: { id: ctx.user.id },
            data: { name: fullName },
          });
        }
      }

      return { success: true, profile };
    }),

  // -------------------- UPDATE BIRTH DATE --------------------
  updateBirthDate: verifiedProcedure
    .input(updateBirthDateSchema)
    .mutation(async ({ input, ctx }) => {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: ctx.user.id },
      });

      // Check if birth date was changed in the last year
      if (profile?.birthDateChangedAt) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (profile.birthDateChangedAt > oneYearAgo) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Birth date can only be changed once per year",
          });
        }
      }

      const updatedProfile = await prisma.userProfile.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          birthDate: new Date(input.birthDate),
          birthDateChangedAt: new Date(),
        },
        update: {
          birthDate: new Date(input.birthDate),
          birthDateChangedAt: new Date(),
        },
      });

      // Create/update calendar event for birthday
      await prisma.clientCalendar.upsert({
        where: {
          userId_eventType: {
            userId: ctx.user.id,
            eventType: "BIRTHDAY",
          },
        },
        create: {
          userId: ctx.user.id,
          eventType: "BIRTHDAY",
          eventDate: new Date(input.birthDate),
        },
        update: {
          eventDate: new Date(input.birthDate),
        },
      });

      return { success: true, profile: updatedProfile };
    }),

  // -------------------- UPDATE AVATAR --------------------
  updateAvatar: protectedProcedure
    .input(z.object({ avatarUrl: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.userProfile.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          avatar: input.avatarUrl,
        },
        update: {
          avatar: input.avatarUrl,
        },
      });

      // Also update user image
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { image: input.avatarUrl },
      });

      return { success: true };
    }),

  // -------------------- ADDRESS MANAGEMENT --------------------
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return addresses;
  }),

  createAddress: protectedProcedure
    .input(createAddressSchema)
    .mutation(async ({ input, ctx }) => {
      // If this is the first address or marked as default, set as default
      const addressCount = await prisma.userAddress.count({
        where: { userId: ctx.user.id },
      });

      const isDefault = addressCount === 0 || input.isDefault;

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: ctx.user.id },
          data: { isDefault: false },
        });
      }

      const address = await prisma.userAddress.create({
        data: {
          ...input,
          userId: ctx.user.id,
          isDefault,
        },
      });

      return { success: true, address };
    }),

  updateAddress: protectedProcedure
    .input(updateAddressSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // Verify ownership
      const existing = await prisma.userAddress.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: ctx.user.id, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const address = await prisma.userAddress.update({
        where: { id },
        data,
      });

      return { success: true, address };
    }),

  deleteAddress: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existing = await prisma.userAddress.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await prisma.userAddress.delete({
        where: { id: input.id },
      });

      // If deleted address was default, set another as default
      if (existing.isDefault) {
        const firstAddress = await prisma.userAddress.findFirst({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: "asc" },
        });

        if (firstAddress) {
          await prisma.userAddress.update({
            where: { id: firstAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return { success: true };
    }),

  setDefaultAddress: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existing = await prisma.userAddress.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // Unset all defaults
      await prisma.userAddress.updateMany({
        where: { userId: ctx.user.id },
        data: { isDefault: false },
      });

      // Set new default
      await prisma.userAddress.update({
        where: { id: input.id },
        data: { isDefault: true },
      });

      return { success: true };
    }),

  // -------------------- NOTIFICATION PREFERENCES --------------------
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!prefs) {
      // Create default preferences
      return prisma.notificationPreferences.create({
        data: { userId: ctx.user.id },
      });
    }

    return prefs;
  }),

  updateNotificationPreferences: protectedProcedure
    .input(updateNotificationPrefsSchema)
    .mutation(async ({ input, ctx }) => {
      const prefs = await prisma.notificationPreferences.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          ...input,
        },
        update: input,
      });

      return { success: true, preferences: prefs };
    }),

  // -------------------- CONNECTED ACCOUNTS (OAuth) --------------------
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await prisma.account.findMany({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
      },
    });

    return accounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      connected: true,
    }));
  }),

  disconnectAccount: verifiedProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user has password (can't disconnect if it's the only auth method)
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          accounts: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const hasPassword = !!user.password;
      const accountCount = user.accounts.length;

      if (!hasPassword && accountCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot disconnect. You need at least one sign-in method.",
        });
      }

      await prisma.account.deleteMany({
        where: {
          userId: ctx.user.id,
          provider: input.provider,
        },
      });

      // Log security action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "OAUTH_DISCONNECT",
          status: "SUCCESS",
          metadata: { provider: input.provider },
        },
      });

      return { success: true };
    }),

  // -------------------- DELETE ACCOUNT --------------------
  requestAccountDeletion: verifiedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Check for active subscriptions or unpaid invoices
      // This would need to be implemented based on billing system

      // Check for existing deletion request
      const existing = await prisma.accountDeletion.findUnique({
        where: { userId: ctx.user.id },
      });

      if (existing && !existing.cancelledAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account deletion already requested",
        });
      }

      // Create deletion request (14 day countdown)
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 14);

      if (existing) {
        await prisma.accountDeletion.update({
          where: { id: existing.id },
          data: {
            requestedAt: new Date(),
            scheduledAt,
            cancelledAt: null,
            reason: input.reason,
          },
        });
      } else {
        await prisma.accountDeletion.create({
          data: {
            userId: ctx.user.id,
            scheduledAt,
            reason: input.reason,
          },
        });
      }

      // Update user status
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { status: "PENDING_DELETION" },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ACCOUNT_DELETE_REQUEST",
          status: "SUCCESS",
        },
      });

      return {
        success: true,
        scheduledAt,
        message: "Account scheduled for deletion. You can cancel within 14 days.",
      };
    }),

  cancelAccountDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const deletion = await prisma.accountDeletion.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!deletion || deletion.cancelledAt || deletion.completedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active deletion request found",
      });
    }

    await prisma.accountDeletion.update({
      where: { id: deletion.id },
      data: { cancelledAt: new Date() },
    });

    await prisma.user.update({
      where: { id: ctx.user.id },
      data: { status: "ACTIVE" },
    });

    await prisma.securityLog.create({
      data: {
        userId: ctx.user.id,
        action: "ACCOUNT_DELETE_CANCEL",
        status: "SUCCESS",
      },
    });

    return { success: true, message: "Account deletion cancelled" };
  }),

  // -------------------- FREEZE ACCOUNT --------------------
  freezeAccount: verifiedProcedure
    .input(
      z.object({
        reason: z.enum(["vacation", "security", "other"]),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.accountFreeze.create({
        data: {
          userId: ctx.user.id,
          reason: input.reason,
          note: input.note,
        },
      });

      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { status: "FROZEN" },
      });

      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ACCOUNT_FREEZE",
          status: "SUCCESS",
          metadata: { reason: input.reason },
        },
      });

      return { success: true, message: "Account frozen successfully" };
    }),

  unfreezeAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const freeze = await prisma.accountFreeze.findFirst({
      where: {
        userId: ctx.user.id,
        unfrozenAt: null,
      },
      orderBy: { frozenAt: "desc" },
    });

    if (!freeze) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account is not frozen",
      });
    }

    await prisma.accountFreeze.update({
      where: { id: freeze.id },
      data: { unfrozenAt: new Date() },
    });

    await prisma.user.update({
      where: { id: ctx.user.id },
      data: { status: "ACTIVE" },
    });

    await prisma.securityLog.create({
      data: {
        userId: ctx.user.id,
        action: "ACCOUNT_UNFREEZE",
        status: "SUCCESS",
      },
    });

    return { success: true, message: "Account unfrozen successfully" };
  }),

  // -------------------- DATA EXPORT (GDPR) --------------------
  requestDataExport: verifiedProcedure.mutation(async ({ ctx }) => {
    // In a real implementation, this would queue a background job
    // to generate the export and email the user when ready

    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        profile: true,
        addresses: true,
        securityLogs: {
          take: 1000,
          orderBy: { createdAt: "desc" },
        },
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        notificationPrefs: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Return data (in production, this would be emailed as JSON file)
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
      },
      profile: user.profile,
      addresses: user.addresses,
      connectedAccounts: user.accounts,
      notificationPreferences: user.notificationPrefs,
      securityLogs: user.securityLogs,
    };

    return {
      success: true,
      data: exportData,
      message: "Data export generated",
    };
  }),
});

export type UserRouter = typeof userRouter;

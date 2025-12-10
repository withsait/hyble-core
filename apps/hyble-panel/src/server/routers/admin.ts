import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";

// ==================== ADMIN ROUTER (GOD PANEL) ====================

export const adminRouter = createTRPCRouter({
  // -------------------- DASHBOARD STATS --------------------
  getDashboardStats: adminProcedure.query(async () => {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      secureUsers,
      corporateUsers,
      totalOrganizations,
      bannedUsers,
      frozenAccounts,
      pendingDeletions,
      recentLogins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { trustLevel: "VERIFIED" } }),
      prisma.user.count({ where: { trustLevel: "SECURE" } }),
      prisma.user.count({ where: { trustLevel: "CORPORATE" } }),
      prisma.organization.count(),
      prisma.userBan.count({ where: { active: true } }),
      prisma.user.count({ where: { status: "FROZEN" } }),
      prisma.accountDeletion.count({ where: { status: "PENDING" } }),
      prisma.loginAttempt.count({
        where: {
          success: true,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        secure: secureUsers,
        corporate: corporateUsers,
        banned: bannedUsers,
        frozen: frozenAccounts,
      },
      organizations: totalOrganizations,
      pendingDeletions,
      recentLogins24h: recentLogins,
    };
  }),

  // -------------------- USER MANAGEMENT --------------------
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "FROZEN", "DELETED"]).optional(),
        trustLevel: z.enum(["GUEST", "VERIFIED", "SECURE", "CORPORATE"]).optional(),
        role: z.enum(["user", "admin", "super_admin"]).optional(),
        sortBy: z.enum(["createdAt", "name", "email", "lastActiveAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, status, trustLevel, role, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { id: { contains: search } },
        ];
      }

      if (status) where.status = status;
      if (trustLevel) where.trustLevel = trustLevel;
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            trustLevel: true,
            emailVerified: true,
            phoneNumber: true,
            phoneVerified: true,
            createdAt: true,
            lastActiveAt: true,
            profile: {
              select: { avatar: true },
            },
            _count: {
              select: { memberships: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          profile: true,
          addresses: true,
          twoFactorAuth: { select: { enabled: true, verified: true } },
          memberships: {
            include: { organization: { select: { id: true, name: true, slug: true } } },
          },
          userSessions: {
            where: { isRevoked: false, expiresAt: { gt: new Date() } },
            orderBy: { lastActiveAt: "desc" },
            take: 5,
          },
          securityLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          bans: {
            where: { active: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
        role: z.enum(["user", "admin", "super_admin"]).optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "FROZEN"]).optional(),
        trustLevel: z.enum(["GUEST", "VERIFIED", "SECURE", "CORPORATE"]).optional(),
        emailVerified: z.boolean().optional(),
        phoneVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Prevent non-super_admin from modifying super_admin
      if (user.role === "super_admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify super admin accounts",
        });
      }

      const updateData: any = { ...data };
      if (data.emailVerified === true && !user.emailVerified) {
        updateData.emailVerified = new Date();
      } else if (data.emailVerified === false) {
        updateData.emailVerified = null;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "USER_UPDATE",
          targetUserId: userId,
          details: JSON.parse(JSON.stringify(data)),
        },
      });

      return updatedUser;
    }),

  // -------------------- BAN MANAGEMENT --------------------
  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(["TEMPORARY", "PERMANENT", "SHADOW"]),
        reason: z.string().min(1),
        expiresAt: z.date().optional(),
        revokeAllSessions: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, type, reason, expiresAt, revokeAllSessions } = input;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Prevent banning admins
      if (user.role === "admin" || user.role === "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot ban admin accounts",
        });
      }

      // Create ban record
      const ban = await prisma.userBan.create({
        data: {
          userId,
          type,
          reason,
          expiresAt: type === "TEMPORARY" ? expiresAt : null,
          bannedBy: ctx.user.id,
          active: true,
        },
      });

      // Update user status (except for shadow bans)
      if (type !== "SHADOW") {
        await prisma.user.update({
          where: { id: userId },
          data: { status: "SUSPENDED" },
        });
      }

      // Revoke all sessions if requested
      if (revokeAllSessions) {
        await prisma.userSession.updateMany({
          where: { userId },
          data: { isRevoked: true },
        });
      }

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "USER_BAN",
          targetUserId: userId,
          details: JSON.parse(JSON.stringify({ type, reason, expiresAt })),
        },
      });

      // Log security event
      await prisma.securityLog.create({
        data: {
          userId,
          action: "ACCOUNT_BAN",
          status: "SUCCESS",
          metadata: JSON.parse(JSON.stringify({ type, reason, bannedBy: ctx.user.id })),
        },
      });

      return { success: true, ban };
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, reason } = input;

      const activeBan = await prisma.userBan.findFirst({
        where: { userId, active: true },
      });

      if (!activeBan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No active ban found" });
      }

      // Deactivate ban
      await prisma.userBan.update({
        where: { id: activeBan.id },
        data: {
          active: false,
          liftedBy: ctx.user.id,
          liftedAt: new Date(),
          unbannedAt: new Date(),
        },
      });

      // Restore user status
      await prisma.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "USER_UNBAN",
          targetUserId: userId,
          details: JSON.parse(JSON.stringify({ reason })),
        },
      });

      return { success: true };
    }),

  listBans: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        activeOnly: z.boolean().default(true),
        type: z.enum(["TEMPORARY", "PERMANENT", "SHADOW"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, activeOnly, type } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (activeOnly) where.active = true;
      if (type) where.type = type;

      const [bans, total] = await Promise.all([
        prisma.userBan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, email: true, name: true } },
            bannedByUser: { select: { id: true, email: true, name: true } },
          },
        }),
        prisma.userBan.count({ where }),
      ]);

      return {
        bans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // -------------------- IMPERSONATION --------------------
  impersonateUser: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId, reason } = input;

      // Only super_admin can impersonate
      if (ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can impersonate users",
        });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Cannot impersonate other admins
      if (user.role === "admin" || user.role === "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot impersonate admin accounts",
        });
      }

      // Log impersonation
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "USER_IMPERSONATE_START",
          targetUserId: userId,
          details: JSON.parse(JSON.stringify({ reason })),
        },
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action: "ADMIN_IMPERSONATION",
          status: "SUCCESS",
          metadata: JSON.parse(JSON.stringify({ adminId: ctx.user.id, reason })),
        },
      });

      // Return impersonation token (in production, this would be a special JWT)
      return {
        success: true,
        impersonationToken: `imp_${ctx.user.id}_${userId}_${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  endImpersonation: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "USER_IMPERSONATE_END",
          targetUserId: input.userId,
        },
      });

      return { success: true };
    }),

  // -------------------- ORGANIZATION MANAGEMENT --------------------
  listOrganizations: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "name", "memberCount"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ];
      }

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip,
          take: limit,
          orderBy: sortBy === "memberCount" ? { members: { _count: sortOrder } } : { [sortBy]: sortOrder },
          include: {
            owner: { select: { id: true, email: true, name: true } },
            _count: { select: { members: true } },
          },
        }),
        prisma.organization.count({ where }),
      ]);

      return {
        organizations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getOrganization: adminProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const organization = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
          domains: true,
          invites: {
            where: { status: "PENDING" },
          },
        },
      });

      if (!organization) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      return organization;
    }),

  // -------------------- SECURITY LOGS --------------------
  getSecurityLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        userId: z.string().optional(),
        action: z.string().optional(),
        status: z.enum(["SUCCESS", "FAILURE"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, userId, action, status, startDate, endDate } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (status) where.status = status;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [logs, total] = await Promise.all([
        prisma.securityLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        }),
        prisma.securityLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // -------------------- ADMIN ACTIONS LOG --------------------
  getAdminActions: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        adminId: z.string().optional(),
        action: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, adminId, action } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (adminId) where.adminId = adminId;
      if (action) where.action = action;

      const [actions, total] = await Promise.all([
        prisma.adminAction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.adminAction.count({ where }),
      ]);

      // Fetch admin and target user details separately
      const adminIds = [...new Set(actions.map((a) => a.adminId))];
      const targetUserIds = [...new Set(actions.filter((a) => a.targetUserId).map((a) => a.targetUserId!))];

      const [admins, targetUsers] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, email: true, name: true },
        }),
        prisma.user.findMany({
          where: { id: { in: targetUserIds } },
          select: { id: true, email: true, name: true },
        }),
      ]);

      const adminMap = new Map(admins.map((a) => [a.id, a]));
      const targetUserMap = new Map(targetUsers.map((u) => [u.id, u]));

      const actionsWithUsers = actions.map((action) => ({
        ...action,
        admin: adminMap.get(action.adminId) || null,
        targetUser: action.targetUserId ? targetUserMap.get(action.targetUserId) || null : null,
      }));

      return {
        actions: actionsWithUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // -------------------- PENDING DELETIONS --------------------
  getPendingDeletions: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [deletions, total] = await Promise.all([
        prisma.accountDeletion.findMany({
          where: { status: "PENDING" },
          skip,
          take: limit,
          orderBy: { scheduledAt: "asc" },
          include: {
            user: { select: { id: true, email: true, name: true, createdAt: true } },
          },
        }),
        prisma.accountDeletion.count({ where: { status: "PENDING" } }),
      ]);

      return {
        deletions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  cancelDeletion: adminProcedure
    .input(z.object({ deletionId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { deletionId, reason } = input;

      const deletion = await prisma.accountDeletion.findUnique({
        where: { id: deletionId },
      });

      if (!deletion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deletion request not found" });
      }

      await prisma.accountDeletion.update({
        where: { id: deletionId },
        data: { status: "CANCELLED" },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "DELETION_CANCEL",
          targetUserId: deletion.userId,
          details: JSON.parse(JSON.stringify({ reason })),
        },
      });

      return { success: true };
    }),

  // -------------------- SYSTEM SETTINGS --------------------
  getSystemStats: adminProcedure.query(async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      loginsToday,
      failedLoginsToday,
      twoFactorEnabled,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.loginAttempt.count({
        where: { createdAt: { gte: yesterday }, success: true },
      }),
      prisma.loginAttempt.count({
        where: { createdAt: { gte: yesterday }, success: false },
      }),
      prisma.twoFactorAuth.count({ where: { enabled: true } }),
    ]);

    return {
      newUsers: {
        today: newUsersToday,
        week: newUsersWeek,
        month: newUsersMonth,
      },
      logins: {
        successToday: loginsToday,
        failedToday: failedLoginsToday,
      },
      security: {
        twoFactorEnabled,
      },
    };
  }),
});

export type AdminRouter = typeof adminRouter;

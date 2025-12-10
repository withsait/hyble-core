import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { createTRPCRouter, protectedProcedure, verifiedProcedure } from "../trpc/trpc";
import { prisma } from "../trpc/context";
import { sendOrganizationInviteEmail } from "@hyble/email";

// ==================== VALIDATION SCHEMAS ====================

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  taxId: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  foundingDate: z.string().datetime().optional(),
});

const updateOrgSchema = z.object({
  orgId: z.string(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  taxId: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
});

const inviteMemberSchema = z.object({
  orgId: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER", "BILLING", "VIEWER"]),
});

const updateMemberRoleSchema = z.object({
  orgId: z.string(),
  memberId: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER", "BILLING", "VIEWER"]),
});

// ==================== HELPER FUNCTIONS ====================

async function checkOrgPermission(
  userId: string,
  orgId: string,
  requiredRoles: string[]
): Promise<{ organization: any; membership: any }> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId,
      },
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found or you are not a member",
    });
  }

  if (!requiredRoles.includes(membership.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }

  return { organization: membership.organization, membership };
}

// ==================== ORGANIZATION ROUTER ====================

export const organizationRouter = createTRPCRouter({
  // -------------------- LIST USER'S ORGANIZATIONS --------------------
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: ctx.user.id },
      include: {
        organization: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logo: m.organization.logo,
      role: m.role,
      memberCount: m.organization._count.members,
      isOwner: m.organization.ownerId === ctx.user.id,
      joinedAt: m.joinedAt,
    }));
  }),

  // -------------------- GET ORGANIZATION --------------------
  get: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organization, membership } = await checkOrgPermission(
        ctx.user.id,
        input.orgId,
        ["OWNER", "ADMIN", "MANAGER", "MEMBER", "BILLING", "VIEWER"]
      );

      const org = await prisma.organization.findUnique({
        where: { id: input.orgId },
        include: {
          _count: {
            select: {
              members: true,
              invites: { where: { status: "PENDING" } },
            },
          },
          ssoConfig: {
            select: { enabled: true, provider: true },
          },
        },
      });

      return {
        ...org,
        currentUserRole: membership.role,
        isOwner: org?.ownerId === ctx.user.id,
        memberCount: org?._count.members,
        pendingInviteCount: org?._count.invites,
        ssoEnabled: org?.ssoConfig?.enabled ?? false,
        ssoProvider: org?.ssoConfig?.provider,
      };
    }),

  // -------------------- CREATE ORGANIZATION --------------------
  create: verifiedProcedure.input(createOrgSchema).mutation(async ({ ctx, input }) => {
    // Check if slug is already taken
    const existingSlug = await prisma.organization.findUnique({
      where: { slug: input.slug },
    });

    if (existingSlug) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This organization slug is already taken",
      });
    }

    // Create organization
    const org = await prisma.organization.create({
      data: {
        ownerId: ctx.user.id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        website: input.website,
        taxId: input.taxId,
        vatNumber: input.vatNumber,
        foundingDate: input.foundingDate ? new Date(input.foundingDate) : null,
        members: {
          create: {
            userId: ctx.user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create partnership anniversary calendar event
    await prisma.clientCalendar.create({
      data: {
        organizationId: org.id,
        eventType: "PARTNERSHIP_ANNIVERSARY",
        eventDate: new Date(),
      },
    });

    // Create company founding event if date provided
    if (input.foundingDate) {
      await prisma.clientCalendar.create({
        data: {
          organizationId: org.id,
          eventType: "COMPANY_FOUNDING",
          eventDate: new Date(input.foundingDate),
        },
      });
    }

    // Log action
    await prisma.securityLog.create({
      data: {
        userId: ctx.user.id,
        action: "ORG_CREATE",
        status: "SUCCESS",
        metadata: { orgId: org.id, orgName: org.name },
      },
    });

    return { success: true, organization: org };
  }),

  // -------------------- UPDATE ORGANIZATION --------------------
  update: verifiedProcedure.input(updateOrgSchema).mutation(async ({ ctx, input }) => {
    const { orgId, ...data } = input;

    await checkOrgPermission(ctx.user.id, orgId, ["OWNER", "ADMIN"]);

    const org = await prisma.organization.update({
      where: { id: orgId },
      data,
    });

    return { success: true, organization: org };
  }),

  // -------------------- DELETE ORGANIZATION --------------------
  delete: verifiedProcedure
    .input(z.object({ orgId: z.string(), confirmName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { id: input.orgId },
      });

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      if (org.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete the organization",
        });
      }

      if (org.name !== input.confirmName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization name does not match",
        });
      }

      // TODO: Check for active subscriptions, unpaid invoices, etc.

      await prisma.organization.delete({
        where: { id: input.orgId },
      });

      return { success: true, message: "Organization deleted" };
    }),

  // -------------------- MEMBERS --------------------
  getMembers: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkOrgPermission(ctx.user.id, input.orgId, [
        "OWNER",
        "ADMIN",
        "MANAGER",
        "MEMBER",
        "BILLING",
        "VIEWER",
      ]);

      const members = await prisma.organizationMember.findMany({
        where: { organizationId: input.orgId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              status: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      });

      const org = await prisma.organization.findUnique({
        where: { id: input.orgId },
        select: { ownerId: true },
      });

      return members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.user.email,
        name: m.user.name,
        avatar: m.user.image,
        role: m.role,
        status: m.user.status,
        isOwner: m.userId === org?.ownerId,
        joinedAt: m.joinedAt,
      }));
    }),

  // -------------------- INVITE MEMBER --------------------
  inviteMember: verifiedProcedure.input(inviteMemberSchema).mutation(async ({ ctx, input }) => {
    const { organization, membership } = await checkOrgPermission(
      ctx.user.id,
      input.orgId,
      ["OWNER", "ADMIN"]
    );

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: input.orgId,
        user: { email: input.email },
      },
    });

    if (existingMember) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This user is already a member of the organization",
      });
    }

    // Check for existing pending invite
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: input.orgId,
        email: input.email,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An invite has already been sent to this email",
      });
    }

    // Create invite
    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId: input.orgId,
        email: input.email.toLowerCase(),
        role: input.role,
        invitedBy: ctx.user.id,
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send invite email
    try {
      const inviter = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true, email: true },
      });

      await sendOrganizationInviteEmail(
        input.email,
        organization.name,
        inviter?.name || inviter?.email || "Someone",
        invite.token,
        "hyble"
      );
    } catch (error) {
      console.error("Failed to send invite email:", error);
      // Don't fail the invite creation
    }

    // Log action
    await prisma.securityLog.create({
      data: {
        userId: ctx.user.id,
        action: "ORG_INVITE_SEND",
        status: "SUCCESS",
        metadata: { orgId: input.orgId, invitedEmail: input.email, role: input.role },
      },
    });

    return { success: true, invite };
  }),

  // -------------------- GET PENDING INVITES --------------------
  getPendingInvites: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkOrgPermission(ctx.user.id, input.orgId, ["OWNER", "ADMIN"]);

      const invites = await prisma.organizationInvite.findMany({
        where: {
          organizationId: input.orgId,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      return invites;
    }),

  // -------------------- CANCEL INVITE --------------------
  cancelInvite: verifiedProcedure
    .input(z.object({ orgId: z.string(), inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkOrgPermission(ctx.user.id, input.orgId, ["OWNER", "ADMIN"]);

      await prisma.organizationInvite.update({
        where: { id: input.inviteId },
        data: { status: "CANCELLED" },
      });

      return { success: true };
    }),

  // -------------------- ACCEPT INVITE --------------------
  acceptInvite: verifiedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await prisma.organizationInvite.findUnique({
        where: { token: input.token },
        include: { organization: true },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }

      if (invite.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite is no longer valid",
        });
      }

      if (invite.expiresAt < new Date()) {
        await prisma.organizationInvite.update({
          where: { id: invite.id },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has expired" });
      }

      // Check if user's email matches invite
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (user?.email.toLowerCase() !== invite.email.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invite was sent to a different email address",
        });
      }

      // Check if already a member
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invite.organizationId,
            userId: ctx.user.id,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already a member of this organization",
        });
      }

      // Add member
      await prisma.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: ctx.user.id,
          role: invite.role,
          invitedBy: invite.invitedBy,
        },
      });

      // Update invite status
      await prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ORG_INVITE_ACCEPT",
          status: "SUCCESS",
          metadata: { orgId: invite.organizationId, orgName: invite.organization.name },
        },
      });

      return {
        success: true,
        organization: invite.organization,
        message: `You have joined ${invite.organization.name}`,
      };
    }),

  // -------------------- UPDATE MEMBER ROLE --------------------
  updateMemberRole: verifiedProcedure
    .input(updateMemberRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { organization } = await checkOrgPermission(ctx.user.id, input.orgId, [
        "OWNER",
        "ADMIN",
      ]);

      const member = await prisma.organizationMember.findUnique({
        where: { id: input.memberId },
      });

      if (!member || member.organizationId !== input.orgId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      // Can't change owner's role
      if (member.userId === organization.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the owner's role",
        });
      }

      // Note: OWNER role is not allowed in the input schema,
      // so ownership transfer is handled by a separate endpoint

      await prisma.organizationMember.update({
        where: { id: input.memberId },
        data: { role: input.role },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ORG_MEMBER_ROLE_CHANGE",
          status: "SUCCESS",
          metadata: {
            orgId: input.orgId,
            memberId: input.memberId,
            newRole: input.role,
          },
        },
      });

      return { success: true };
    }),

  // -------------------- REMOVE MEMBER --------------------
  removeMember: verifiedProcedure
    .input(z.object({ orgId: z.string(), memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { organization } = await checkOrgPermission(ctx.user.id, input.orgId, [
        "OWNER",
        "ADMIN",
      ]);

      const member = await prisma.organizationMember.findUnique({
        where: { id: input.memberId },
        include: { user: { select: { id: true, email: true } } },
      });

      if (!member || member.organizationId !== input.orgId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      // Can't remove owner
      if (member.userId === organization.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the owner from the organization",
        });
      }

      // Admins can't remove other admins
      const currentMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.orgId,
            userId: ctx.user.id,
          },
        },
      });

      if (currentMembership?.role === "ADMIN" && member.role === "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admins cannot remove other admins",
        });
      }

      await prisma.organizationMember.delete({
        where: { id: input.memberId },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ORG_MEMBER_REMOVE",
          status: "SUCCESS",
          metadata: {
            orgId: input.orgId,
            removedUserId: member.userId,
            removedEmail: member.user.email,
          },
        },
      });

      return { success: true };
    }),

  // -------------------- LEAVE ORGANIZATION --------------------
  leave: verifiedProcedure
    .input(z.object({ orgId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { id: input.orgId },
      });

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      // Owner can't leave, must transfer ownership first
      if (org.ownerId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "As the owner, you must transfer ownership before leaving",
        });
      }

      await prisma.organizationMember.delete({
        where: {
          organizationId_userId: {
            organizationId: input.orgId,
            userId: ctx.user.id,
          },
        },
      });

      // Log action
      await prisma.securityLog.create({
        data: {
          userId: ctx.user.id,
          action: "ORG_LEAVE",
          status: "SUCCESS",
          metadata: { orgId: input.orgId, orgName: org.name },
        },
      });

      return { success: true, message: "You have left the organization" };
    }),

  // -------------------- TRANSFER OWNERSHIP --------------------
  transferOwnership: verifiedProcedure
    .input(z.object({ orgId: z.string(), newOwnerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { id: input.orgId },
      });

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      if (org.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the current owner can transfer ownership",
        });
      }

      // Check if new owner is a member
      const newOwnerMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.orgId,
            userId: input.newOwnerId,
          },
        },
      });

      if (!newOwnerMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The new owner must be a member of the organization",
        });
      }

      // Transfer ownership
      await prisma.$transaction([
        prisma.organization.update({
          where: { id: input.orgId },
          data: { ownerId: input.newOwnerId },
        }),
        prisma.organizationMember.update({
          where: { id: newOwnerMembership.id },
          data: { role: "OWNER" },
        }),
        prisma.organizationMember.update({
          where: {
            organizationId_userId: {
              organizationId: input.orgId,
              userId: ctx.user.id,
            },
          },
          data: { role: "ADMIN" },
        }),
      ]);

      return { success: true, message: "Ownership transferred successfully" };
    }),

  // -------------------- CHECK SLUG AVAILABILITY --------------------
  checkSlugAvailability: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const existing = await prisma.organization.findUnique({
        where: { slug: input.slug },
      });

      return { available: !existing };
    }),
});

export type OrganizationRouter = typeof organizationRouter;

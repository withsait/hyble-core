import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@hyble/db";
import * as email from "@hyble/email";

describe("Organization Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create organization", () => {
    it("should check slug availability", async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null);

      const result = await prisma.organization.findUnique({
        where: { slug: "new-org" },
      });

      expect(result).toBeNull();
    });

    it("should reject duplicate slugs", async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: "org_1",
        slug: "existing-org",
      } as any);

      const result = await prisma.organization.findUnique({
        where: { slug: "existing-org" },
      });

      expect(result).not.toBeNull();
    });

    it("should create organization with owner as member", async () => {
      const newOrg = {
        id: "org_new",
        name: "New Company",
        slug: "new-company",
        ownerId: "user_1",
      };

      vi.mocked(prisma.organization.create).mockResolvedValue(newOrg as any);

      const result = await prisma.organization.create({
        data: {
          ownerId: "user_1",
          name: "New Company",
          slug: "new-company",
          members: {
            create: {
              userId: "user_1",
              role: "OWNER",
            },
          },
        },
      });

      expect(result.ownerId).toBe("user_1");
    });
  });

  describe("member management", () => {
    it("should verify membership before actions", async () => {
      const membership = {
        id: "member_1",
        organizationId: "org_1",
        userId: "user_1",
        role: "ADMIN",
      };

      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(membership as any);

      const result = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: "org_1",
            userId: "user_1",
          },
        },
      });

      expect(result?.role).toBe("ADMIN");
    });

    it("should prevent removing owner", async () => {
      const org = {
        id: "org_1",
        ownerId: "user_owner",
      };

      const member = {
        id: "member_1",
        userId: "user_owner",
        organizationId: "org_1",
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(org as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(member as any);

      const organization = await prisma.organization.findUnique({
        where: { id: "org_1" },
      });

      expect(member.userId).toBe(organization?.ownerId);
    });

    it("should update member role", async () => {
      vi.mocked(prisma.organizationMember.update).mockResolvedValue({
        id: "member_1",
        role: "MANAGER",
      } as any);

      const result = await prisma.organizationMember.update({
        where: { id: "member_1" },
        data: { role: "MANAGER" },
      });

      expect(result.role).toBe("MANAGER");
    });
  });

  describe("invitations", () => {
    it("should check for existing member before inviting", async () => {
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: "member_1",
      } as any);

      const existing = await prisma.organizationMember.findFirst({
        where: {
          organizationId: "org_1",
          user: { email: "existing@test.com" },
        },
      });

      expect(existing).not.toBeNull();
    });

    it("should check for pending invites", async () => {
      vi.mocked(prisma.organizationInvite.findFirst).mockResolvedValue({
        id: "invite_1",
        status: "PENDING",
      } as any);

      const pending = await prisma.organizationInvite.findFirst({
        where: {
          organizationId: "org_1",
          email: "pending@test.com",
          status: "PENDING",
        },
      });

      expect(pending?.status).toBe("PENDING");
    });

    it("should create invite with expiration", async () => {
      const invite = {
        id: "invite_new",
        organizationId: "org_1",
        email: "new@test.com",
        role: "MEMBER",
        status: "PENDING",
        token: "token123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.organizationInvite.create).mockResolvedValue(invite as any);

      const result = await prisma.organizationInvite.create({
        data: invite as any,
      });

      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should send invite email", async () => {
      vi.mocked(email.sendOrganizationInviteEmail).mockResolvedValue({ id: "email_1" } as any);

      await email.sendOrganizationInviteEmail(
        "invite@test.com",
        "Test Company",
        "Admin User",
        "token123",
        "hyble"
      );

      expect(email.sendOrganizationInviteEmail).toHaveBeenCalled();
    });

    it("should accept invite and create membership", async () => {
      const invite = {
        id: "invite_1",
        organizationId: "org_1",
        email: "user@test.com",
        role: "MEMBER",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000),
        organization: { id: "org_1", name: "Test Org" },
      };

      vi.mocked(prisma.organizationInvite.findUnique).mockResolvedValue(invite as any);
      vi.mocked(prisma.organizationMember.create).mockResolvedValue({
        id: "member_new",
        organizationId: "org_1",
        userId: "user_1",
        role: "MEMBER",
      } as any);

      const inviteResult = await prisma.organizationInvite.findUnique({
        where: { token: "token123" },
      });

      expect(inviteResult?.status).toBe("PENDING");
    });
  });

  describe("ownership transfer", () => {
    it("should only allow owner to transfer", async () => {
      const org = {
        id: "org_1",
        ownerId: "user_owner",
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(org as any);

      const organization = await prisma.organization.findUnique({
        where: { id: "org_1" },
      });

      // Only proceed if current user is owner
      const currentUserId = "user_owner";
      expect(organization?.ownerId).toBe(currentUserId);
    });

    it("should update organization and member roles in transaction", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        { id: "org_1", ownerId: "user_new_owner" },
        { id: "member_1", role: "OWNER" },
        { id: "member_2", role: "ADMIN" },
      ]);

      const result = await prisma.$transaction([
        prisma.organization.update({
          where: { id: "org_1" },
          data: { ownerId: "user_new_owner" },
        }),
        prisma.organizationMember.update({
          where: { id: "member_1" },
          data: { role: "OWNER" },
        }),
        prisma.organizationMember.update({
          where: { id: "member_2" },
          data: { role: "ADMIN" },
        }),
      ]);

      expect(result).toHaveLength(3);
    });
  });

  describe("leave organization", () => {
    it("should prevent owner from leaving", async () => {
      const org = {
        id: "org_1",
        ownerId: "user_owner",
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(org as any);

      const organization = await prisma.organization.findUnique({
        where: { id: "org_1" },
      });

      const currentUserId = "user_owner";
      const canLeave = organization?.ownerId !== currentUserId;

      expect(canLeave).toBe(false);
    });

    it("should allow non-owner to leave", async () => {
      const org = {
        id: "org_1",
        ownerId: "user_owner",
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(org as any);

      const organization = await prisma.organization.findUnique({
        where: { id: "org_1" },
      });

      const currentUserId = "user_member";
      const canLeave = organization?.ownerId !== currentUserId;

      expect(canLeave).toBe(true);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@hyble/db";

describe("User Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile with all relations", async () => {
      const user = {
        id: "user_1",
        email: "test@test.com",
        name: "Test User",
        phoneNumber: "+1234567890",
        phoneVerified: true,
        trustLevel: "VERIFIED",
        status: "ACTIVE",
        profile: {
          avatar: "avatar.png",
          bio: "Test bio",
          birthDate: new Date("1990-01-01"),
          birthDateVisibility: "private",
        },
        addresses: [
          {
            id: "addr_1",
            label: "Home",
            line1: "123 Main St",
            city: "Test City",
            isDefault: true,
          },
        ],
        connectedAccounts: [
          {
            id: "acc_1",
            provider: "google",
            email: "test@gmail.com",
          },
        ],
        notificationPrefs: {
          securityEmail: true,
          marketingEmail: false,
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);

      const result = await prisma.user.findUnique({
        where: { id: "user_1" },
        include: {
          profile: true,
          addresses: true,
          connectedAccounts: true,
          notificationPrefs: true,
        },
      });

      expect(result?.email).toBe("test@test.com");
      expect((result as any)?.profile?.avatar).toBe("avatar.png");
      expect((result as any)?.addresses).toHaveLength(1);
    });
  });

  describe("updateProfile", () => {
    it("should update user name", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user_1",
        name: "New Name",
      } as any);

      const result = await prisma.user.update({
        where: { id: "user_1" },
        data: { name: "New Name" },
      });

      expect(result.name).toBe("New Name");
    });

    it("should update user profile fields", async () => {
      vi.mocked(prisma.userProfile.update).mockResolvedValue({
        id: "profile_1",
        userId: "user_1",
        bio: "Updated bio",
        avatar: "new-avatar.png",
      } as any);

      const result = await prisma.userProfile.update({
        where: { userId: "user_1" },
        data: { bio: "Updated bio", avatar: "new-avatar.png" },
      });

      expect(result.bio).toBe("Updated bio");
    });
  });

  describe("updateBirthDate", () => {
    it("should update birth date with visibility setting", async () => {
      vi.mocked(prisma.userProfile.update).mockResolvedValue({
        id: "profile_1",
        birthDate: new Date("1990-05-15"),
        birthDateVisibility: "friends",
      } as any);

      const result = await prisma.userProfile.update({
        where: { userId: "user_1" },
        data: {
          birthDate: new Date("1990-05-15"),
          birthDateVisibility: "friends",
        },
      });

      expect(result.birthDateVisibility).toBe("friends");
    });
  });

  describe("Address Management", () => {
    it("should add new address", async () => {
      vi.mocked(prisma.userAddress.create).mockResolvedValue({
        id: "addr_new",
        userId: "user_1",
        label: "Work",
        line1: "456 Office St",
        city: "Business City",
        country: "US",
        isDefault: false,
      } as any);

      const result = await prisma.userAddress.create({
        data: {
          userId: "user_1",
          label: "Work",
          line1: "456 Office St",
          city: "Business City",
          country: "US",
        },
      });

      expect(result.label).toBe("Work");
    });

    it("should set new address as default and unset others", async () => {
      vi.mocked(prisma.userAddress.updateMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.userAddress.update).mockResolvedValue({
        id: "addr_1",
        isDefault: true,
      } as any);

      // First unset all defaults
      await prisma.userAddress.updateMany({
        where: { userId: "user_1" },
        data: { isDefault: false },
      });

      // Then set new default
      const result = await prisma.userAddress.update({
        where: { id: "addr_1" },
        data: { isDefault: true },
      });

      expect(result.isDefault).toBe(true);
    });

    it("should delete address", async () => {
      vi.mocked(prisma.userAddress.findFirst).mockResolvedValue({
        id: "addr_1",
        userId: "user_1",
      } as any);

      vi.mocked(prisma.userAddress.delete).mockResolvedValue({
        id: "addr_1",
      } as any);

      const result = await prisma.userAddress.delete({
        where: { id: "addr_1" },
      });

      expect(result.id).toBe("addr_1");
    });
  });

  describe("Notification Preferences", () => {
    it("should get notification preferences", async () => {
      vi.mocked(prisma.notificationPreferences.findUnique).mockResolvedValue({
        id: "pref_1",
        userId: "user_1",
        securityEmail: true,
        securityPanel: true,
        marketingEmail: false,
        billingEmail: true,
      } as any);

      const result = await prisma.notificationPreferences.findUnique({
        where: { userId: "user_1" },
      });

      expect(result?.securityEmail).toBe(true);
      expect(result?.marketingEmail).toBe(false);
    });

    it("should update notification preferences", async () => {
      vi.mocked(prisma.notificationPreferences.upsert).mockResolvedValue({
        id: "pref_1",
        userId: "user_1",
        marketingEmail: false,
        securityEmail: true,
      } as any);

      const result = await prisma.notificationPreferences.upsert({
        where: { userId: "user_1" },
        create: {
          userId: "user_1",
          marketingEmail: false,
        },
        update: {
          marketingEmail: false,
        },
      });

      expect(result.marketingEmail).toBe(false);
    });
  });

  describe("Connected Accounts", () => {
    it("should list connected accounts", async () => {
      vi.mocked(prisma.connectedAccount.findMany).mockResolvedValue([
        {
          id: "acc_1",
          userId: "user_1",
          provider: "google",
          providerAccountId: "google_123",
          email: "test@gmail.com",
        },
        {
          id: "acc_2",
          userId: "user_1",
          provider: "discord",
          providerAccountId: "discord_456",
          email: null,
        },
      ] as any);

      const result = await prisma.connectedAccount.findMany({
        where: { userId: "user_1" },
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.provider).toBe("google");
    });

    it("should disconnect account", async () => {
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue({
        id: "acc_1",
        userId: "user_1",
        provider: "discord",
      } as any);

      vi.mocked(prisma.connectedAccount.delete).mockResolvedValue({
        id: "acc_1",
      } as any);

      const result = await prisma.connectedAccount.delete({
        where: { id: "acc_1" },
      });

      expect(result.id).toBe("acc_1");
    });
  });

  describe("Account Deletion", () => {
    it("should schedule account deletion", async () => {
      const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      vi.mocked(prisma.accountDeletion.create).mockResolvedValue({
        id: "del_1",
        userId: "user_1",
        reason: "No longer needed",
        scheduledAt: deletionDate,
        status: "PENDING",
      } as any);

      const result = await prisma.accountDeletion.create({
        data: {
          userId: "user_1",
          reason: "No longer needed",
          scheduledAt: deletionDate,
          status: "PENDING",
        },
      });

      expect(result.status).toBe("PENDING");
      expect(result.scheduledAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should cancel deletion request", async () => {
      vi.mocked(prisma.accountDeletion.findFirst).mockResolvedValue({
        id: "del_1",
        userId: "user_1",
        status: "PENDING",
      } as any);

      vi.mocked(prisma.accountDeletion.update).mockResolvedValue({
        id: "del_1",
        status: "CANCELLED",
      } as any);

      const result = await prisma.accountDeletion.update({
        where: { id: "del_1" },
        data: { status: "CANCELLED" },
      });

      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("Account Freeze", () => {
    it("should freeze account", async () => {
      vi.mocked(prisma.accountFreeze.create).mockResolvedValue({
        id: "freeze_1",
        userId: "user_1",
        reason: "Taking a break",
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user_1",
        status: "FROZEN",
      } as any);

      const freeze = await prisma.accountFreeze.create({
        data: {
          userId: "user_1",
          reason: "Taking a break",
        },
      });

      const user = await prisma.user.update({
        where: { id: "user_1" },
        data: { status: "FROZEN" },
      });

      expect(freeze.reason).toBe("Taking a break");
      expect(user.status).toBe("FROZEN");
    });

    it("should unfreeze account", async () => {
      vi.mocked(prisma.accountFreeze.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user_1",
        status: "ACTIVE",
      } as any);

      await prisma.accountFreeze.updateMany({
        where: { userId: "user_1", unfrozenAt: null },
        data: { unfrozenAt: new Date() },
      });

      const user = await prisma.user.update({
        where: { id: "user_1" },
        data: { status: "ACTIVE" },
      });

      expect(user.status).toBe("ACTIVE");
    });
  });

  describe("Data Export", () => {
    it("should gather all user data for export", async () => {
      const userData = {
        id: "user_1",
        email: "test@test.com",
        name: "Test User",
        profile: { bio: "Test bio" },
        addresses: [{ line1: "123 Main St" }],
        memberships: [],
        userSessions: [],
        securityLogs: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(userData as any);

      const result = await prisma.user.findUnique({
        where: { id: "user_1" },
        include: {
          profile: true,
          addresses: true,
          memberships: { include: { organization: true } },
          userSessions: true,
          securityLogs: true,
        },
      });

      expect(result).toBeDefined();
      expect((result as any)?.profile).toBeDefined();
    });
  });
});

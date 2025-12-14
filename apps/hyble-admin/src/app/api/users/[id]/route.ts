import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const userId = params.id;

    // Prevent self-demotion
    if (userId === session.user?.id && action === "demote") {
      return NextResponse.json(
        { error: "Cannot demote yourself" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case "promote":
        updateData.role = "admin";
        break;
      case "demote":
        updateData.role = "user";
        break;
      case "suspend":
        updateData.status = "SUSPENDED";
        break;
      case "unsuspend":
        updateData.status = "ACTIVE";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId,
        action: action === "suspend" ? "ACCOUNT_LOCK" : action === "unsuspend" ? "ACCOUNT_UNLOCK" : "LOGIN",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "admin-panel",
        device: "Admin Panel",
        metadata: { adminId: session.user?.id, action },
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// PUT - Full user update
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;

  try {
    const body = await request.json();
    const {
      name,
      email,
      phoneNumber,
      role,
      status,
      emailVerified,
      phoneVerified,
      trustLevel,
      // Profile fields
      firstName,
      lastName,
      avatar,
      position,
      language,
      currency,
      timezone,
    } = body;

    // Check email uniqueness if email is being changed
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        email,
        phoneNumber: phoneNumber || null,
        role,
        status,
        emailVerified: emailVerified ? new Date() : null,
        phoneVerified: phoneVerified || false,
        trustLevel,
      },
    });

    // Update or create profile
    const profileData = {
      firstName: firstName || null,
      lastName: lastName || null,
      avatar: avatar || null,
      position: position || null,
      language: language || "tr",
      currency: currency || "TRY",
      timezone: timezone || "Europe/Istanbul",
    };

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
      },
      update: profileData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;

  // Prevent self-deletion
  if (userId === session.user?.id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  try {
    // Delete user - cascade will handle related records
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        wallets: true,
        userSessions: {
          where: { isRevoked: false, expiresAt: { gt: new Date() } },
        },
        accounts: true,
        twoFactorAuth: {
          select: { enabled: true, verified: true },
        },
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import bcrypt from "bcryptjs";

// POST - Disable 2FA
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to disable 2FA" },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Cannot disable 2FA for OAuth accounts" },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    // Check if 2FA is enabled
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id },
    });

    if (!twoFactorAuth?.enabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    // Disable 2FA in a transaction
    await prisma.$transaction([
      // Delete 2FA record
      prisma.twoFactorAuth.delete({
        where: { userId: session.user.id },
      }),
      // Delete backup codes
      prisma.backupCode.deleteMany({
        where: { userId: session.user.id },
      }),
      // Update user trust level
      prisma.user.update({
        where: { id: session.user.id },
        data: { trustLevel: "VERIFIED" },
      }),
      // Log security action
      prisma.securityLog.create({
        data: {
          userId: session.user.id,
          action: "TWO_FACTOR_DISABLE",
          status: "SUCCESS",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}

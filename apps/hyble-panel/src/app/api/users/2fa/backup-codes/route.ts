import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// POST - Regenerate backup codes
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
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
        { error: "Password verification failed" },
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

    // Generate new backup codes
    const backupCodes: string[] = [];
    const hashedBackupCodes: { userId: string; code: string }[] = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      backupCodes.push(code);
      hashedBackupCodes.push({
        userId: session.user.id,
        code: await bcrypt.hash(code, 10),
      });
    }

    // Replace old backup codes
    await prisma.$transaction([
      prisma.backupCode.deleteMany({
        where: { userId: session.user.id },
      }),
      prisma.backupCode.createMany({
        data: hashedBackupCodes,
      }),
    ]);

    return NextResponse.json({
      success: true,
      backupCodes,
      message: "Backup codes regenerated successfully",
    });
  } catch (error) {
    console.error("Backup codes regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}

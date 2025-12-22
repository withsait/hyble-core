import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// POST - Verify TOTP code and enable 2FA
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get 2FA record
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id },
    });

    if (!twoFactorAuth) {
      return NextResponse.json(
        { error: "2FA setup not found. Please start setup again." },
        { status: 400 }
      );
    }

    if (twoFactorAuth.enabled) {
      return NextResponse.json(
        { error: "2FA is already enabled" },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: twoFactorAuth.secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes: string[] = [];
    const hashedBackupCodes: { code: string }[] = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      backupCodes.push(code);
      hashedBackupCodes.push({
        code: await bcrypt.hash(code, 10),
      });
    }

    // Enable 2FA and create backup codes in a transaction
    await prisma.$transaction([
      // Enable 2FA
      prisma.twoFactorAuth.update({
        where: { userId: session.user.id },
        data: {
          enabled: true,
          verified: true,
        },
      }),
      // Delete old backup codes
      prisma.backupCode.deleteMany({
        where: { userId: session.user.id },
      }),
      // Create new backup codes
      prisma.backupCode.createMany({
        data: hashedBackupCodes.map((bc) => ({
          userId: session.user.id!,
          code: bc.code,
        })),
      }),
      // Update user trust level
      prisma.user.update({
        where: { id: session.user.id },
        data: { trustLevel: "SECURE" },
      }),
      // Log security action
      prisma.securityLog.create({
        data: {
          userId: session.user.id,
          action: "TWO_FACTOR_ENABLE",
          status: "SUCCESS",
          metadata: { method: "totp" },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      backupCodes,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}

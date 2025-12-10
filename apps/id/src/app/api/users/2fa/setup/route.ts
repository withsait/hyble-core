import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/database";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// GET - Generate new 2FA secret and QR code
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if 2FA is already enabled
    const existing = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id },
    });

    if (existing?.enabled) {
      return NextResponse.json(
        { error: "2FA is already enabled" },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = authenticator.generateSecret();

    // Create OTP auth URL
    const otpauth = authenticator.keyuri(
      session.user.email || session.user.id,
      "Hyble ID",
      secret
    );

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret (not enabled yet)
    await prisma.twoFactorAuth.upsert({
      where: { userId: session.user.id },
      update: {
        secret,
        enabled: false,
        verified: false,
      },
      create: {
        userId: session.user.id,
        secret,
        enabled: false,
        verified: false,
      },
    });

    return NextResponse.json({
      secret,
      qrCode,
      otpauth,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

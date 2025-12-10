import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/database";

export const dynamic = "force-dynamic";

// GET - Get 2FA status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id },
      select: {
        enabled: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const backupCodesCount = await prisma.backupCode.count({
      where: {
        userId: session.user.id,
        used: false,
      },
    });

    return NextResponse.json({
      enabled: twoFactorAuth?.enabled ?? false,
      verified: twoFactorAuth?.verified ?? false,
      enabledAt: twoFactorAuth?.enabled ? twoFactorAuth.updatedAt : null,
      backupCodesRemaining: backupCodesCount,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Failed to get 2FA status" },
      { status: 500 }
    );
  }
}

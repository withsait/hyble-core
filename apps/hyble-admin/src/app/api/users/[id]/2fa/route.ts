import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;

  try {
    // Delete 2FA record
    await prisma.twoFactorAuth.delete({
      where: { userId },
    });

    // Delete backup codes
    await prisma.backupCode.deleteMany({
      where: { userId },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId,
        action: "TWO_FACTOR_DISABLE",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "admin-panel",
        device: "Admin Panel",
        metadata: { adminId: session.user?.id, reason: "Admin reset" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset 2FA" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId, sessionId } = params;

  try {
    // Revoke specific session
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId,
        action: "SESSION_REVOKE",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "admin-panel",
        device: "Admin Panel",
        metadata: { adminId: session.user?.id, sessionId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session termination error:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}

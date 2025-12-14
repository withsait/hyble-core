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
    // Revoke all active sessions
    await prisma.userSession.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    // Also delete from Session table (NextAuth sessions)
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId,
        action: "SESSION_REVOKE",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "admin-panel",
        device: "Admin Panel",
        metadata: { adminId: session.user?.id, action: "Terminate all sessions" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session termination error:", error);
    return NextResponse.json(
      { error: "Failed to terminate sessions" },
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
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: params.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

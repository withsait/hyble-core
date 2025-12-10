import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/database";

export const dynamic = "force-dynamic";

// DELETE - Revoke a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the session
    const userSession = await prisma.userSession.findUnique({
      where: { id },
    });

    if (!userSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Make sure the session belongs to the user
    if (userSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if trying to revoke current session
    const currentSessionToken = (session as any).sessionToken;
    if (userSession.sessionToken === currentSessionToken) {
      return NextResponse.json(
        { error: "Cannot revoke current session" },
        { status: 400 }
      );
    }

    // Revoke the session
    await prisma.userSession.update({
      where: { id },
      data: { isRevoked: true },
    });

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "SESSION_REVOKE",
        status: "SUCCESS",
        metadata: {
          sessionId: id,
          deviceName: userSession.deviceName,
          browser: userSession.browser,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}

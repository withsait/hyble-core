import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import {
  parseUserAgent,
  getClientIP,
} from "@/lib/session-tracker";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// GET - List all active sessions for the user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: session.user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        sessionToken: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        browserVersion: true,
        os: true,
        osVersion: true,
        ipAddress: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    // Get current session token from JWT
    const currentSessionToken = (session as any).sessionToken;

    // Mark which session is current
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.sessionToken === currentSessionToken,
    }));

    return NextResponse.json({ sessions: sessionsWithCurrent });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new session (called after login)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent");
    const ipAddress = getClientIP(request);
    const parsed = parseUserAgent(userAgent);

    // Get session token from JWT or generate new one
    const sessionToken = (session as any).sessionToken || uuidv4();

    // Check if session already exists
    const existingSession = await prisma.userSession.findUnique({
      where: { sessionToken },
    });

    if (existingSession) {
      // Update existing session
      await prisma.userSession.update({
        where: { sessionToken },
        data: {
          lastActiveAt: new Date(),
          ipAddress,
        },
      });

      return NextResponse.json({ success: true, sessionToken });
    }

    // Session expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create new session
    await prisma.userSession.create({
      data: {
        userId: session.user.id,
        sessionToken,
        ...parsed,
        ipAddress,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, sessionToken });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke all sessions except current
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentSessionToken = (session as any).sessionToken;

    const result = await prisma.userSession.updateMany({
      where: {
        userId: session.user.id,
        isRevoked: false,
        ...(currentSessionToken
          ? { sessionToken: { not: currentSessionToken } }
          : {}),
      },
      data: { isRevoked: true },
    });

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "SESSION_REVOKE",
        status: "SUCCESS",
        metadata: { revokedCount: result.count, type: "all_except_current" },
      },
    });

    return NextResponse.json({
      success: true,
      revokedCount: result.count,
    });
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/auth";
import { sign } from "jsonwebtoken";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;

  try {
    // Get the user to impersonate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create an impersonation token
    const impersonationToken = sign(
      {
        userId: user.id,
        email: user.email,
        adminId: session.user?.id,
        impersonating: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      },
      process.env.AUTH_SECRET || "secret"
    );

    // Log the impersonation
    await prisma.securityLog.create({
      data: {
        userId,
        action: "LOGIN",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "admin-panel",
        device: "Admin Impersonation",
        metadata: { adminId: session.user?.id, impersonation: true },
      },
    });

    // Generate URL for Hyble ID with impersonation token
    const idUrl = process.env.HYBLE_ID_URL || "http://localhost:3001";
    const url = `${idUrl}/impersonate?token=${impersonationToken}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Failed to impersonate user" },
      { status: 500 }
    );
  }
}

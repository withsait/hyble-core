import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/database";
import { getAdminSession } from "@/lib/auth";
import { randomBytes } from "crypto";

// Get all invites for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
      include: {
        invites: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization.invites);
  } catch (error) {
    console.error("Get invites error:", error);
    return NextResponse.json(
      { error: "Failed to get invites" },
      { status: 500 }
    );
  }
}

// Create a new invite
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten organizasyon üyesi" },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: organization.id,
        email,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Bu e-posta adresine zaten bekleyen bir davet var" },
        { status: 400 }
      );
    }

    // Generate invite token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId: organization.id,
        email,
        role,
        token,
        expiresAt,
        invitedBy: session.user!.id!,
      },
    });

    return NextResponse.json({ success: true, invite });
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

// Cancel/delete an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("inviteId");

    if (!inviteId) {
      return NextResponse.json(
        { error: "inviteId is required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    await prisma.organizationInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invite error:", error);
    return NextResponse.json(
      { error: "Failed to delete invite" },
      { status: 500 }
    );
  }
}

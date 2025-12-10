import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import {
  isOrganizationAdmin,
  isOrganizationOwner,
  countOwners,
  getUserRole,
} from "@/lib/organization";

export const dynamic = "force-dynamic";

// PUT - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, userId } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    const hasPermission = await isOrganizationAdmin(
      session.user.id,
      organization.id
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to update member roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!["OWNER", "ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find the member
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Only owner can change roles to/from OWNER
    if (member.role === "OWNER" || role === "OWNER") {
      const isOwner = await isOrganizationOwner(
        session.user.id,
        organization.id
      );
      if (!isOwner) {
        return NextResponse.json(
          { error: "Only owners can transfer ownership" },
          { status: 403 }
        );
      }
    }

    // Prevent removing the last owner
    if (member.role === "OWNER" && role !== "OWNER") {
      const ownerCount = await countOwners(organization.id);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner. Transfer ownership first." },
          { status: 400 }
        );
      }
    }

    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update member role error:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, userId } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Find the member to remove
    const memberToRemove = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId,
        },
      },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // User can leave organization themselves
    const isSelf = userId === session.user.id;

    if (!isSelf) {
      // Check if user has permission to remove others
      const currentUserRole = await getUserRole(
        session.user.id,
        organization.id
      );

      if (!currentUserRole) {
        return NextResponse.json(
          { error: "You are not a member of this organization" },
          { status: 403 }
        );
      }

      // Admins can remove members/viewers, owners can remove anyone
      if (currentUserRole === "ADMIN") {
        if (memberToRemove.role === "OWNER" || memberToRemove.role === "ADMIN") {
          return NextResponse.json(
            { error: "Admins cannot remove other admins or owners" },
            { status: 403 }
          );
        }
      } else if (currentUserRole !== "OWNER") {
        return NextResponse.json(
          { error: "You don't have permission to remove members" },
          { status: 403 }
        );
      }
    }

    // Prevent removing the last owner
    if (memberToRemove.role === "OWNER") {
      const ownerCount = await countOwners(organization.id);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner. Transfer ownership first." },
          { status: 400 }
        );
      }
    }

    await prisma.organizationMember.delete({
      where: { id: memberToRemove.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

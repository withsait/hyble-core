/**
 * Notification Preferences API
 * GET: Get user's notification preferences
 * PATCH: Update notification preferences
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";

// Get notification preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update notification preferences
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate allowed fields
    const allowedFields = [
      // Security is always on - cannot be turned off
      // 'securityEmail', 'securityPanel',

      // Default on
      'billingEmail', 'billingPanel',
      'projectsEmail', 'projectsPanel',
      'supportEmail', 'supportPanel',

      // Default off
      'updatesEmail', 'updatesPanel',
      'marketingEmail', 'marketingPanel',

      // Discord
      'discordDm',
    ];

    const updateData: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof body[field] === 'boolean') {
        updateData[field] = body[field];
      }
    }

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

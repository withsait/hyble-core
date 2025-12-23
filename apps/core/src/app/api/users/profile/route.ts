import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        twoFactorAuth: true,
        connectedAccounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      status: user.status,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatar: user.profile.avatar,
            position: user.profile.position,
            language: user.profile.language,
            currency: user.profile.currency,
            timezone: user.profile.timezone,
            dateFormat: user.profile.dateFormat,
          }
        : null,
      twoFactorAuth: user.twoFactorAuth
        ? {
            enabled: user.twoFactorAuth.enabled,
            backupCodesRemaining: user.twoFactorAuth.backupCodes?.length || 0,
          }
        : null,
      connectedAccounts: user.connectedAccounts,
    });
  } catch (error) {
    console.error("[profile] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phoneNumber, position, language, currency, timezone, dateFormat } = body;

    // Update user phone number if provided
    if (phoneNumber !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phoneNumber },
      });
    }

    // Update user name based on firstName and lastName
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;
    if (fullName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: fullName },
      });
    }

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        position: position ?? undefined,
        language: language ?? undefined,
        currency: currency ?? undefined,
        timezone: timezone ?? undefined,
        dateFormat: dateFormat ?? undefined,
      },
      create: {
        userId: session.user.id,
        firstName,
        lastName,
        position,
        language: language || "tr",
        currency: currency || "TRY",
        timezone: timezone || "Europe/Istanbul",
        dateFormat: dateFormat || "DD/MM/YYYY",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil güncellendi",
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        position: profile.position,
        language: profile.language,
        currency: profile.currency,
        timezone: profile.timezone,
        dateFormat: profile.dateFormat,
      },
    });
  } catch (error) {
    console.error("[profile] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// PATCH - Same as PUT for compatibility
export async function PATCH(request: NextRequest) {
  return PUT(request);
}

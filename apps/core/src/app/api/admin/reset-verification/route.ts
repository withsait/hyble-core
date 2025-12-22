import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

/**
 * TEST ENDPOINT - Reset email verification for a user
 * This endpoint is for development/testing purposes only
 *
 * POST /api/admin/reset-verification
 * Body: { email: "user@example.com" }
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Reset email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: null,
        emailVerifiedAt: null,
        trustLevel: "GUEST",
      },
    });

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: "email",
      },
    });

    // Create new verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        type: "email",
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: `Verification reset for ${email}. New verification email sent.`,
      token: token, // Include token for testing purposes
    });
  } catch (error) {
    console.error("[reset-verification] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset verification" },
      { status: 500 }
    );
  }
}

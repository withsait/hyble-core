import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { sendVerificationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MAX_EMAILS_PER_WINDOW = 3;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // Check if user is already verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Rate limiting: Check how many verification emails sent in last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW);
    const recentTokens = await prisma.verificationToken.count({
      where: {
        identifier: email,
        type: "email",
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentTokens >= MAX_EMAILS_PER_WINDOW) {
      return NextResponse.json(
        {
          error: "Too many verification emails sent. Please try again later.",
          retryAfter: RATE_LIMIT_WINDOW / 1000,
        },
        { status: 429 }
      );
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: "email",
      },
    });

    // Create new verification token (24 hours validity)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

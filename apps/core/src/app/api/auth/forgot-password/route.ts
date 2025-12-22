import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Always return success message for security (don't reveal if email exists)
    const successResponse = {
      success: true,
      message: "Şifre sıfırlama linki email adresinize gönderildi.",
    };

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user doesn't exist, still return success (security)
    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset token (15 minutes validity)
    const token = randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    // Send password reset email
    console.log("[forgot-password] Sending reset email to:", email);
    console.log("[forgot-password] Token:", token);

    try {
      const emailResult = await sendPasswordResetEmail(email, token);
      console.log("[forgot-password] Email result:", JSON.stringify(emailResult));
    } catch (emailError) {
      console.error("[forgot-password] Email send error:", emailError);
      throw emailError;
    }

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

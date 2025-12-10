import { NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { sendPasswordResetEmail } from "@hyble/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email adresi gerekli" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete existing password reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset token
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, token, "hyble");

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUEST",
        status: "SUCCESS",
        metadata: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

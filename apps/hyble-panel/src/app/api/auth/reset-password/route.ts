import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@hyble/db";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token ve şifre gerekli" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Find password reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "Şifre sıfırlama linkinin süresi dolmuş" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete password reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: resetToken.userId,
        action: "PASSWORD_RESET",
        status: "SUCCESS",
        metadata: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Şifre değiştirme başarısız" },
      { status: 500 }
    );
  }
}

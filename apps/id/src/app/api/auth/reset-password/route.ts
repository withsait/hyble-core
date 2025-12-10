import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/database";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    console.log("[reset-password] Request received");
    console.log("[reset-password] Token:", token);
    console.log("[reset-password] Password length:", password?.length);

    if (!token || !password) {
      console.log("[reset-password] Missing token or password");
      return NextResponse.json(
        { error: "Token ve şifre gereklidir." },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("[reset-password] Password too short");
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Find the password reset token
    console.log("[reset-password] Looking up token in database...");
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    console.log("[reset-password] Token found:", resetToken ? {
      id: resetToken.id,
      userId: resetToken.userId,
      expires: resetToken.expires,
      userEmail: resetToken.user?.email,
    } : null);

    if (!resetToken) {
      console.log("[reset-password] Token not found in database");
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş token." },
        { status: 400 }
      );
    }

    // Check if token is expired (15 minutes)
    console.log("[reset-password] Token expires:", resetToken.expires);
    console.log("[reset-password] Current time:", new Date());
    console.log("[reset-password] Is expired:", resetToken.expires < new Date());

    if (resetToken.expires < new Date()) {
      console.log("[reset-password] Token has expired, deleting...");
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: "Şifre sıfırlama linkinin süresi dolmuş. Lütfen yeni bir link talep edin." },
        { status: 400 }
      );
    }

    // Check password history (last 5 passwords)
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId: resetToken.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Check if new password matches any of the last 5 passwords
    for (const history of passwordHistory) {
      const isMatch = await bcrypt.compare(password, history.passwordHash);
      if (isMatch) {
        return NextResponse.json(
          { error: "Bu şifreyi daha önce kullandınız. Lütfen farklı bir şifre seçin." },
          { status: 400 }
        );
      }
    }

    // Also check current password
    if (resetToken.user.password) {
      const isCurrentPassword = await bcrypt.compare(password, resetToken.user.password);
      if (isCurrentPassword) {
        return NextResponse.json(
          { error: "Yeni şifreniz mevcut şifrenizle aynı olamaz." },
          { status: 400 }
        );
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and add to history
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      // Add old password to history (if exists)
      ...(resetToken.user.password
        ? [
            prisma.passwordHistory.create({
              data: {
                userId: resetToken.userId,
                passwordHash: resetToken.user.password,
              },
            }),
          ]
        : []),
      // Delete the used token
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
      // Log security event
      prisma.securityLog.create({
        data: {
          userId: resetToken.userId,
          action: "PASSWORD_CHANGE",
          status: "SUCCESS",
          metadata: { method: "reset" },
        },
      }),
    ]);

    // Clean up old password history (keep only last 5)
    const oldHistory = await prisma.passwordHistory.findMany({
      where: { userId: resetToken.userId },
      orderBy: { createdAt: "desc" },
      skip: 5,
    });

    if (oldHistory.length > 0) {
      await prisma.passwordHistory.deleteMany({
        where: {
          id: { in: oldHistory.map((h) => h.id) },
        },
      });
    }

    console.log("[reset-password] Password updated successfully for user:", resetToken.userId);

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    console.error("[reset-password] Error stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { error: "Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

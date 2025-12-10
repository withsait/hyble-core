import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
      return NextResponse.redirect(new URL("/login?error=TokenExpired", request.url));
    }

    // Update user
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_VERIFIED",
        status: "SUCCESS",
        metadata: {},
      },
    });

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", request.url));
  }
}

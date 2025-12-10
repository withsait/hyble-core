import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/database";

// Hardcoded production URL - never use localhost
const BASE_URL = "https://id.hyble.co";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  console.log("[verify-email] Received token:", token);

  if (!token) {
    console.log("[verify-email] No token provided");
    return NextResponse.redirect(`${BASE_URL}/login?error=invalid-token`);
  }

  try {
    // Find the verification token by token field
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        type: "email",
      },
    });

    console.log("[verify-email] Found token in DB:", verificationToken ? {
      id: verificationToken.id,
      identifier: verificationToken.identifier,
      token: verificationToken.token.substring(0, 8) + "...",
      expires: verificationToken.expires,
    } : null);

    if (!verificationToken) {
      console.log("[verify-email] Token not found in database");
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid-token`);
    }

    // Check if token is expired (24 hours)
    if (verificationToken.expires < new Date()) {
      console.log("[verify-email] Token expired:", verificationToken.expires);

      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(`${BASE_URL}/login?error=token-expired`);
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    console.log("[verify-email] Found user:", user ? { id: user.id, email: user.email } : null);

    if (!user) {
      console.log("[verify-email] User not found for identifier:", verificationToken.identifier);
      return NextResponse.redirect(`${BASE_URL}/login?error=user-not-found`);
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerifiedAt: new Date(),
        trustLevel: "VERIFIED",
      },
    });

    console.log("[verify-email] User verified successfully:", user.id);

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    console.log("[verify-email] Token deleted, redirecting to dashboard");

    // Redirect to dashboard with success message
    return NextResponse.redirect(`${BASE_URL}/dashboard?verified=true`);
  } catch (error) {
    console.error("[verify-email] Error:", error);
    return NextResponse.redirect(`${BASE_URL}/login?error=verification-failed`);
  }
}

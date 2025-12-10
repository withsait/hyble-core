import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@hyble/db";
import { sendVerificationEmail } from "@hyble/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    // Create wallet
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "USD",
      },
    });

    // Create verification token
    const verificationToken = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, "hyble");

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        status: "SUCCESS",
        metadata: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Kayıt işlemi başarısız" },
      { status: 500 }
    );
  }
}

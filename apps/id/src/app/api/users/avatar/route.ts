import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/database";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPG, PNG ve WebP formatları kabul edilir" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 2MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Create avatars directory if it doesn't exist
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    await mkdir(avatarsDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(avatarsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user profile with avatar URL
    const avatarUrl = `/avatars/${filename}`;

    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: { avatar: avatarUrl },
      create: {
        userId: session.user.id,
        avatar: avatarUrl,
      },
    });

    // Also update user.image for consistency
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: avatarUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar güncellendi",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("[avatar] POST error:", error);
    return NextResponse.json(
      { error: "Avatar yüklenemedi" },
      { status: 500 }
    );
  }
}

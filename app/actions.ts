"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createProject(formData: FormData) {
  // 1. Oturumu kontrol et (Kim bu ekleyen?)
  const session = await getServerSession();
  
  if (!session || !session.user?.email) {
    throw new Error("Oturum açmanız gerekiyor.");
  }

  // 2. Kullanıcıyı veritabanında bul (ID'sini almak için)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("Kullanıcı bulunamadı.");

  // 3. Formdan verileri al
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  // 4. Veritabanına kaydet
  await prisma.project.create({
    data: {
      name,
      description,
      status,
      userId: user.id, // Projeyi sana bağlıyoruz
      progress: 0,     // Yeni proje %0 başlar
    }
  });

  // 5. Sayfayı yenile ve yönlendir
  revalidatePath("/");          // Ana sayfayı güncelle (Yeni proje görünsün)
  revalidatePath("/dashboard"); // Paneli güncelle
  redirect("/dashboard");       // Panele geri dön
}
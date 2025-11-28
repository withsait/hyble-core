import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Email ve Şifre gelmiş mi kontrol et
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bilgiler eksik");
        }

        // 2. Kullanıcıyı veritabanında bul
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 3. Kullanıcı yoksa veya şifresi yoksa reddet
        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // 4. Şifreyi kontrol et (Hash kıyaslama)
        // NOT: Şimdilik düz metin kontrolü yapıyoruz çünkü veritabanına '123456' diye elle girdik.
        // İleride bcrypt.compare kullanacağız.
        // const isValid = await bcrypt.compare(credentials.password, user.password);
        
        const isValid = credentials.password === user.password; // GEÇİCİ OLARAK DÜZ KONTROL

        if (!isValid) {
          throw new Error("Şifre hatalı");
        }

        // 5. Giriş başarılı, bilgileri döndür
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role, // Rolü de panele taşıyalım
        };
      }
    })
  ],
  callbacks: {
    // JWT (Jeton) içine rolü ekle
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // Oturuma rolü ekle (Frontend görsün diye)
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Kendi özel giriş sayfamızı yapacağız
  }
});

export { handler as GET, handler as POST };
import { withAuth } from "next-auth/middleware";

// Kısayol yerine, fonksiyonu açıkça çağırıp dışa aktarıyoruz
export default withAuth({
  pages: {
    signIn: "/login", // Giriş yapmamış kişiyi buraya at
  },
});

export const config = {
  matcher: ["/dashboard/:path*"], // Korunacak yollar
};
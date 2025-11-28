export { default } from "next-auth/middleware";

// Bekçinin koruyacağı yollar
export const config = {
  matcher: ["/dashboard/:path*"] // /dashboard ve altındaki her şeyi koru
};
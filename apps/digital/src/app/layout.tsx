import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digital.hyble.co"),
  title: {
    default: "Hyble Digital - Corporate Solutions",
    template: "%s | Hyble Digital",
  },
  description: "Kurumsal web siteleri, temalar, araclari ve ozel siparisler. Isletmeniz icin profesyonel dijital cozumler.",
  keywords: ["web templates", "corporate websites", "web tools", "custom orders", "digital solutions"],
  authors: [{ name: "Hyble Digital" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://digital.hyble.co",
    siteName: "Hyble Digital",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

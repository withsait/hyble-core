import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digital.hyble.co"),
  title: {
    default: "Hyble Digital - Kurumsal Dijital Cozumler",
    template: "%s | Hyble Digital",
  },
  description: "Kurumsal web siteleri, sablonlar, araclar ve ozel projeler. Isletmenizi dijital dunyada one cikarin.",
  keywords: ["kurumsal web sitesi", "web sablonlari", "dijital cozumler", "e-ticaret", "landing page"],
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
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

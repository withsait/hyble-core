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
  metadataBase: new URL("https://studios.hyble.co"),
  title: {
    default: "Hyble Studios - Gaming Solutions",
    template: "%s | Hyble Studios",
  },
  description: "Oyun sunuculari, pluginler, server packler ve ozel gaming cozumleri. Minecraft, FiveM, Rust ve daha fazlasi.",
  keywords: ["game servers", "minecraft hosting", "fivem", "rust", "plugins", "server packs"],
  authors: [{ name: "Hyble Studios" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://studios.hyble.co",
    siteName: "Hyble Studios",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
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

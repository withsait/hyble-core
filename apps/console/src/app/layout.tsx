import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { APIProvider } from "@hyble/api";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { CommandPalette } from "@/components/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://console.hyble.co"),
  title: {
    default: "Console | Hyble",
    template: "%s | Hyble Console",
  },
  description: "Hyble hesabınızı yönetin. Ürünler, faturalar, destek.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <APIProvider source="console">
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
              <PanelSidebar />
              <div className="lg:pl-64">
                <PanelHeader />
                <main className="p-6">{children}</main>
              </div>
              <CommandPalette />
            </div>
          </APIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

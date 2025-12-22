import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  description: "Oyun sunucuları, pluginler, server packler ve özel gaming çözümleri. Minecraft, FiveM, Rust ve daha fazlası.",
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
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Font loading optimization
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyble.co"),
  title: {
    default: "Hyble - All in One. All in Hyble.",
    template: "%s | Hyble",
  },
  description: "Hızlı kurulum, kolay yönetim. Hosting, ödeme, kimlik doğrulama — hepsi tek platformda.",
  keywords: ["hosting", "cloud", "ödeme", "kimlik doğrulama", "API", "SaaS", "platform"],
  authors: [{ name: "Hyble" }],
  creator: "Hyble",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://hyble.co",
    siteName: "Hyble",
    title: "Hyble - All in One. All in Hyble.",
    description: "Hızlı kurulum, kolay yönetim. Hosting, ödeme, kimlik doğrulama — hepsi tek platformda.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyble - All in One. All in Hyble.",
    description: "Hızlı kurulum, kolay yönetim. Hosting, ödeme, kimlik doğrulama — hepsi tek platformda.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/cart";
import { CompareBar } from "@/components/compare";
import { WishlistDrawer } from "@/components/wishlist";
import { ExitIntentPopup } from "@/components/conversion";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyble.co"),
  title: {
    default: "Hyble - All in One. All in Hyble.",
    template: "%s | Hyble",
  },
  description: "Digital solutions & Gaming services. Web hosting, game servers, cloud infrastructure.",
  keywords: ["hosting", "cloud", "game servers", "web templates", "SaaS", "platform"],
  authors: [{ name: "Hyble" }],
  creator: "Hyble",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://hyble.co",
    siteName: "Hyble",
    title: "Hyble - All in One. All in Hyble.",
    description: "Digital solutions & Gaming services. Web hosting, game servers, cloud infrastructure.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyble - All in One. All in Hyble.",
    description: "Digital solutions & Gaming services.",
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
          <CartProvider>
            <CompareProvider>
              <WishlistProvider>
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                  <CartDrawer />
                  <CompareBar />
                  <WishlistDrawer />
                  <ExitIntentPopup />
                </div>
              </WishlistProvider>
            </CompareProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

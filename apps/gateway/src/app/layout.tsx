import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hyble - Your Digital Infrastructure Partner",
  description:
    "Hyble offers Studios for gaming, Digital for web services, and Cloud for SaaS solutions. One platform, endless possibilities.",
  keywords: ["hosting", "gaming", "web services", "cloud", "minecraft", "saas"],
  authors: [{ name: "Hyble" }],
  openGraph: {
    title: "Hyble - Your Digital Infrastructure Partner",
    description:
      "Studios for gaming, Digital for web, Cloud for SaaS. One platform, endless possibilities.",
    url: "https://hyble.co",
    siteName: "Hyble",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyble - Your Digital Infrastructure Partner",
    description:
      "Studios for gaming, Digital for web, Cloud for SaaS. One platform, endless possibilities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

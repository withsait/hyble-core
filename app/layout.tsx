import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hyble | AI-Native Digital Solutions",
  description: "Web Development, AI Integration, and Digital Transformation. Yapay zeka destekli dijital çözümler, modern web geliştirme ve işletme dönüşümü.",
  keywords: ["web development", "AI", "digital transformation", "Next.js", "React", "Minecraft server", "Hyble"],
  authors: [{ name: "Hyble" }],
  creator: "Hyble Digital Solutions",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://hyble.co",
    title: "Hyble | AI-Native Digital Solutions",
    description: "Yapay zeka destekli dijital çözümler, modern web geliştirme ve işletme dönüşümü.",
    siteName: "Hyble",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyble | AI-Native Digital Solutions",
    description: "Yapay zeka destekli dijital çözümler, modern web geliştirme ve işletme dönüşümü.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1628' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
// YENİ İMPORT:
import { ThemeProvider } from "@/components/theme-provider"; // Hata verirse ../components/theme-provider

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space",
  weight: ['300', '400', '500', '600', '700'] 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "Hyble | AI-Native Digital Solutions",
  description: "Web Development, AI Integration, and Digital Transformation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground dark:bg-night dark:text-white transition-colors duration-300`}>
        {/* ThemeProvider ile sarıyoruz */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Varsayılan GECE olsun
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
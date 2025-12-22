import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Console - Hyble",
  description: "Manage your Hyble services from a single dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, this would come from session
  const user = null;

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Sidebar />
        <Header user={user} credits={0} cartCount={0} />
        <main className="ml-64 pt-14">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}

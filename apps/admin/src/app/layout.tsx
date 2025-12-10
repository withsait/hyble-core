import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/Sidebar";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hyble Admin",
  description: "Hyble Administration Panel",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no admin session, the middleware will handle redirect
  // But we still check here for the layout to work properly
  const showSidebar = !!session?.user;

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {showSidebar && session.user && <Sidebar user={session.user} />}
          <main className={showSidebar ? "ml-64" : ""}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

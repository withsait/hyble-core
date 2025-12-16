import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, FolderTree, ChevronRight, Home } from "lucide-react";

export default async function PIMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only admins can access PIM
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <span className="text-slate-900 dark:text-white font-semibold">PIM</span>
                <span className="text-xs text-muted-foreground ml-1">Product Management</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                PIM
              </span>
            </div>

            <Link
              href="/dashboard/pim/products"
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Package className="h-4 w-4" />
              Ürünler
            </Link>

            <Link
              href="/dashboard/pim/categories"
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FolderTree className="h-4 w-4" />
              Kategoriler
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

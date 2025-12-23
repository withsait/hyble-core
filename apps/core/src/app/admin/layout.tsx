"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRPCProvider } from "@/lib/trpc/provider";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Cloud,
  Ticket,
  Mail,
  Globe,
  Activity,
  Bot,
  Bell,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  ShoppingCart,
  Star,
  BarChart3,
  FileText,
  PenLine,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanicilar", icon: Users },
  { href: "/admin/wallets", label: "Cuzdanlar", icon: Wallet },
  { href: "/admin/billing", label: "Faturalama", icon: CreditCard },
  { href: "/admin/pim", label: "Urunler (PIM)", icon: Package },
  { href: "/admin/orders", label: "Siparisler", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Yorumlar", icon: Star },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/admin/blog", label: "Blog", icon: PenLine },
  { href: "/admin/cloud", label: "Cloud", icon: Cloud },
  { href: "/admin/support", label: "Destek", icon: Ticket },
  { href: "/admin/emails", label: "Email Loglari", icon: Mail },
  { href: "/admin/pages", label: "Sayfalar (CMS)", icon: FileText },
  { href: "/admin/status", label: "Durum Sayfasi", icon: Globe },
  { href: "/admin/watch", label: "Monitoring", icon: Activity },
  { href: "/admin/hyla", label: "Hyla AI", icon: Bot },
  { href: "/admin/notifications", label: "Bildirimler", icon: Bell },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Top Bar - Blue theme */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <span className="font-bold text-lg">Secret Panel</span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100">sait@hyble.co</span>
            <Link
              href="/logout"
              className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cikis
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Midnight black in dark mode */}
        <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-64 bg-white dark:bg-[#0d0d14] border-r border-slate-200 dark:border-slate-800/50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto text-blue-500" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Midnight black in dark mode */}
        <main className="flex-1 min-h-[calc(100vh-57px)] bg-slate-50 dark:bg-[#0a0a0f]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </TRPCProvider>
  );
}

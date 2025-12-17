import Link from "next/link";
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
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users },
  { href: "/admin/billing", label: "Faturalama", icon: CreditCard },
  { href: "/admin/pim", label: "Ürünler (PIM)", icon: Package },
  { href: "/admin/cloud", label: "Cloud", icon: Cloud },
  { href: "/admin/support", label: "Destek", icon: Ticket },
  { href: "/admin/emails", label: "Email Logları", icon: Mail },
  { href: "/admin/status", label: "Durum Sayfası", icon: Globe },
  { href: "/admin/watch", label: "Monitoring", icon: Activity },
  { href: "/admin/hyla", label: "Hyla AI", icon: Bot },
  { href: "/admin/notifications", label: "Bildirimler", icon: Bell },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-amber-500" />
            <span className="font-bold text-lg">Secret Panel</span>
            <span className="text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full font-medium">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">sait@hyble.co</span>
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

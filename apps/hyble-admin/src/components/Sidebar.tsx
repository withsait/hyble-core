"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldAlert,
  Activity,
  Settings,
  LogOut,
  Shield,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { signOut } from "next-auth/react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Default to light mode unless explicitly set to dark or system prefers dark
    if (savedTheme === "dark" || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 text-slate-600 dark:hidden" />
      <Moon className="w-5 h-5 text-slate-300 hidden dark:block" />
    </button>
  );
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Kullanıcılar", href: "/users", icon: Users },
  { name: "Organizasyonlar", href: "/organizations", icon: Building2 },
  { name: "Güvenlik", href: "/security", icon: ShieldAlert },
  { name: "Loglar", href: "/logs", icon: FileText },
  { name: "Sistem", href: "/system", icon: Activity },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-slate-900 dark:text-white font-semibold text-lg">Hyble Admin</span>
            <p className="text-xs text-slate-500 dark:text-slate-500">Kontrol Paneli</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium">
                {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

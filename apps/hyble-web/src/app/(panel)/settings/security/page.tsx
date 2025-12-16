"use client";

import Link from "next/link";
import { User, Shield, Bell, Key, Smartphone, Monitor } from "lucide-react";
import { usePathname } from "next/navigation";

const settingsNav = [
  { name: "Profil", href: "/settings", icon: User },
  { name: "Güvenlik", href: "/settings/security", icon: Shield },
  { name: "Bildirimler", href: "/settings/notifications", icon: Bell },
];

export default function SecuritySettingsPage() {
  const pathname = usePathname();

  // TODO: Fetch from tRPC
  const sessions: Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }> = [
    {
      id: "1",
      device: "Windows PC",
      browser: "Chrome",
      location: "İstanbul, TR",
      lastActive: "Şu an aktif",
      isCurrent: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        Ayarlar
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Password Change */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Şifre Değiştir
              </h2>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>

          {/* 2FA */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    İki Faktörlü Doğrulama (2FA)
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Hesabınızı ekstra güvenlik katmanı ile koruyun.
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Etkinleştir
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Aktif Oturumlar
              </h2>
            </div>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Monitor className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {session.device} - {session.browser}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      Bu cihaz
                    </span>
                  ) : (
                    <button className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline">
                      Sonlandır
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

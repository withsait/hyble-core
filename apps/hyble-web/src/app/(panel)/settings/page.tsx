"use client";

import Link from "next/link";
import { User, Shield, Bell, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";

const settingsNav = [
  { name: "Profil", href: "/settings", icon: User },
  { name: "Güvenlik", href: "/settings/security", icon: Shield },
  { name: "Bildirimler", href: "/settings/notifications", icon: Bell },
];

export default function SettingsPage() {
  const pathname = usePathname();

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
          {/* Profile Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">
              Profil Bilgileri
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  E-posta adresinizi değiştirmek için destek ile iletişime geçin.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
            <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              Tehlikeli Bölge
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Bu işlemler geri alınamaz. Lütfen dikkatli olun.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="h-4 w-4" />
              Hesabı Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

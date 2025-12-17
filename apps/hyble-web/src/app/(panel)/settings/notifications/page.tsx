// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, Shield, Bell, Loader2, CheckCircle,
  Mail, Smartphone, MessageSquare, CreditCard,
  FolderKanban, HeadphonesIcon, Megaphone, Gift
} from "lucide-react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

const settingsNav = [
  { name: "Profil", href: "/settings", icon: User },
  { name: "Güvenlik", href: "/settings/security", icon: Shield },
  { name: "Bildirimler", href: "/settings/notifications", icon: Bell },
];

type NotificationCategory = {
  id: string;
  title: string;
  description: string;
  icon: typeof Mail;
  emailKey: string;
  panelKey: string;
};

const notificationCategories: NotificationCategory[] = [
  {
    id: "billing",
    title: "Faturalama",
    description: "Fatura, ödeme ve bakiye bildirimleri",
    icon: CreditCard,
    emailKey: "billingEmail",
    panelKey: "billingPanel",
  },
  {
    id: "projects",
    title: "Projeler",
    description: "Deploy, hata ve proje durumu bildirimleri",
    icon: FolderKanban,
    emailKey: "projectsEmail",
    panelKey: "projectsPanel",
  },
  {
    id: "support",
    title: "Destek",
    description: "Destek talepleri ve yanıtları",
    icon: HeadphonesIcon,
    emailKey: "supportEmail",
    panelKey: "supportPanel",
  },
  {
    id: "updates",
    title: "Güncellemeler",
    description: "Platform ve özellik güncellemeleri",
    icon: Megaphone,
    emailKey: "updatesEmail",
    panelKey: "updatesPanel",
  },
  {
    id: "marketing",
    title: "Pazarlama",
    description: "Promosyonlar ve özel teklifler",
    icon: Gift,
    emailKey: "marketingEmail",
    panelKey: "marketingPanel",
  },
];

export default function NotificationsSettingsPage() {
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  const { data: notificationPrefs, isLoading } = trpc.user.getNotificationPreferences.useQuery();

  const updatePrefs = trpc.user.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    if (notificationPrefs) {
      setPreferences({
        billingEmail: notificationPrefs.billingEmail ?? true,
        billingPanel: notificationPrefs.billingPanel ?? true,
        projectsEmail: notificationPrefs.projectsEmail ?? true,
        projectsPanel: notificationPrefs.projectsPanel ?? true,
        supportEmail: notificationPrefs.supportEmail ?? true,
        supportPanel: notificationPrefs.supportPanel ?? true,
        updatesEmail: notificationPrefs.updatesEmail ?? true,
        updatesPanel: notificationPrefs.updatesPanel ?? true,
        marketingEmail: notificationPrefs.marketingEmail ?? false,
        marketingPanel: notificationPrefs.marketingPanel ?? false,
      });
    }
  }, [notificationPrefs]);

  const handleToggle = (key: string) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    updatePrefs.mutate({ [key]: newPrefs[key] });
  };

  const handleEnableAll = () => {
    const allEnabled: Record<string, boolean> = {};
    notificationCategories.forEach((cat) => {
      allEnabled[cat.emailKey] = true;
      allEnabled[cat.panelKey] = true;
    });
    setPreferences(allEnabled);
    updatePrefs.mutate(allEnabled);
  };

  const handleDisableAll = () => {
    const allDisabled: Record<string, boolean> = {};
    notificationCategories.forEach((cat) => {
      allDisabled[cat.emailKey] = false;
      allDisabled[cat.panelKey] = false;
    });
    setPreferences(allDisabled);
    updatePrefs.mutate(allDisabled);
  };

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

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <button
                onClick={handleEnableAll}
                className="w-full px-3 py-2 text-sm text-left bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                ✓ Tümünü Aç
              </button>
              <button
                onClick={handleDisableAll}
                className="w-full px-3 py-2 text-sm text-left bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                ✗ Tümünü Kapat
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
              <p className="text-slate-500 mt-2">Yükleniyor...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        Bildirim Tercihleri
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Hangi bildirimleri almak istediğinizi seçin.
                      </p>
                    </div>
                  </div>
                  {saved && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Kaydedildi
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Categories */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="col-span-6">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</span>
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Mail className="h-4 w-4" />
                      E-posta
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Bell className="h-4 w-4" />
                      Panel
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notificationCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                        <div className="col-span-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                              <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {category.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <button
                            onClick={() => handleToggle(category.emailKey)}
                            disabled={updatePrefs.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[category.emailKey]
                                ? "bg-blue-600"
                                : "bg-slate-200 dark:bg-slate-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[category.emailKey] ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <button
                            onClick={() => handleToggle(category.panelKey)}
                            disabled={updatePrefs.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[category.panelKey]
                                ? "bg-blue-600"
                                : "bg-slate-200 dark:bg-slate-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[category.panelKey] ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">E-posta Bildirimleri Hakkında</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Güvenlik ile ilgili kritik bildirimler (şifre değişikliği, yeni oturum açma vb.) her zaman e-posta ile gönderilir ve devre dışı bırakılamaz.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

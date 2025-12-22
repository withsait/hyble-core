// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Shield, Bell, Trash2, Loader2, CheckCircle, Camera, Globe, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

const settingsNav = [
  { name: "Profil", href: "/settings", icon: User },
  { name: "Güvenlik", href: "/settings/security", icon: Shield },
  { name: "Bildirimler", href: "/settings/notifications", icon: Bell },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [currency, setCurrency] = useState<"EUR" | "USD" | "TRY" | "GBP">("EUR");
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const requestDeletion = trpc.user.requestAccountDeletion.useMutation();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.profile?.firstName || "");
      setLastName(profile.profile?.lastName || "");
      setLanguage(profile.profile?.language || "tr");
      setCurrency(profile.profile?.currency || "EUR");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      language,
      currency,
    });
  };

  const handleDeleteAccount = () => {
    if (confirm("Hesabınızı silmek istediğinizden emin misiniz? Bu işlem 14 gün içinde geri alınabilir.")) {
      requestDeletion.mutate({});
    }
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

          {/* Account Info Card */}
          {profile && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  {profile.image ? (
                    <img src={profile.image} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profile.name || "Kullanıcı"}
                  </p>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500">
                  Üyelik: {new Date(profile.createdAt).toLocaleDateString("tr-TR")}
                </p>
                <p className="text-xs text-slate-500">
                  Durum: <span className="text-green-600">{profile.status === "ACTIVE" ? "Aktif" : profile.status}</span>
                </p>
              </div>
            </div>
          )}
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
              {/* Profile Form */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                    Profil Bilgileri
                  </h2>
                  {saved && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Kaydedildi
                    </span>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Ad
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Soyad
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      E-posta adresinizi değiştirmek için destek ile iletişime geçin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Globe className="h-4 w-4 inline mr-1" />
                        Dil
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "tr" | "en")}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Para Birimi
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as "EUR" | "USD" | "TRY" | "GBP")}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="TRY">TRY (₺)</option>
                      </select>
                    </div>
                  </div>

                  {updateProfile.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {updateProfile.error.message || "Bir hata oluştu."}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        "Kaydet"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Connected Accounts */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Bağlı Hesaplar
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Google</p>
                        <p className="text-xs text-slate-500">OAuth ile giriş</p>
                      </div>
                    </div>
                    <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      Bağlantıyı Kes
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
                <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                  Tehlikeli Bölge
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Hesabınızı silmek için aşağıdaki butona tıklayın. Bu işlem 14 gün içinde geri alınabilir.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={requestDeletion.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {requestDeletion.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Hesabı Sil
                </button>
                {requestDeletion.isSuccess && (
                  <p className="mt-2 text-sm text-amber-600">
                    Hesap silme talebi alındı. 14 gün içinde geri alabilirsiniz.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

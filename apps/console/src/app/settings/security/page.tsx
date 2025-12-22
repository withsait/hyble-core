// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User, Shield, Bell, Key, Smartphone, Monitor, Loader2,
  AlertTriangle, CheckCircle, XCircle, RefreshCw, Clock,
  MapPin, Globe, LogOut, Trash2
} from "lucide-react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const settingsNav = [
  { name: "Profil", href: "/settings", icon: User },
  { name: "Güvenlik", href: "/settings/security", icon: Shield },
  { name: "Bildirimler", href: "/settings/notifications", icon: Bell },
];

export default function SecuritySettingsPage() {
  const pathname = usePathname();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  // tRPC queries
  const { data: overview, isLoading: overviewLoading } = trpc.security.getSecurityOverview.useQuery();
  const { data: twoFAStatus } = trpc.security.get2FAStatus.useQuery();
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = trpc.security.getSessions.useQuery();
  const { data: activityLog, isLoading: activityLoading } = trpc.security.getActivityLog.useQuery({ limit: 10 });

  const revokeSession = trpc.security.revokeSession.useMutation({
    onSuccess: () => refetchSessions(),
  });

  const revokeAllSessions = trpc.security.revokeAllSessions.useMutation({
    onSuccess: () => refetchSessions(),
  });

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setPasswordChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordChanged(false), 5000);
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }
    changePassword.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleRevokeAllSessions = () => {
    if (confirm("Tüm diğer oturumları sonlandırmak istediğinizden emin misiniz?")) {
      revokeAllSessions.mutate({});
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Güçlü";
    if (score >= 60) return "Orta";
    return "Zayıf";
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

          {/* Security Score Card */}
          {overview && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">Güvenlik Skoru</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-24 h-24">
                    <circle
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className={getScoreColor(overview.score)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                      strokeDasharray={`${(overview.score / 100) * 251.2} 251.2`}
                      transform="rotate(-90 48 48)"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getScoreColor(overview.score)}`}>
                    {overview.score}
                  </span>
                </div>
              </div>
              <p className={`text-center mt-2 font-medium ${getScoreColor(overview.score)}`}>
                {getScoreLabel(overview.score)}
              </p>
              {overview.recommendations.length > 0 && (
                <ul className="mt-3 text-xs text-slate-500 space-y-1">
                  {overview.recommendations.slice(0, 2).map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Password Change */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  Şifre Değiştir
                </h2>
              </div>
              {passwordChanged && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Değiştirildi
                </span>
              )}
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-slate-500">En az 8 karakter</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Şifreler eşleşmiyor</p>
                )}
              </div>
              {changePassword.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {changePassword.error.message || "Bir hata oluştu."}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changePassword.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
              <div className="flex items-center gap-3">
                {twoFAStatus?.enabled ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      Aktif
                    </span>
                    <button className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                      Devre Dışı Bırak
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Etkinleştir
                  </button>
                )}
              </div>
            </div>
            {twoFAStatus?.enabled && twoFAStatus.backupCodesRemaining !== undefined && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Kalan yedek kod sayısı: <strong>{twoFAStatus.backupCodesRemaining}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  Aktif Oturumlar
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetchSessions()}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${sessionsLoading ? "animate-spin" : ""}`} />
                </button>
                {sessions && sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    disabled={revokeAllSessions.isPending}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Tümünü Sonlandır
                  </button>
                )}
              </div>
            </div>

            {sessionsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <p className="text-center text-slate-500 py-4">Aktif oturum bulunamadı.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Monitor className="h-8 w-8 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {session.deviceName || session.browser || "Bilinmeyen Cihaz"} {session.os && `- ${session.os}`}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ipAddress}
                            </span>
                          )}
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.lastActiveAt), "d MMM HH:mm", { locale: tr })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {session.isCurrent ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                        Bu cihaz
                      </span>
                    ) : (
                      <button
                        onClick={() => revokeSession.mutate({ sessionId: session.id })}
                        disabled={revokeSession.isPending}
                        className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <LogOut className="h-3 w-3" />
                        Sonlandır
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Son Güvenlik Aktiviteleri
              </h2>
            </div>
            {activityLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              </div>
            ) : !activityLog?.logs || activityLog.logs.length === 0 ? (
              <p className="text-center text-slate-500 py-4">Aktivite bulunamadı.</p>
            ) : (
              <div className="space-y-3">
                {activityLog.logs.slice(0, 5).map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${
                        log.status === "SUCCESS"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {log.status === "SUCCESS" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.ipAddress && `${log.ipAddress} • `}
                          {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

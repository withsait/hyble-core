"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Trash2,
  LogOut,
  Shield,
  Clock,
} from "lucide-react";

interface UserSession {
  id: string;
  sessionToken: string;
  deviceName: string | null;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  location: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case "DESKTOP":
      return Monitor;
    case "MOBILE":
      return Smartphone;
    case "TABLET":
      return Tablet;
    default:
      return Globe;
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Az önce";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

export default function SessionsPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        setError("Oturumlar yüklenemedi");
      }
    } catch {
      setError("Oturumlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setProcessing(sessionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Oturum sonlandırılamadı");
      }

      setSuccess("Oturum başarıyla sonlandırıldı");
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setProcessing(null);
    }
  };

  const revokeAllSessions = async () => {
    setProcessing("all");
    setError(null);
    setSuccess(null);
    setShowRevokeAllConfirm(false);

    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Oturumlar sonlandırılamadı");
      }

      const data = await response.json();
      setSuccess(`${data.revokedCount} oturum başarıyla sonlandırıldı`);
      // Keep only current session
      setSessions(sessions.filter((s) => s.isCurrent));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard&apos;a Dön
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Aktif Oturumlar</h1>
            <p className="text-slate-400">
              Hesabınıza bağlı tüm cihazları yönetin
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Current Session */}
        {sessions.find((s) => s.isCurrent) && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 mb-3">
              Bu Cihaz
            </h2>
            {sessions
              .filter((s) => s.isCurrent)
              .map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <div
                    key={session.id}
                    className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <DeviceIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium truncate">
                            {session.deviceName ||
                              `${session.os || "Bilinmeyen"} ${session.deviceType === "DESKTOP" ? "Bilgisayar" : "Cihaz"}`}
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            Bu cihaz
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {session.browser}
                          {session.browserVersion &&
                            ` ${session.browserVersion}`}{" "}
                          • {session.os}
                          {session.osVersion && ` ${session.osVersion}`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.ipAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(session.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-400">
                Diğer Oturumlar ({otherSessions.length})
              </h2>
              <button
                onClick={() => setShowRevokeAllConfirm(true)}
                disabled={processing === "all"}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
              >
                {processing === "all" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Tümünü Sonlandır
              </button>
            </div>

            <div className="space-y-3">
              {otherSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                const isProcessing = processing === session.id;

                return (
                  <div
                    key={session.id}
                    className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                        <DeviceIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate mb-1">
                          {session.deviceName ||
                            `${session.os || "Bilinmeyen"} ${session.deviceType === "DESKTOP" ? "Bilgisayar" : "Cihaz"}`}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {session.browser}
                          {session.browserVersion &&
                            ` ${session.browserVersion}`}{" "}
                          • {session.os}
                          {session.osVersion && ` ${session.osVersion}`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.ipAddress}
                            </span>
                          )}
                          {session.location && (
                            <span>{session.location}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(session.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => revokeSession(session.id)}
                        disabled={isProcessing}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Oturumu Sonlandır"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">
              Aktif oturum bulunamadı
            </h3>
            <p className="text-slate-400 text-sm">
              Oturum bilgileri henüz kaydedilmemiş.
            </p>
          </div>
        )}

        {/* No Other Sessions */}
        {sessions.length > 0 && otherSessions.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">
              Sadece bu cihazda oturum açık
            </h3>
            <p className="text-slate-400 text-sm">
              Başka cihazlarda aktif oturum bulunmuyor.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-slate-900/30 border border-white/5 rounded-xl">
          <p className="text-slate-500 text-sm">
            Tanımadığınız bir oturum görürseniz, hemen şifrenizi değiştirin ve
            tüm oturumları sonlandırın.
          </p>
        </div>
      </main>

      {/* Revoke All Confirmation Modal */}
      {showRevokeAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Tüm Oturumları Sonlandır?
              </h3>
            </div>

            <p className="text-slate-400 mb-6">
              Bu cihaz hariç tüm oturumlar sonlandırılacak. Diğer cihazlarda
              tekrar giriş yapmanız gerekecek.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRevokeAllConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={revokeAllSessions}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
              >
                Tümünü Sonlandır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

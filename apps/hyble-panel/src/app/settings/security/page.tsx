"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  Monitor,
} from "lucide-react";

interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  enabledAt: string | null;
  backupCodesRemaining: number;
}

interface SetupData {
  secret: string;
  qrCode: string;
  otpauth: string;
}

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/users/2fa/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch {
      setError("Failed to load 2FA status");
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/users/2fa/setup");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSetupData(data);
      setShowSetup(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start setup");
    } finally {
      setProcessing(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/users/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setBackupCodes(data.backupCodes);
      setShowSetup(false);
      setShowBackupCodes(true);
      setSuccess("2FA enabled successfully!");
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setProcessing(false);
    }
  };

  const disable2FA = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/users/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setShowDisable(false);
      setPassword("");
      setSuccess("2FA disabled successfully");
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setProcessing(false);
    }
  };

  const regenerateBackupCodes = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/users/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setPassword("");
      setSuccess("Backup codes regenerated!");
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate codes");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, type: "secret" | "codes") => {
    await navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-white">Güvenlik Ayarları</h1>
            <p className="text-slate-400">Hesap güvenliğini yönet</p>
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

        {/* 2FA Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  İki Faktörlü Doğrulama (2FA)
                </h2>
                <p className="text-slate-400 text-sm">
                  Authenticator uygulaması ile ekstra güvenlik
                </p>
              </div>
            </div>
            {status?.enabled ? (
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                Aktif
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full text-slate-400 text-sm">
                Devre Dışı
              </span>
            )}
          </div>

          {status?.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Kurtarma Kodları</p>
                    <p className="text-slate-500 text-xs">
                      {status.backupCodesRemaining} kod kaldı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDisable(false);
                    setError(null);
                    setPassword("");
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Yenile
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisable(true);
                    setError(null);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors"
                >
                  2FA&apos;yı Devre Dışı Bırak
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startSetup}
              disabled={processing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              2FA&apos;yı Etkinleştir
            </button>
          )}
        </div>

        {/* Password Change Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Key className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Şifre</h2>
              <p className="text-slate-400 text-sm">Hesap şifreni değiştir</p>
            </div>
          </div>
          <Link
            href="/settings/password"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Şifreyi Değiştir
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* Sessions Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Aktif Oturumlar</h2>
              <p className="text-slate-400 text-sm">Bağlı cihazları yönet</p>
            </div>
          </div>
          <Link
            href="/settings/sessions"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Oturumları Görüntüle
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </main>

      {/* Setup Modal */}
      {showSetup && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">2FA Kurulumu</h3>
              <button
                onClick={() => setShowSetup(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div>
                <p className="text-slate-300 text-sm mb-4">
                  1. Authenticator uygulamanızda (Google Authenticator, Authy, vb.)
                  aşağıdaki QR kodu tarayın:
                </p>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* Manual Entry */}
              <div>
                <p className="text-slate-400 text-sm mb-2">
                  Veya bu kodu manuel olarak girin:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-blue-400 font-mono text-sm break-all">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.secret, "secret")}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {copiedSecret ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <p className="text-slate-300 text-sm mb-2">
                  2. Uygulamada görünen 6 haneli kodu girin:
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-widest font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={verifySetup}
                disabled={processing || verificationCode.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Doğrula ve Etkinleştir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">2FA&apos;yı Devre Dışı Bırak</h3>
              <button
                onClick={() => {
                  setShowDisable(false);
                  setPassword("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-sm">
                  2FA&apos;yı devre dışı bırakmak hesap güvenliğinizi azaltır.
                  Emin misiniz?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Şifrenizi doğrulayın
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreniz"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisable(false);
                    setPassword("");
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={disable2FA}
                  disabled={processing || !password}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Devre Dışı Bırak"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Kurtarma Kodları</h3>
              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setBackupCodes([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-sm">
                  Bu kodları güvenli bir yere kaydedin. Her kod sadece bir kez kullanılabilir.
                  Telefonunuza erişiminizi kaybederseniz bu kodları kullanabilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-800 rounded-xl">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="text-center py-2 px-3 bg-slate-900 rounded-lg text-blue-400 font-mono text-sm"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(backupCodes.join("\n"), "codes")}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedCodes ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Kodları Kopyala
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setBackupCodes([]);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
              >
                Kaydettim, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

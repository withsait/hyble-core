"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2, Key, ArrowLeft } from "lucide-react";

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get credentials from sessionStorage
    const storedEmail = sessionStorage.getItem("2fa_email");
    const storedPassword = sessionStorage.getItem("2fa_password");

    if (!storedEmail || !storedPassword) {
      router.push("/login");
      return;
    }

    setEmail(storedEmail);
    setPassword(storedPassword);
    setIsReady(true);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Oturum bilgileri bulunamadı");
      setLoading(false);
      return;
    }

    try {
      // Use NextAuth signIn with 2FA code
      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode: code.trim(),
        isBackupCode: useBackupCode ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("Invalid 2FA") || result.error.includes("invalid_2fa")) {
          setError("Geçersiz doğrulama kodu");
        } else {
          setError("Doğrulama başarısız. Lütfen tekrar deneyin.");
        }
        setLoading(false);
        return;
      }

      // Success - clear sessionStorage
      sessionStorage.removeItem("2fa_email");
      sessionStorage.removeItem("2fa_password");

      // Create session record for tracking
      try {
        await fetch("/api/sessions", { method: "POST" });
      } catch {
        // Ignore session tracking errors
      }

      // Use window.location for full page reload
      window.location.href = callbackUrl;
    } catch (err) {
      console.error("2FA error:", err);
      setError("Doğrulama sırasında bir hata oluştu");
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 dark:via-slate-950/50 to-slate-50 dark:to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-2xl">Hyble ID</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              İki Faktörlü Doğrulama
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {useBackupCode
                ? "Kurtarma kodunuzu girin"
                : "Authenticator uygulamanızdaki 6 haneli kodu girin"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(
                    useBackupCode
                      ? e.target.value.toUpperCase().slice(0, 8)
                      : e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                className="w-full px-4 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-center text-2xl tracking-widest font-mono placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                (useBackupCode ? code.length !== 8 : code.length !== 6)
              }
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                "Doğrula"
              )}
            </button>
          </form>

          {/* Toggle backup code */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
                setError(null);
              }}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
            >
              <Key className="w-4 h-4" />
              {useBackupCode
                ? "Authenticator kodunu kullan"
                : "Kurtarma kodu kullan"}
            </button>
          </div>

          {/* Back to login */}
          <div className="mt-4 text-center">
            <Link
              href="/login"
              onClick={() => {
                sessionStorage.removeItem("2fa_email");
                sessionStorage.removeItem("2fa_password");
              }}
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}

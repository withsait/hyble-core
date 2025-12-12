"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bot, Lock, Mail, ArrowRight, ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Giriş başarısız. Bilgileri kontrol et.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Bir hata oluştu.");
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFBFC] dark:bg-[#061020] relative overflow-hidden px-4 transition-colors duration-300">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern bg-[size:40px_40px] opacity-30 dark:opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

      {/* Theme Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-[#0D1E36]/80 backdrop-blur-sm border border-gray-200 dark:border-[#1A3050]">
          {mounted && themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`p-2 rounded-full transition-all touch-target ${
                theme === option.value
                  ? "bg-primary text-black"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-label={option.value}
            >
              <option.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Back to Home - Top Left */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/80 dark:bg-[#0D1E36]/80 backdrop-blur-sm border border-gray-200 dark:border-[#1A3050] text-gray-600 dark:text-gray-400 hover:text-primary transition-colors touch-target text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Ana Sayfa</span>
      </Link>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-white/90 dark:bg-[#0D1E36]/90 backdrop-blur-xl border border-gray-200 dark:border-[#1A3050] rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-gray-200 dark:border-white/10 text-primary">
            <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Hyble Core</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">Yönetim paneline erişim için kimlik doğrulama gerekli.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">E-POSTA</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                placeholder="admin@hyble.co"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">ŞİFRE</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target text-sm sm:text-base"
          >
            {loading ? "Doğrulanıyor..." : "Sisteme Giriş Yap"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center gap-1 touch-target py-2">
            <ArrowLeft className="w-3 h-3" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}

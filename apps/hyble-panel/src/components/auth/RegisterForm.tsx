"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { TurnstileWidget } from "./TurnstileWidget";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      router.push("/login?registered=true");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const calculateStrength = (pass: string): number => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;
    return Math.min(score, 100);
  };

  const strength = calculateStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (!acceptTerms) {
      setError("Kullanım koşullarını kabul etmelisiniz");
      return;
    }

    if (strength < 50) {
      setError("Lütfen daha güçlü bir şifre seçin");
      return;
    }

    registerMutation.mutate({
      name,
      email,
      password,
      turnstileToken: turnstileToken || undefined,
      platform: "HYBLE",
    });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
        Kayıt Ol
      </h2>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ad Soyad
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="En az 8 karakter"
            required
          />
          <PasswordStrengthMeter strength={strength} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Şifre Tekrar
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-start">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label
            htmlFor="acceptTerms"
            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
          >
            <Link href="/terms" className="text-blue-600 hover:underline">
              Kullanım Koşulları
            </Link>{" "}
            ve{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Gizlilik Politikası
            </Link>
            'nı kabul ediyorum
          </label>
        </div>

        <TurnstileWidget onVerify={setTurnstileToken} />

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}

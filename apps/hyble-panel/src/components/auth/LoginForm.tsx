"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { TurnstileWidget } from "./TurnstileWidget";
import { TwoFactorForm } from "./TwoFactorForm";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [pendingToken, setPendingToken] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.requires2FA && data.pendingToken) {
        setPendingToken(data.pendingToken);
        setShow2FA(true);
      } else if (data.sessionToken) {
        // Store session and redirect
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({
      email,
      password,
      rememberMe,
      turnstileToken: turnstileToken || undefined,
      platform: "HYBLE",
    });
  };

  const verify2FAMutation = trpc.auth.verify2FA.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (show2FA) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          İki Faktörlü Doğrulama
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400">
          Authenticator uygulamanızdaki 6 haneli kodu girin
        </p>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        <TwoFactorForm
          onSubmit={async (code) => {
            await verify2FAMutation.mutateAsync({ pendingToken, code });
          }}
          loading={verify2FAMutation.isPending}
          error={verify2FAMutation.error?.message}
        />
        <button
          type="button"
          onClick={() => setShow2FA(false)}
          className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
        Giriş Yap
      </h2>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
          />
          <div className="flex justify-end mt-1">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Şifremi unuttum?
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
          >
            Beni hatırla
          </label>
        </div>

        <TurnstileWidget onVerify={setTurnstileToken} />

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Hesabın yok mu?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}

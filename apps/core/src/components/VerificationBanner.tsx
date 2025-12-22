"use client";

import { useState } from "react";
import { AlertTriangle, Mail, X, Loader2 } from "lucide-react";

interface VerificationBannerProps {
  email: string;
}

export function VerificationBanner({ email }: VerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification email");
      }

      setMessage({
        type: "success",
        text: "Doğrulama emaili gönderildi! Lütfen gelen kutunuzu kontrol edin.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-500/30 dark:border-yellow-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-500/20 dark:bg-yellow-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-yellow-700 dark:text-yellow-500 font-semibold mb-1">
            Email Adresinizi Doğrulayın
          </h3>
          <p className="text-yellow-600 dark:text-yellow-500/80 text-sm mb-3">
            Hesabınızın tüm özelliklerine erişebilmek için <strong>{email}</strong> adresini doğrulamanız gerekiyor.
          </p>

          {message && (
            <div
              className={`text-sm mb-3 ${
                message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleResendEmail}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-white dark:text-slate-900 font-medium text-sm rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Doğrulama Emaili Gönder
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 text-yellow-600/60 dark:text-yellow-500/60 hover:text-yellow-700 dark:hover:text-yellow-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";
import { BackupCodesDisplay } from "@/components/auth/BackupCodesDisplay";
import { CheckCircle2, Copy } from "lucide-react";
import { useEffect } from "react";

interface Props {
  secret: string;
  qrCodeUrl: string;
  onVerify: (code: string) => Promise<{ backupCodes: string[] }>;
}

export function TwoFactorSetup({ secret, qrCodeUrl, onVerify }: Props) {
  const [step, setStep] = useState<"scan" | "verify" | "backup">("scan");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(qrCodeUrl, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [qrCodeUrl]);

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await onVerify(code);
      setBackupCodes(result.backupCodes);
      setStep("backup");
    } catch {
      setError("Doğrulama kodu hatalı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
  };

  if (step === "backup") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">2FA Başarıyla Aktifleştirildi</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hesabınız artık daha güvenli. Aşağıdaki yedek kodları saklamayı unutmayın.
          </p>
        </div>
        <BackupCodesDisplay codes={backupCodes} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 flex items-center justify-center w-fit mx-auto md:mx-0">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="2FA QR Code" className="w-40 h-40" />
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Kurulum Anahtarı
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={secret}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-white"
              />
              <button
                onClick={handleCopySecret}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              QR kodu tarayamıyorsanız bu anahtarı Authenticator uygulamanıza manuel olarak girebilirsiniz.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900 dark:text-white">Doğrulama Kodu</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Uygulamanızın ürettiği 6 haneli kodu girin.
            </p>
          </div>
          <TwoFactorForm onSubmit={handleVerify} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}

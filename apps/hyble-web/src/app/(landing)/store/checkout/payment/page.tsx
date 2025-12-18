"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@hyble/ui";
import { CreditCard, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Ödeme oturumu bulunamadı");
      setIsLoading(false);
      return;
    }

    // In production, this would:
    // 1. Load Stripe.js
    // 2. Create PaymentElement with the client secret
    // 3. Handle the payment confirmation

    // For now, simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ödeme Hatası
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <Link
            href="/store/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Sepete Dön
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Ödeme sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Kart Bilgileri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ödemeniz Stripe ile güvenle işlenir
          </p>
        </div>

        {/* Stripe Elements Placeholder */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Kart Numarası
            </label>
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400">•••• •••• •••• ••••</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Son Kullanma
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="text-slate-400">AA / YY</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                CVC
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="text-slate-400">•••</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Not:</strong> Bu sayfa Stripe Elements entegrasyonu için hazırlanmıştır.
            Gerçek ödeme işlemi için Stripe API anahtarları gereklidir.
          </p>
        </div>

        {/* Pay Button */}
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
        >
          <Lock className="w-5 h-5" />
          Ödemeyi Tamamla
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Stripe ile güvenli ödeme</span>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/store/checkout"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Fatura bilgilerine dön
          </Link>
        </div>
      </Card>

      {/* Payment Methods */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <img src="/images/visa.svg" alt="Visa" className="h-8 opacity-50" />
        <img src="/images/mastercard.svg" alt="Mastercard" className="h-8 opacity-50" />
        <img src="/images/amex.svg" alt="American Express" className="h-8 opacity-50" />
      </div>
    </div>
  );
}

function PaymentLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
      </div>
    </div>
  );
}

// This page handles Stripe payment
// In production, you would load Stripe.js and use Elements
export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<PaymentLoading />}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}

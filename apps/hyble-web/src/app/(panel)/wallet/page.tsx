"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  XCircle,
  Receipt,
  CreditCard,
  Gift,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

type TransactionType = "DEPOSIT" | "CHARGE" | "REFUND" | "ADJUSTMENT" | "BONUS";

const txTypeConfig: Record<TransactionType, { label: string; icon: typeof ArrowDownLeft; color: string }> = {
  DEPOSIT: { label: "Yükleme", icon: ArrowDownLeft, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  CHARGE: { label: "Harcama", icon: ArrowUpRight, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  REFUND: { label: "İade", icon: ArrowDownLeft, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  ADJUSTMENT: { label: "Düzeltme", icon: RefreshCw, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  BONUS: { label: "Bonus", icon: Gift, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
};

export default function WalletPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(50);

  // tRPC queries
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = trpc.wallet.getBalance.useQuery();
  const { data: txData, isLoading: txLoading, refetch: refetchTx } = trpc.wallet.getTransactions.useQuery({ limit: 20 });
  const { data: verifyData } = trpc.wallet.verifyDeposit.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId && success === "true" }
  );

  // Deposit mutation
  const depositMutation = trpc.wallet.createDepositSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleDeposit = () => {
    depositMutation.mutate({ amount: depositAmount });
  };

  const balance = balanceData?.mainBalance ?? 0;
  const transactions = txData?.transactions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Cüzdan
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Bakiyenizi yönetin ve işlem geçmişinizi görüntüleyin.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success === "true" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Ödeme Başarılı!</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Bakiyeniz güncellendi.
            </p>
          </div>
        </div>
      )}

      {cancelled === "true" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Ödeme İptal Edildi</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Ödeme işlemi iptal edildi.
            </p>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Mevcut Bakiye</p>
            {balanceLoading ? (
              <div className="h-10 w-32 bg-white/20 rounded animate-pulse mt-2" />
            ) : (
              <p className="text-4xl font-bold mt-2">€{balance.toFixed(2)}</p>
            )}
            {balanceData && (balanceData.bonusBalance > 0 || balanceData.promoBalance > 0) && (
              <div className="flex gap-4 mt-3 text-sm text-blue-100">
                {balanceData.bonusBalance > 0 && (
                  <span className="flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    €{balanceData.bonusBalance.toFixed(2)} bonus
                  </span>
                )}
                {balanceData.promoBalance > 0 && (
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    €{balanceData.promoBalance.toFixed(2)} promo
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Para Yükle
          </button>
          <button
            onClick={() => { refetchBalance(); refetchTx(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Yenile
          </button>
        </div>
      </div>

      {/* Quick Deposit Options */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Hızlı Yükleme
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setDepositAmount(amount);
                setShowDepositModal(true);
              }}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-white">€{amount}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Yükle</p>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            İşlem Geçmişi
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Tümünü Gör
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {txLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">Yükleniyor...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Henüz işlem yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              İlk para yüklemenizi yaparak başlayın.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {transactions.map((tx) => {
              const config = txTypeConfig[tx.type as TransactionType];
              const Icon = config?.icon || ArrowDownLeft;
              const isPositive = ["DEPOSIT", "REFUND", "BONUS", "ADJUSTMENT"].includes(tx.type);

              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config?.color || "bg-slate-100"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {tx.description || config?.label || tx.type}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : "-"}€{Math.abs(parseFloat(tx.amount)).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Para Yükle
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tutar (€)
                </label>
                <input
                  type="number"
                  min={5}
                  max={10000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Min: €5, Max: €10,000</p>
              </div>

              <div className="flex gap-2">
                {[25, 50, 100, 250].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      depositAmount === amount
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-500"
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Yüklenecek Tutar</span>
                  <span className="font-semibold text-slate-900 dark:text-white">€{depositAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending || depositAmount < 5}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {depositMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Ödemeye Geç
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Güvenli ödeme Stripe tarafından sağlanmaktadır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

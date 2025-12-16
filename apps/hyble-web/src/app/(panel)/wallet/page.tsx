"use client";

import { Wallet, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  // TODO: Fetch from tRPC
  const balance = "€124.50";
  const transactions: Array<{
    id: string;
    type: "deposit" | "charge";
    amount: string;
    description: string;
    date: string;
  }> = [];

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

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Mevcut Bakiye</p>
            <p className="text-4xl font-bold mt-2">{balance}</p>
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/wallet/deposit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Para Yükle
          </Link>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            İşlem Geçmişi
          </h2>
        </div>

        {transactions.length === 0 ? (
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
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === "deposit"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {tx.description}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    tx.type === "deposit"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

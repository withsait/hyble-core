"use client";

import { WalletCard, TransactionList, DepositModal, VoucherInput } from "@/components/wallet";
import { useState } from "react";
import { Button } from "@hyble/ui";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Cüzdan
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Bakiyenizi yönetin ve işlem geçmişinizi görüntüleyin
                </p>
              </div>
            </div>
            <Button onClick={() => setDepositModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Bakiye Yükle
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Wallet Cards */}
        <WalletCard />

        {/* Voucher Input */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Kupon Kodu Kullan
          </h2>
          <VoucherInput />
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            İşlem Geçmişi
          </h2>
          <TransactionList />
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}

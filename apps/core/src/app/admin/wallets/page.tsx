"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import {
  Wallet,
  Search,
  Plus,
  Minus,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminWalletsPage() {
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAction, setAdjustAction] = useState<"add" | "subtract">("add");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDescription, setAdjustDescription] = useState("");

  // tRPC queries
  const { data: walletsData, isLoading, refetch } = trpc.wallet.adminListWallets.useQuery({
    search: search || undefined,
    limit: 50,
  });

  const adjustBalance = trpc.wallet.adminAdjustBalance.useMutation({
    onSuccess: () => {
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustDescription("");
      setSelectedWallet(null);
      refetch();
    },
  });

  const handleAdjust = () => {
    if (!selectedWallet) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Gecerli bir tutar girin.");
      return;
    }
    adjustBalance.mutate({
      userId: selectedWallet,
      amount: adjustAction === "subtract" ? -amount : amount,
      description: adjustDescription || (adjustAction === "add" ? "Admin tarafindan eklendi" : "Admin tarafindan dusuldu"),
    });
  };

  const totalBalance = walletsData?.wallets?.reduce((sum, w) => {
    return sum + parseFloat(w.mainBalance || "0") + parseFloat(w.bonusBalance || "0");
  }, 0) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cuzdanlar</h1>
            <p className="text-slate-500">Tum kullanici cuzdanlarini yonetin</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Cuzdan</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {walletsData?.total || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Bakiye</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalBalance.toFixed(2)} EUR
          </p>
        </div>
        <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aktif Cuzdanlar</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {walletsData?.wallets?.filter((w) => parseFloat(w.mainBalance || "0") > 0).length || 0}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanici adi veya email ile ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Wallets List */}
      <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          </div>
        ) : !walletsData?.wallets?.length ? (
          <div className="p-12 text-center text-slate-500">
            Cuzdan bulunamadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-[#0d0d14]">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Kullanici
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Ana Bakiye
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Bonus
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Promo
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Toplam
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Islemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {walletsData.wallets.map((wallet) => {
                  const mainBalance = parseFloat(wallet.mainBalance || "0");
                  const bonusBalance = parseFloat(wallet.bonusBalance || "0");
                  const promoBalance = parseFloat(wallet.promoBalance || "0");
                  const total = mainBalance + bonusBalance + promoBalance;

                  return (
                    <tr key={wallet.id} className="hover:bg-slate-50 dark:hover:bg-[#0d0d14]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {wallet.user?.image ? (
                            <img
                              src={wallet.user.image}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <User className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {wallet.user?.name || "Isimsiz"}
                            </p>
                            <p className="text-sm text-slate-500">{wallet.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {mainBalance.toFixed(2)}
                        </span>
                        <span className="text-slate-400 ml-1">{wallet.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-600">
                          {bonusBalance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-purple-600">
                          {promoBalance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-blue-600">
                          {total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedWallet(wallet.userId);
                              setAdjustAction("add");
                              setShowAdjustModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Bakiye Ekle"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWallet(wallet.userId);
                              setAdjustAction("subtract");
                              setShowAdjustModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Bakiye Dus"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/users/${wallet.userId}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Kullaniciyi Gor"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#12121a] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Bakiye {adjustAction === "add" ? "Ekle" : "Dus"}
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustAction("add")}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    adjustAction === "add"
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Ekle
                </button>
                <button
                  onClick={() => setAdjustAction("subtract")}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    adjustAction === "subtract"
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  Dus
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tutar (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Aciklama
                </label>
                <input
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="Islem aciklamasi..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustAmount("");
                  setAdjustDescription("");
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Iptal
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjustBalance.isPending || !adjustAmount}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  adjustAction === "add"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {adjustBalance.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Uygula"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

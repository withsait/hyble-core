// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Wallet,
  CreditCard,
  HeadphonesIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Globe,
  ChevronRight,
  Loader2,
  Gift,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  // tRPC queries
  const { data: balanceData, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery();
  const { data: orgData, isLoading: orgLoading } = trpc.organization.list.useQuery();
  const { data: supportData, isLoading: supportLoading } = trpc.support.list.useQuery({ limit: 5 });
  const { data: txData, isLoading: txLoading } = trpc.wallet.getTransactions.useQuery({ limit: 5 });

  const balance = balanceData?.mainBalance ?? 0;
  const bonusBalance = balanceData?.bonusBalance ?? 0;
  const organizations = orgData ?? [];
  const tickets = supportData?.tickets ?? [];
  const transactions = txData?.transactions ?? [];

  const openTickets = tickets.filter((t: any) => t.status === "OPEN" || t.status === "AWAITING_REPLY" || t.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Hoş Geldiniz
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Hesabınızın genel durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <Link
          href="/websites/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Yeni Web Sitesi
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Cüzdan Bakiyesi</p>
              {balanceLoading ? (
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-1">€{balance.toFixed(2)}</p>
              )}
              {bonusBalance > 0 && (
                <p className="text-sm text-blue-100 mt-1 flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  +€{bonusBalance.toFixed(2)} bonus
                </p>
              )}
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <Link
            href="/wallet"
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white transition-colors"
          >
            Bakiye Yükle
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Websites Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Web Sitelerim</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +1 bu hafta
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <Link
            href="/websites"
            className="mt-4 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Web Sitelerini Gör
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Organizations Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Organizasyonlar</p>
              {orgLoading ? (
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {organizations.length}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {organizations.filter((o: any) => o.isOwner).length} sahip olduğunuz
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <Link
            href="/organizations"
            className="mt-4 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Organizasyonlar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Support Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Destek Talepleri</p>
              {supportLoading ? (
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {openTickets}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                açık talep
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <HeadphonesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <Link
            href="/support"
            className="mt-4 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Talepleri Gör
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Son İşlemler
            </h2>
            <Link
              href="/wallet"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Tümü
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {txLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Henüz işlem bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {transactions.slice(0, 4).map((tx: any) => {
                const isPositive = ["DEPOSIT", "REFUND", "BONUS", "ADJUSTMENT"].includes(tx.type);
                return (
                  <div key={tx.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {isPositive ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : "-"}€{Math.abs(parseFloat(tx.amount)).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Support Tickets */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Destek Talepleri
            </h2>
            <Link
              href="/support/new"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Yeni Talep
            </Link>
          </div>
          {supportLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Henüz destek talebi yok.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {tickets.slice(0, 4).map((ticket: any) => {
                const isOpen = ["OPEN", "IN_PROGRESS", "AWAITING_REPLY"].includes(ticket.status);
                return (
                  <Link
                    key={ticket.id}
                    href={`/support/${ticket.referenceNo}`}
                    className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOpen ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                        {isOpen ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ticket.referenceNo}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/websites/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni Web Sitesi</span>
          </Link>
          <Link
            href="/wallet"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Para Yükle</span>
          </Link>
          <Link
            href="/organizations/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Organizasyon</span>
          </Link>
          <Link
            href="/support/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HeadphonesIcon className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Destek Talebi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

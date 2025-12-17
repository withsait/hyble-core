// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Receipt,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  CreditCard,
  FileText,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  DRAFT: { label: "Taslak", color: "bg-slate-100 text-slate-700", icon: FileText },
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  PAID: { label: "Ödendi", color: "bg-green-100 text-green-700", icon: CheckCircle },
  OVERDUE: { label: "Gecikmiş", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  CANCELLED: { label: "İptal", color: "bg-slate-100 text-slate-500", icon: XCircle },
  REFUNDED: { label: "İade Edildi", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
};

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");

  // tRPC queries
  const { data: balanceData } = trpc.wallet.getBalance.useQuery();
  const { data: invoicesData, isLoading, refetch } = trpc.wallet.getInvoices.useQuery({
    limit: 20,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const invoices = invoicesData?.invoices ?? [];
  const balance = balanceData?.mainBalance ?? 0;

  // Calculate stats
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + parseFloat(i.total), 0);
  const pendingAmount = invoices.filter((i) => i.status === "PENDING").reduce((sum, i) => sum + parseFloat(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Faturalama
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Faturalarınızı ve ödeme geçmişinizi görüntüleyin.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Mevcut Bakiye</p>
          <p className="text-3xl font-bold mt-1">€{balance.toFixed(2)}</p>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white mt-2"
          >
            Bakiye Yükle
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Ödenen</p>
          <p className="text-3xl font-bold text-green-600 mt-1">€{totalPaid.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2">{invoices.filter((i) => i.status === "PAID").length} fatura</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Bekleyen Ödeme</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">€{pendingAmount.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2">{invoices.filter((i) => i.status === "PENDING").length} fatura</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500"
          }`}
        >
          Tümü
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key as InvoiceStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500"
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Faturalar
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">Yükleniyor...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Fatura bulunamadı
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Henüz bir faturanız bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {invoices.map((invoice) => {
              const config = statusConfig[invoice.status as InvoiceStatus];
              const StatusIcon = config?.icon || Receipt;

              return (
                <div
                  key={invoice.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config?.color || "bg-slate-100"}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config?.color || "bg-slate-100"}`}>
                          {config?.label || invoice.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: tr })}
                        </span>
                        {invoice.dueDate && invoice.status === "PENDING" && (
                          <span className="text-xs text-slate-500">
                            Vade: {format(new Date(invoice.dueDate), "d MMM", { locale: tr })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      €{parseFloat(invoice.total).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Eye className="h-4 w-4 text-slate-500" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Download className="h-4 w-4 text-slate-500" />
                      </button>
                      {invoice.status === "PENDING" && (
                        <button className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Öde
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Ödeme Yöntemleri
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Yeni Ekle
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
            <CreditCard className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">Cüzdan Bakiyesi</p>
            <p className="text-sm text-slate-500">Varsayılan ödeme yöntemi</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Aktif
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Ticket,
  Plus,
  Search,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "OPEN" | "AWAITING_REPLY" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED";

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "Açık", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  AWAITING_REPLY: { label: "Yanıt Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  IN_PROGRESS: { label: "İşlemde", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertCircle },
  ON_HOLD: { label: "Beklemede", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Clock },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CLOSED: { label: "Kapatıldı", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: CheckCircle },
};

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");

  // tRPC query
  const { data, isLoading, refetch } = trpc.support.list.useQuery({
    limit: 20,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const tickets = data?.tickets ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Destek
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Destek taleplerinizi görüntüleyin ve yönetin.
          </p>
        </div>
        <Link
          href="/support/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Yeni Talep
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Toplam</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {tickets.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Açık</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Yanıt Bekliyor</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {tickets.filter((t) => t.status === "AWAITING_REPLY").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Çözüldü</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setStatusFilter("OPEN")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "OPEN"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500"
          }`}
        >
          Açık
        </button>
        <button
          onClick={() => setStatusFilter("AWAITING_REPLY")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "AWAITING_REPLY"
              ? "bg-yellow-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-yellow-500"
          }`}
        >
          Yanıt Bekliyor
        </button>
        <button
          onClick={() => setStatusFilter("RESOLVED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "RESOLVED"
              ? "bg-green-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-500"
          }`}
        >
          Çözüldü
        </button>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">Yükleniyor...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Destek talebi yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Henüz bir destek talebi oluşturmadınız.
            </p>
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              İlk Talebinizi Oluşturun
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {tickets.map((ticket) => {
              const config = statusConfig[ticket.status as TicketStatus];
              const StatusIcon = config?.icon || Clock;

              return (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.referenceNo}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config?.color || "bg-slate-100"}`}>
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {ticket.referenceNo}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {ticket.subject}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config?.color || "bg-slate-100"}`}>
                          {config?.label || ticket.status}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MessageSquare className="h-3 w-3" />
                          {ticket._count?.messages ?? 0} mesaj
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(ticket.createdAt), "d MMM yyyy", { locale: tr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Yardıma mı ihtiyacınız var?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Teknik sorunlar, faturalama veya hesap sorularınız için destek ekibimiz size yardımcı olmaya hazır.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Yeni Talep
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Dokümantasyon
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  User,
  Loader2,
  Eye,
  MessageSquare,
  Calendar,
  CreditCard,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

type RefundStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED";

const statusConfig: Record<RefundStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  APPROVED: { label: "Onaylandı", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
  PROCESSING: { label: "İşleniyor", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: RefreshCw },
  COMPLETED: { label: "Tamamlandı", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  REJECTED: { label: "Reddedildi", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default function AdminRefundsPage() {
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // tRPC queries
  const { data: refundsData, isLoading, refetch } = trpc.billing.refund.adminList.useQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const { data: statsData } = trpc.billing.refund.adminStats.useQuery();

  // Mutations
  const approveRefund = trpc.billing.refund.approve.useMutation({
    onSuccess: () => {
      refetch();
      setShowDetailModal(false);
    },
  });

  const rejectRefund = trpc.billing.refund.reject.useMutation({
    onSuccess: () => {
      refetch();
      setShowDetailModal(false);
      setRejectionReason("");
    },
  });

  const refunds = refundsData?.refunds ?? [];

  const handleApprove = (id: string) => {
    if (confirm("Bu iade talebini onaylamak istediğinize emin misiniz?")) {
      approveRefund.mutate({ id });
    }
  };

  const handleReject = (id: string) => {
    if (!rejectionReason) {
      alert("Lütfen red sebebi girin.");
      return;
    }
    rejectRefund.mutate({ id, reason: rejectionReason });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <RefreshCw className="h-7 w-7 text-blue-600" />
            İade Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            İade taleplerini görüntüleyin ve işleyin
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Talep</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{statsData?.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bekleyen</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{statsData?.pending ?? 0}</p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Onaylanan</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{statsData?.approved ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tamamlanan</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statsData?.completed ?? 0}</p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam İade</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            €{(statsData?.totalAmount ?? 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Sipariş no veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RefundStatus | "ALL")}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ALL")}
        >
          Tümü
        </Button>
        <Button
          variant={statusFilter === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PENDING")}
          className={statusFilter === "PENDING" ? "bg-yellow-600" : ""}
        >
          <Clock className="h-3 w-3 mr-1" />
          Bekleyen ({statsData?.pending ?? 0})
        </Button>
        <Button
          variant={statusFilter === "APPROVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("APPROVED")}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Onaylanan
        </Button>
        <Button
          variant={statusFilter === "PROCESSING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PROCESSING")}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          İşleniyor
        </Button>
      </div>

      {/* Refunds Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Talep</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Müşteri</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Sipariş</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tutar</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Sebep</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tarih</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <RefreshCw className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 mt-2">İade talebi bulunamadı</p>
                  </td>
                </tr>
              ) : (
                refunds.map((refund: any) => {
                  const config = statusConfig[refund.status as RefundStatus] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={refund.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                          #{refund.refundNumber || refund.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {refund.user?.name || "İsimsiz"}
                            </p>
                            <p className="text-xs text-slate-500">{refund.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          #{refund.order?.orderNumber || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          €{parseFloat(refund.amount || "0").toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[150px]">
                          {refund.reason || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {format(new Date(refund.createdAt), "d MMM yyyy", { locale: tr })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {refund.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(refund.id)}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
                                title="Onayla"
                                disabled={approveRefund.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setShowDetailModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                                title="Reddet"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRefund(refund);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Detay"
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              İade Detayı
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Talep No</p>
                  <p className="font-mono font-medium">#{selectedRefund.refundNumber || selectedRefund.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tutar</p>
                  <p className="font-semibold text-lg">€{parseFloat(selectedRefund.amount || "0").toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Müşteri</p>
                <p className="font-medium">{selectedRefund.user?.name || "İsimsiz"}</p>
                <p className="text-sm text-slate-500">{selectedRefund.user?.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">İade Sebebi</p>
                <p className="text-slate-700 dark:text-slate-300">{selectedRefund.reason || "Belirtilmemiş"}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Durum</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedRefund.status as RefundStatus]?.color}`}>
                  {statusConfig[selectedRefund.status as RefundStatus]?.label}
                </span>
              </div>

              {selectedRefund.status === "PENDING" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Red Sebebi (opsiyonel)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="İade talebini reddetme sebebi..."
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 resize-none h-20"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRefund(null);
                  setRejectionReason("");
                }}
              >
                Kapat
              </Button>
              {selectedRefund.status === "PENDING" && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(selectedRefund.id)}
                    disabled={rejectRefund.isPending}
                  >
                    {rejectRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reddet"}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedRefund.id)}
                    disabled={approveRefund.isPending}
                  >
                    {approveRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Onayla"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

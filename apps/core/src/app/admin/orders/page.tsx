"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Package,
  Truck,
  Loader2,
  Filter,
  Calendar,
  User,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  PROCESSING: { label: "İşleniyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  COMPLETED: { label: "Tamamlandı", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  FAILED: { label: "Başarısız", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertTriangle },
  CANCELLED: { label: "İptal", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: XCircle },
  REFUNDED: { label: "İade Edildi", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: RefreshCw },
  PARTIALLY_REFUNDED: { label: "Kısmi İade", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: RefreshCw },
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all");

  // tRPC query for orders
  const { data: ordersData, isLoading, refetch } = trpc.order.adminList.useQuery({
    limit: 20,
    offset: (page - 1) * 20,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  // Stats query
  const { data: statsData } = trpc.order.adminStats.useQuery();

  const orders = ordersData?.orders ?? [];
  const total = ordersData?.total ?? 0;
  const hasMore = ordersData?.hasMore ?? false;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <ShoppingCart className="h-7 w-7 text-blue-600" />
            Sipariş Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Tüm siparişleri görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Sipariş</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{statsData?.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bekleyen</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{statsData?.pending ?? 0}</p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">İşleniyor</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{statsData?.processing ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tamamlanan</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statsData?.completed ?? 0}</p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu Ay Gelir</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            €{(statsData?.monthlyRevenue ?? 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Sipariş no, müşteri adı veya email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
            </select>
          </div>
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
        >
          <Clock className="h-3 w-3 mr-1" />
          Bekleyen
        </Button>
        <Button
          variant={statusFilter === "PROCESSING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PROCESSING")}
        >
          <Package className="h-3 w-3 mr-1" />
          İşleniyor
        </Button>
        <Button
          variant={statusFilter === "FAILED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("FAILED")}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Başarısız
        </Button>
        <Button
          variant={statusFilter === "COMPLETED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("COMPLETED")}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Tamamlanan
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Sipariş</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Müşteri</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Ürünler</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tutar</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tarih</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 mt-2">Sipariş bulunamadı</p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const config = statusConfig[order.status as OrderStatus] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs text-slate-500">{order.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {order.user?.name || "İsimsiz"}
                            </p>
                            <p className="text-xs text-slate-500">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-900 dark:text-white">
                          {order._count?.items || 0} ürün
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          €{parseFloat(order.total || "0").toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg inline-flex"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Toplam {total} sipariş
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

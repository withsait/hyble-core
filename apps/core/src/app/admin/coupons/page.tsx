"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Gift,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type CouponType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DEPLETED";

const typeConfig: Record<CouponType, { label: string; icon: typeof Percent }> = {
  PERCENTAGE: { label: "Yüzde", icon: Percent },
  FIXED: { label: "Sabit Tutar", icon: DollarSign },
  FREE_SHIPPING: { label: "Ücretsiz Kargo", icon: Gift },
};

const statusConfig: Record<CouponStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  INACTIVE: { label: "Devre Dışı", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  EXPIRED: { label: "Süresi Dolmuş", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  DEPLETED: { label: "Tükenmiş", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default function AdminCouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "PERCENTAGE" as CouponType,
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    userLimit: "",
    expiresAt: "",
    description: "",
  });

  // tRPC queries
  const { data: couponsData, isLoading, refetch } = trpc.billing.coupon.adminList.useQuery({
    search: searchTerm || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const { data: statsData } = trpc.billing.coupon.adminStats.useQuery();

  // Mutations
  const createCoupon = trpc.billing.coupon.adminCreate.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      resetForm();
      refetch();
    },
  });

  const toggleCoupon = trpc.billing.coupon.adminUpdateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteCoupon = trpc.voucher.adminDeleteCoupon.useMutation({
    onSuccess: () => refetch(),
  });

  const coupons = couponsData?.items ?? [];

  const resetForm = () => {
    setNewCoupon({
      code: "",
      type: "PERCENTAGE",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      userLimit: "",
      expiresAt: "",
      description: "",
    });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "HYBLE";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const handleCreate = () => {
    if (!newCoupon.code || !newCoupon.value) {
      alert("Kupon kodu ve değer zorunludur.");
      return;
    }

    createCoupon.mutate({
      code: newCoupon.code.toUpperCase(),
      type: newCoupon.type,
      value: parseFloat(newCoupon.value),
      minOrderAmount: newCoupon.minPurchase ? parseFloat(newCoupon.minPurchase) : undefined,
      maxDiscount: newCoupon.maxDiscount ? parseFloat(newCoupon.maxDiscount) : undefined,
      usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : undefined,
      usagePerUser: newCoupon.userLimit ? parseInt(newCoupon.userLimit) : undefined,
      expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt) : undefined,
      description: newCoupon.description || undefined,
    });
  };

  const handleToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    toggleCoupon.mutate({ id, status: newStatus as "ACTIVE" | "INACTIVE" });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`"${code}" kuponunu silmek istediğinize emin misiniz?`)) {
      deleteCoupon.mutate({ id });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <Ticket className="h-7 w-7 text-blue-600" />
            Kupon Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            İndirim kuponlarını oluşturun ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kupon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Kupon</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{statsData?.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statsData?.active ?? 0}</p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Kullanım</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{statsData?.totalUsage ?? 0}</p>
        </Card>
        <Card className="p-4 border-purple-200 dark:border-purple-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Toplam İndirim</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            €{(statsData?.totalDiscount ?? 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Kupon kodu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CouponStatus | "ALL")}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Coupons Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Kupon</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tür</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Değer</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Kullanım</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Son Tarih</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">İşlemler</th>
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
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Ticket className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 mt-2">Kupon bulunamadı</p>
                    <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Kuponu Oluştur
                    </Button>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon: any) => {
                  const typeConf = typeConfig[coupon.type as CouponType] || typeConfig.PERCENTAGE;
                  const TypeIcon = typeConf.icon;
                  const statusConf = statusConfig[coupon.status as CouponStatus] || statusConfig.ACTIVE;
                  return (
                    <tr key={coupon.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            title="Kopyala"
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{typeConf.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `€${coupon.value}`}
                        </p>
                        {coupon.minOrderAmount && (
                          <p className="text-xs text-slate-500">Min: €{coupon.minOrderAmount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">
                            {coupon.usedCount || 0}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {coupon.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(coupon.expiresAt), "d MMM yyyy", { locale: tr })}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(coupon.id, coupon.status)}
                            className={`p-2 rounded-lg ${
                              coupon.status === "ACTIVE"
                                ? "text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                                : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                            }`}
                            title={coupon.status === "ACTIVE" ? "Devre Dışı Bırak" : "Aktifleştir"}
                          >
                            {coupon.status === "ACTIVE" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Yeni Kupon Oluştur
            </h3>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kupon Kodu
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="HYBLE2024"
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={generateCode}>
                    Oluştur
                  </Button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  İndirim Türü
                </label>
                <div className="flex gap-2">
                  {Object.entries(typeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewCoupon({ ...newCoupon, type: key as CouponType })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          newCoupon.type === key
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {newCoupon.type === "PERCENTAGE" ? "İndirim Yüzdesi (%)" : "İndirim Tutarı (€)"}
                </label>
                <Input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                  placeholder={newCoupon.type === "PERCENTAGE" ? "10" : "25.00"}
                  min="0"
                  step={newCoupon.type === "PERCENTAGE" ? "1" : "0.01"}
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minimum Sepet Tutarı (€) - Opsiyonel
                </label>
                <Input
                  type="number"
                  value={newCoupon.minPurchase}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                  placeholder="50.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Discount */}
              {newCoupon.type === "PERCENTAGE" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Maksimum İndirim (€) - Opsiyonel
                  </label>
                  <Input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toplam Kullanım Limiti
                  </label>
                  <Input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kullanıcı Başı Limit
                  </label>
                  <Input
                    type="number"
                    value={newCoupon.userLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, userLimit: e.target.value })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Son Kullanım Tarihi - Opsiyonel
                </label>
                <Input
                  type="datetime-local"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Açıklama - Opsiyonel
                </label>
                <Input
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Yeni üye indirimi"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={createCoupon.isPending || !newCoupon.code || !newCoupon.value}
              >
                {createCoupon.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Oluştur"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

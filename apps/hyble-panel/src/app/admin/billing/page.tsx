// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  CreditCard,
  Search,
  Download,
  Eye,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  Loader2,
  Plus,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Tab = "invoices" | "transactions" | "subscriptions" | "wallets";
type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof Clock }> = {
  DRAFT: { label: "Taslak", color: "bg-slate-100 text-slate-700", icon: Clock },
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  PAID: { label: "Ödendi", color: "bg-green-100 text-green-700", icon: CheckCircle },
  OVERDUE: { label: "Gecikmiş", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  CANCELLED: { label: "İptal", color: "bg-slate-100 text-slate-500", icon: XCircle },
  REFUNDED: { label: "İade", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
};

const transactionTypeConfig: Record<string, { label: string; color: string }> = {
  DEPOSIT: { label: "Yükleme", color: "bg-blue-100 text-blue-700" },
  CHARGE: { label: "Ödeme", color: "bg-green-100 text-green-700" },
  REFUND: { label: "İade", color: "bg-red-100 text-red-700" },
  ADJUSTMENT: { label: "Düzeltme", color: "bg-orange-100 text-orange-700" },
  BONUS: { label: "Bonus", color: "bg-yellow-100 text-yellow-700" },
};

const subscriptionStatusConfig: Record<string, { label: string; color: string }> = {
  TRIAL: { label: "Deneme", color: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700" },
  PAST_DUE: { label: "Gecikmiş", color: "bg-red-100 text-red-700" },
  PAUSED: { label: "Duraklatılmış", color: "bg-yellow-100 text-yellow-700" },
  CANCELLED: { label: "İptal", color: "bg-slate-100 text-slate-600" },
  EXPIRED: { label: "Süresi Dolmuş", color: "bg-slate-100 text-slate-500" },
};

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // tRPC queries
  const { data: invoiceStats, isLoading: statsLoading } = trpc.invoice.adminStats.useQuery({ period: "month" });

  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = trpc.invoice.adminList.useQuery({
    page,
    limit: 20,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = trpc.subscription.adminList.useQuery({
    page: 1,
    limit: 50,
  });

  // Mutations
  const updateInvoiceStatus = trpc.invoice.adminUpdateStatus.useMutation({
    onSuccess: () => refetchInvoices(),
  });

  const tabs = [
    { id: "invoices" as Tab, label: "Faturalar", icon: <Receipt className="h-4 w-4" /> },
    { id: "transactions" as Tab, label: "İşlemler", icon: <CreditCard className="h-4 w-4" /> },
    { id: "subscriptions" as Tab, label: "Abonelikler", icon: <RefreshCw className="h-4 w-4" /> },
    { id: "wallets" as Tab, label: "Cüzdanlar", icon: <Wallet className="h-4 w-4" /> },
  ];

  const handleMarkAsPaid = (invoiceId: string) => {
    if (confirm("Bu faturayı ödendi olarak işaretlemek istiyor musunuz?")) {
      updateInvoiceStatus.mutate({ id: invoiceId, status: "PAID" });
    }
  };

  const handleCancelInvoice = (invoiceId: string) => {
    if (confirm("Bu faturayı iptal etmek istiyor musunuz?")) {
      updateInvoiceStatus.mutate({ id: invoiceId, status: "CANCELLED" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-primary" />
            Faturalama
          </h1>
          <p className="text-muted-foreground mt-1">
            Faturalar, ödemeler ve abonelikleri yönetin
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Rapor İndir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded w-20 mb-2" />
                    <div className="h-6 bg-muted rounded w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4 border-green-200">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bu Ay Gelir</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{parseFloat(invoiceStats?.totalRevenue || "0").toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    €{parseFloat(invoiceStats?.pendingRevenue || "0").toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Gecikmiş</p>
                  <p className="text-2xl font-bold text-red-600">
                    {invoiceStats?.overdueInvoices || 0} fatura
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tahsilat Oranı</p>
                  <p className="text-2xl font-bold">%{invoiceStats?.collectionRate || 0}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <>
          <Card className="p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Fatura no ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "ALL")}
                className="px-3 py-2 border rounded-lg bg-background text-sm"
              >
                <option value="ALL">Tüm Durumlar</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <Button onClick={() => refetchInvoices()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </Card>

          <Card>
            {invoicesLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Yükleniyor...</p>
              </div>
            ) : invoicesData?.invoices.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Fatura bulunamadı</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 text-sm font-semibold">Fatura No</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı ID</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Tutar</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Vade</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Oluşturulma</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesData?.invoices.map((invoice: any) => {
                        const config = statusConfig[invoice.status as InvoiceStatus];
                        const StatusIcon = config.icon;
                        return (
                          <tr key={invoice.id} className="border-b hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-mono text-muted-foreground">{invoice.userId.slice(0, 8)}...</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">€{parseFloat(invoice.total).toFixed(2)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${config.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {config.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {invoice.dueDate ? format(new Date(invoice.dueDate), "d MMM yyyy", { locale: tr }) : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: tr })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                {invoice.status === "PENDING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMarkAsPaid(invoice.id)}
                                      title="Ödendi İşaretle"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCancelInvoice(invoice.id)}
                                      title="İptal Et"
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {invoicesData && invoicesData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Toplam {invoicesData.total} fatura
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
                        disabled={page >= invoicesData.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Sonraki
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <Card className="p-6">
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">İşlem Geçmişi</h3>
            <p className="text-sm text-muted-foreground">
              İşlem geçmişi modülü hazırlanıyor. Cüzdan işlemleri için Cüzdanlar sekmesini kullanın.
            </p>
          </div>
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <Card>
          {subscriptionsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Yükleniyor...</p>
            </div>
          ) : !subscriptionsData?.subscriptions || subscriptionsData.subscriptions.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aktif abonelik bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Ürün</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Periyot</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Sonraki Fatura</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionsData.subscriptions.map((sub: any) => {
                    const config = subscriptionStatusConfig[sub.status] || { label: sub.status, color: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={sub.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="text-sm font-mono text-muted-foreground">{sub.userId.slice(0, 8)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{sub.productName}</p>
                          {sub.variantName && (
                            <p className="text-xs text-muted-foreground">{sub.variantName}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {sub.billingPeriod === "monthly" ? "Aylık" :
                           sub.billingPeriod === "quarterly" ? "3 Aylık" :
                           sub.billingPeriod === "annually" ? "Yıllık" : sub.billingPeriod}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "d MMM yyyy", { locale: tr }) : "-"}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          €{parseFloat(sub.price).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Wallets Tab */}
      {activeTab === "wallets" && (
        <Card className="p-6">
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Cüzdan Yönetimi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kullanıcı cüzdanlarını yönetmek için kullanıcı detay sayfasını kullanın.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/admin/users"}>
              Kullanıcılar Sayfasına Git
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

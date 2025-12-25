"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Receipt,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  user: { name: string | null; email: string };
  amount: number;
  currency: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  items: { description: string; quantity: number; unitPrice: number }[];
}

interface Transaction {
  id: string;
  type: "PAYMENT" | "REFUND" | "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  provider: string;
  createdAt: Date;
  user: { name: string | null; email: string };
}

interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overdueInvoices: number;
  activeSubscriptions: number;
  churnRate: number;
}

const statusIcons = {
  DRAFT: Clock,
  PENDING: Clock,
  PAID: CheckCircle,
  OVERDUE: AlertTriangle,
  CANCELLED: XCircle,
  REFUNDED: RefreshCw,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

const statusColors = {
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  PENDING: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  PAID: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  REFUNDED: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  FAILED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export function BillingManagement() {
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "transactions" | "subscriptions">("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab, page, searchQuery, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const response = await fetch("/api/trpc/billing.getStats");
        const data = await response.json();
        if (data.result?.data) {
          setStats(data.result.data);
        }
      } else if (activeTab === "invoices") {
        const params = { page, search: searchQuery, status: statusFilter };
        const response = await fetch(`/api/trpc/invoice.list?input=${encodeURIComponent(JSON.stringify({ json: params }))}`);
        const data = await response.json();
        if (data.result?.data) {
          setInvoices(data.result.data.invoices);
        }
      } else if (activeTab === "transactions") {
        const params = { page, search: searchQuery };
        const response = await fetch(`/api/trpc/billing.listTransactions?input=${encodeURIComponent(JSON.stringify({ json: params }))}`);
        const data = await response.json();
        if (data.result?.data) {
          setTransactions(data.result.data.transactions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const exportData = (format: "csv" | "xlsx") => {
    window.open(`/api/admin/billing/export?format=${format}&type=${activeTab}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Fatura & Ödeme Yönetimi
              </h3>
              <p className="text-sm text-slate-500">
                Tüm finansal işlemleri yönetin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData("xlsx")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { key: "overview", label: "Genel Bakış", icon: TrendingUp },
            { key: "invoices", label: "Faturalar", icon: Receipt },
            { key: "transactions", label: "İşlemler", icon: CreditCard },
            { key: "subscriptions", label: "Abonelikler", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Toplam Gelir</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-slate-500">geçen aya göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Aylık Gelir</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">{stats?.activeSubscriptions || 0} aktif abonelik</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Bekleyen Ödemeler</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats?.pendingPayments || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="w-4 h-4" />
              {stats?.overdueInvoices || 0} vadesi geçmiş fatura
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-3 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Son İşlemler
            </h4>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => {
                const StatusIcon = statusIcons[transaction.status];
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "PAYMENT" ? "bg-green-100 dark:bg-green-900/30" :
                        transaction.type === "REFUND" ? "bg-red-100 dark:bg-red-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          transaction.type === "PAYMENT" ? "text-green-600 dark:text-green-400" :
                          transaction.type === "REFUND" ? "text-red-600 dark:text-red-400" :
                          "text-blue-600 dark:text-blue-400"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.user.name || transaction.user.email}
                        </p>
                        <p className="text-sm text-slate-500">
                          {transaction.type} - {transaction.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "PAYMENT" ? "text-green-600" :
                        transaction.type === "REFUND" ? "text-red-600" : "text-slate-900 dark:text-white"
                      }`}>
                        {transaction.type === "REFUND" ? "-" : "+"}{formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusColors[transaction.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fatura no, kullanıcı veya email ara..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              >
                <option value="">Tüm Durumlar</option>
                <option value="DRAFT">Taslak</option>
                <option value="PENDING">Beklemede</option>
                <option value="PAID">Ödendi</option>
                <option value="OVERDUE">Vadesi Geçmiş</option>
                <option value="CANCELLED">İptal</option>
                <option value="REFUNDED">İade</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-[#0d0d14]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fatura No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Vade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Fatura bulunamadı
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const StatusIcon = statusIcons[invoice.status];
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-[#0d0d14]">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-slate-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {invoice.user.name || "İsimsiz"}
                            </p>
                            <p className="text-sm text-slate-500">{invoice.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(invoice.dueDate).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => window.open(`/admin/billing/invoices/${invoice.id}`, "_self")}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Toplam {invoices.length} fatura
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Sayfa {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İşlem ara..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {transactions.map((transaction) => {
              const StatusIcon = statusIcons[transaction.status];
              return (
                <div
                  key={transaction.id}
                  className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0d0d14]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === "PAYMENT" ? "bg-green-100 dark:bg-green-900/30" :
                      transaction.type === "REFUND" ? "bg-red-100 dark:bg-red-900/30" :
                      transaction.type === "CREDIT" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-amber-100 dark:bg-amber-900/30"
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        transaction.type === "PAYMENT" ? "text-green-600 dark:text-green-400" :
                        transaction.type === "REFUND" ? "text-red-600 dark:text-red-400" :
                        transaction.type === "CREDIT" ? "text-blue-600 dark:text-blue-400" :
                        "text-amber-600 dark:text-amber-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {transaction.type === "PAYMENT" ? "Ödeme" :
                         transaction.type === "REFUND" ? "İade" :
                         transaction.type === "CREDIT" ? "Kredi" : "Borç"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {transaction.user.name || transaction.user.email} - {transaction.provider}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(transaction.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === "PAYMENT" || transaction.type === "CREDIT" ? "text-green-600" :
                      "text-red-600"
                    }`}>
                      {transaction.type === "REFUND" || transaction.type === "DEBIT" ? "-" : "+"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusColors[transaction.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {transaction.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
          <p className="text-center text-slate-500">
            Abonelik yönetimi yakında eklenecek...
          </p>
        </div>
      )}
    </div>
  );
}

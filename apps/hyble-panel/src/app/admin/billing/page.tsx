"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  CreditCard,
  Search,
  Filter,
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
} from "lucide-react";

type Tab = "invoices" | "transactions" | "subscriptions" | "wallets";
type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

interface Invoice {
  id: string;
  number: string;
  user: string;
  email: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Taslak", color: "bg-slate-100 text-slate-700", icon: <Clock className="h-3 w-3" /> },
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  PAID: { label: "Ödendi", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  OVERDUE: { label: "Gecikmiş", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-3 w-3" /> },
  CANCELLED: { label: "İptal", color: "bg-slate-100 text-slate-500", icon: <XCircle className="h-3 w-3" /> },
};

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");

  const tabs = [
    { id: "invoices" as Tab, label: "Faturalar", icon: <Receipt className="h-4 w-4" /> },
    { id: "transactions" as Tab, label: "İşlemler", icon: <CreditCard className="h-4 w-4" /> },
    { id: "subscriptions" as Tab, label: "Abonelikler", icon: <RefreshCw className="h-4 w-4" /> },
    { id: "wallets" as Tab, label: "Cüzdanlar", icon: <Wallet className="h-4 w-4" /> },
  ];

  // Mock invoices
  const invoices: Invoice[] = [
    {
      id: "1",
      number: "HYB-2024-0001",
      user: "John Doe",
      email: "john@example.com",
      amount: 29.99,
      status: "PAID",
      dueDate: new Date("2024-12-15"),
      createdAt: new Date("2024-12-01"),
      paidAt: new Date("2024-12-10"),
    },
    {
      id: "2",
      number: "HYB-2024-0002",
      user: "Jane Smith",
      email: "jane@example.com",
      amount: 99.99,
      status: "PENDING",
      dueDate: new Date("2024-12-30"),
      createdAt: new Date("2024-12-15"),
    },
    {
      id: "3",
      number: "HYB-2024-0003",
      user: "Bob Wilson",
      email: "bob@example.com",
      amount: 14.99,
      status: "OVERDUE",
      dueDate: new Date("2024-12-01"),
      createdAt: new Date("2024-11-15"),
    },
  ];

  // Mock transactions
  const transactions = [
    { id: "1", user: "John Doe", type: "PAYMENT", amount: 29.99, method: "card", createdAt: new Date() },
    { id: "2", user: "Jane Smith", type: "DEPOSIT", amount: 50.00, method: "wallet", createdAt: new Date() },
    { id: "3", user: "Bob Wilson", type: "REFUND", amount: -14.99, method: "card", createdAt: new Date() },
  ];

  // Mock subscriptions
  const subscriptions = [
    { id: "1", user: "John Doe", plan: "Business", status: "ACTIVE", nextBilling: new Date("2025-01-15"), amount: 29.99 },
    { id: "2", user: "Jane Smith", plan: "Starter", status: "ACTIVE", nextBilling: new Date("2025-01-01"), amount: 9.99 },
    { id: "3", user: "Bob Wilson", plan: "Free", status: "CANCELLED", nextBilling: null, amount: 0 },
  ];

  // Mock wallets
  const wallets = [
    { id: "1", user: "John Doe", mainBalance: 45.50, bonusBalance: 10.00, promoBalance: 5.00 },
    { id: "2", user: "Jane Smith", mainBalance: 120.00, bonusBalance: 25.00, promoBalance: 0 },
    { id: "3", user: "Bob Wilson", mainBalance: 0, bonusBalance: 0, promoBalance: 0 },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status === "PENDING").reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter((i) => i.status === "OVERDUE").reduce((sum, i) => sum + i.amount, 0);

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
        <Card className="p-4 border-green-200">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Bu Ay Gelir</p>
              <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">€{pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Gecikmiş</p>
              <p className="text-2xl font-bold text-red-600">€{overdueAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Aktif Abonelik</p>
              <p className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "ACTIVE").length}</p>
            </div>
          </div>
        </Card>
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
                  placeholder="Fatura no, kullanıcı veya email ara..."
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
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Fatura No</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Tutar</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Vade</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const config = statusConfig[invoice.status];
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-mono font-medium">{invoice.number}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{invoice.user}</p>
                          <p className="text-sm text-muted-foreground">{invoice.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">€{invoice.amount.toFixed(2)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {invoice.dueDate.toLocaleDateString("tr-TR")}
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
                              <Button variant="ghost" size="icon">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tip</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tutar</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Yöntem</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{tx.user}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tx.type === "PAYMENT" ? "bg-green-100 text-green-700" :
                        tx.type === "DEPOSIT" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {tx.type === "PAYMENT" ? "Ödeme" : tx.type === "DEPOSIT" ? "Yükleme" : "İade"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount >= 0 ? "+" : ""}€{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{tx.method}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {tx.createdAt.toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Plan</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Sonraki Fatura</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{sub.user}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{sub.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {sub.status === "ACTIVE" ? "Aktif" : "İptal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {sub.nextBilling ? sub.nextBilling.toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      €{sub.amount.toFixed(2)}/ay
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Wallets Tab */}
      {activeTab === "wallets" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Ana Bakiye</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Bonus</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Promosyon</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => {
                  const total = wallet.mainBalance + wallet.bonusBalance + wallet.promoBalance;
                  return (
                    <tr key={wallet.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{wallet.user}</td>
                      <td className="px-4 py-3">€{wallet.mainBalance.toFixed(2)}</td>
                      <td className="px-4 py-3 text-yellow-600">€{wallet.bonusBalance.toFixed(2)}</td>
                      <td className="px-4 py-3 text-purple-600">€{wallet.promoBalance.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-green-600">€{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

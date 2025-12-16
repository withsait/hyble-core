"use client";

import { useState } from "react";
import { Mail, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, Eye, MousePointer } from "lucide-react";

// Mock data - will be replaced with tRPC query
const mockEmailLogs = [
  {
    id: "1",
    recipient: "user@example.com",
    subject: "Email Adresinizi Doğrulayın - Hyble",
    type: "VERIFICATION",
    status: "DELIVERED",
    sentAt: new Date("2024-12-15T10:30:00"),
    deliveredAt: new Date("2024-12-15T10:30:05"),
    openedAt: new Date("2024-12-15T10:35:00"),
  },
  {
    id: "2",
    recipient: "test@example.com",
    subject: "Şifrenizi Sıfırlayın - Hyble",
    type: "RESET_PASSWORD",
    status: "OPENED",
    sentAt: new Date("2024-12-15T09:00:00"),
    deliveredAt: new Date("2024-12-15T09:00:03"),
    openedAt: new Date("2024-12-15T09:15:00"),
  },
  {
    id: "3",
    recipient: "bounce@example.com",
    subject: "Hoş Geldiniz! - Hyble",
    type: "WELCOME",
    status: "BOUNCED",
    sentAt: new Date("2024-12-14T15:00:00"),
    error: "Mailbox not found",
  },
  {
    id: "4",
    recipient: "pending@example.com",
    subject: "Organizasyona Davet - Hyble",
    type: "ORG_INVITE",
    status: "PENDING",
    sentAt: new Date("2024-12-16T08:00:00"),
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: <Clock className="w-3.5 h-3.5" /> },
  SENT: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <Mail className="w-3.5 h-3.5" /> },
  DELIVERED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  FAILED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle className="w-3.5 h-3.5" /> },
  BOUNCED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle className="w-3.5 h-3.5" /> },
  COMPLAINED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: <XCircle className="w-3.5 h-3.5" /> },
  OPENED: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", icon: <Eye className="w-3.5 h-3.5" /> },
  CLICKED: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", icon: <MousePointer className="w-3.5 h-3.5" /> },
};

const typeLabels: Record<string, string> = {
  VERIFICATION: "Doğrulama",
  RESET_PASSWORD: "Şifre Sıfırlama",
  WELCOME: "Hoş Geldin",
  INVOICE: "Fatura",
  TICKET_REPLY: "Destek Yanıtı",
  ORG_INVITE: "Organizasyon Daveti",
  SECURITY_ALERT: "Güvenlik Uyarısı",
  MARKETING: "Pazarlama",
  SYSTEM_ALERT: "Sistem Uyarısı",
};

export default function AdminEmailsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredLogs = mockEmailLogs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Mail className="w-7 h-7 text-blue-500" />
          Email Logları
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gönderilen tüm emailleri takip edin
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Email veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="PENDING">Bekliyor</option>
              <option value="SENT">Gönderildi</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="OPENED">Açıldı</option>
              <option value="CLICKED">Tıklandı</option>
              <option value="BOUNCED">Geri Döndü</option>
              <option value="FAILED">Başarısız</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Tüm Tipler</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Toplam</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockEmailLogs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Teslim Edildi</p>
          <p className="text-2xl font-bold text-green-600">{mockEmailLogs.filter(l => l.status === "DELIVERED" || l.status === "OPENED" || l.status === "CLICKED").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Açılma Oranı</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round((mockEmailLogs.filter(l => l.status === "OPENED" || l.status === "CLICKED").length / mockEmailLogs.length) * 100)}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Başarısız</p>
          <p className="text-2xl font-bold text-red-600">{mockEmailLogs.filter(l => l.status === "BOUNCED" || l.status === "FAILED").length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Alıcı</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Konu</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Tip</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Durum</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Gönderilme</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const statusStyle = statusColors[log.status as keyof typeof statusColors] ?? statusColors.PENDING!;
                return (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{log.recipient}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {typeLabels[log.type] || log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {log.sentAt.toLocaleString("tr-TR")}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Sonuç bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}

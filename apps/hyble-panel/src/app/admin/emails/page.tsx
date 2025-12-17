// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MousePointer,
  Loader2,
  Send,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type EmailStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED" | "COMPLAINED" | "OPENED" | "CLICKED";
type EmailType = "VERIFICATION" | "RESET_PASSWORD" | "WELCOME" | "INVOICE" | "TICKET_REPLY" | "ORG_INVITE" | "SECURITY_ALERT" | "MARKETING" | "SYSTEM_ALERT";

const statusConfig: Record<EmailStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  SENT: { label: "Gönderildi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Mail },
  DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  FAILED: { label: "Başarısız", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  BOUNCED: { label: "Geri Döndü", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  COMPLAINED: { label: "Şikayet", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
  OPENED: { label: "Açıldı", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Eye },
  CLICKED: { label: "Tıklandı", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: MousePointer },
};

const typeLabels: Record<EmailType, string> = {
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
  const [statusFilter, setStatusFilter] = useState<EmailStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EmailType | "all">("all");
  const [page, setPage] = useState(1);

  // tRPC queries
  const { data: stats, isLoading: statsLoading } = trpc.email.adminStats.useQuery({ period: "week" });

  const { data: emailsData, isLoading: emailsLoading, refetch } = trpc.email.adminList.useQuery({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchTerm || undefined,
  });

  const resendEmail = trpc.email.adminResend.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Mail className="h-7 w-7 text-primary" />
          Email Logları
        </h1>
        <p className="text-muted-foreground mt-1">
          Gönderilen tüm emailleri takip edin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-3 bg-muted rounded w-16 mb-2" />
                  <div className="h-6 bg-muted rounded w-12" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Bu Hafta Gönderilen</p>
              <p className="text-2xl font-bold mt-1">{stats?.totalSent || 0}</p>
            </Card>
            <Card className="p-4 border-green-200">
              <p className="text-sm text-muted-foreground">Teslim Oranı</p>
              <p className="text-2xl font-bold text-green-600 mt-1">%{stats?.deliveryRate || 0}</p>
            </Card>
            <Card className="p-4 border-purple-200">
              <p className="text-sm text-muted-foreground">Açılma Oranı</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">%{stats?.openRate || 0}</p>
            </Card>
            <Card className="p-4 border-red-200">
              <p className="text-sm text-muted-foreground">Bounce Oranı</p>
              <p className="text-2xl font-bold text-red-600 mt-1">%{stats?.bounceRate || 0}</p>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Email veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EmailStatus | "all")}
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EmailType | "all")}
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          >
            <option value="all">Tüm Tipler</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {emailsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Yükleniyor...</p>
          </div>
        ) : emailsData?.logs.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Email logu bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Alıcı</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Konu</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Tip</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Gönderilme</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {emailsData?.logs.map((log: any) => {
                    const config = statusConfig[log.status as EmailStatus];
                    const StatusIcon = config?.icon || Clock;
                    return (
                      <tr key={log.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium">{log.recipient}</p>
                          {log.userId && (
                            <p className="text-xs text-muted-foreground font-mono">{log.userId.slice(0, 8)}...</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm max-w-xs truncate">{log.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {typeLabels[log.type as EmailType] || log.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${config?.color || "bg-slate-100"}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config?.label || log.status}
                          </span>
                          {log.error && (
                            <p className="text-xs text-red-500 mt-1">{log.error}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(log.sentAt), "d MMM yyyy HH:mm", { locale: tr })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" title="Detay">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(log.status === "FAILED" || log.status === "BOUNCED") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Tekrar Gönder"
                                onClick={() => resendEmail.mutate({ id: log.id })}
                                disabled={resendEmail.isPending}
                              >
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
            {emailsData && emailsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Toplam {emailsData.total} email
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
                    disabled={page >= emailsData.totalPages}
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
    </div>
  );
}

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

type SecurityAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET"
  | "EMAIL_CHANGE"
  | "2FA_ENABLE"
  | "2FA_DISABLE"
  | "API_KEY_CREATE"
  | "API_KEY_REVOKE"
  | "SESSION_REVOKE"
  | "ACCOUNT_FREEZE"
  | "ACCOUNT_UNFREEZE";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"SUCCESS" | "FAILURE" | "">("");
  const limit = 20;

  const { data, isLoading } = trpc.admin.getSecurityLogs.useQuery({
    page,
    limit,
    userId: userIdFilter || undefined,
    action: actionFilter || undefined,
    status: statusFilter ? statusFilter : undefined,
  });

  const logs = data?.logs || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const getActionIcon = (action: string) => {
    if (action.includes("SUCCESS") || action.includes("ENABLE")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (action.includes("FAILED") || action.includes("REVOKE") || action.includes("FREEZE")) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes("CHANGE") || action.includes("RESET")) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      LOGIN_SUCCESS: "Başarılı Giriş",
      LOGIN_FAILED: "Başarısız Giriş",
      LOGOUT: "Çıkış",
      PASSWORD_CHANGE: "Şifre Değişikliği",
      PASSWORD_RESET: "Şifre Sıfırlama",
      EMAIL_CHANGE: "Email Değişikliği",
      "2FA_ENABLE": "2FA Aktifleştirme",
      "2FA_DISABLE": "2FA Deaktifleştirme",
      API_KEY_CREATE: "API Key Oluşturma",
      API_KEY_REVOKE: "API Key İptal",
      SESSION_REVOKE: "Oturum Sonlandırma",
      ACCOUNT_FREEZE: "Hesap Dondurma",
      ACCOUNT_UNFREEZE: "Hesap Açma",
    };
    return labels[action] || action;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Güvenlik Logları
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sistem güvenlik olaylarını takip edin
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Toplam {total} kayıt
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kullanıcı ID ile filtrele..."
            value={userIdFilter}
            onChange={(e) => {
              setUserIdFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">Tüm Eylemler</option>
            <option value="LOGIN_SUCCESS">Başarılı Giriş</option>
            <option value="LOGIN_FAILED">Başarısız Giriş</option>
            <option value="LOGOUT">Çıkış</option>
            <option value="PASSWORD_CHANGE">Şifre Değişikliği</option>
            <option value="2FA_ENABLE">2FA Aktifleştirme</option>
            <option value="2FA_DISABLE">2FA Deaktifleştirme</option>
            <option value="API_KEY_CREATE">API Key Oluşturma</option>
            <option value="API_KEY_REVOKE">API Key İptal</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "SUCCESS" | "FAILURE" | "");
              setPage(1);
            }}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">Tüm Durumlar</option>
            <option value="SUCCESS">Başarılı</option>
            <option value="FAILURE">Başarısız</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Eylem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    IP Adresi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cihaz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {log.user?.name || "Bilinmeyen"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {log.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                          {log.ipAddress || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs block">
                        {log.userAgent || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

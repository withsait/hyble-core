"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@hyble/ui";
import {
  BarChart3,
  TrendingUp,
  Users,
  RefreshCw,
  Download,
  Loader2,
  Activity,
  Shield,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch real data from tRPC
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getDashboardStats.useQuery();
  const { data: systemStats, isLoading: systemLoading, refetch: refetchSystem } = trpc.admin.getSystemStats.useQuery();
  const { data: recentActions } = trpc.admin.getAdminActions.useQuery({ page: 1, limit: 5 });
  const { data: securityLogs } = trpc.admin.getSecurityLogs.useQuery({ page: 1, limit: 10 });

  const isLoading = statsLoading || systemLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchSystem();
  };

  // Calculate percentages
  const verifiedPercentage = dashboardStats?.users.total
    ? Math.round((dashboardStats.users.verified / dashboardStats.users.total) * 100)
    : 0;
  const securePercentage = dashboardStats?.users.total
    ? Math.round((dashboardStats.users.secure / dashboardStats.users.total) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-amber-500" />
            Platform Analitikleri
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Platform genelinde istatistikler ve trendler
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-amber-500"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Main User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {systemStats?.newUsers?.today && systemStats.newUsers.today > 0 && (
              <span className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{systemStats.newUsers.today}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats?.users.total.toLocaleString() ?? 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam Kullanıcı
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-slate-500">{verifiedPercentage}%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats?.users.verified.toLocaleString() ?? 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Doğrulanmış Kullanıcı
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-slate-500">{securePercentage}%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (dashboardStats?.users.secure ?? 0) + (dashboardStats?.users.corporate ?? 0)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Güvenli Hesaplar (2FA)
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats?.organizations.toLocaleString() ?? 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Organizasyonlar
          </div>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : dashboardStats?.recentLogins24h.toLocaleString() ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Günlük Giriş (24 saat)
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : systemStats?.logins?.failedToday.toLocaleString() ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Başarısız Giriş Denemesi
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : dashboardStats?.pendingDeletions ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Bekleyen Hesap Silme
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* New User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : systemStats?.newUsers?.today ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Bugün Yeni Kayıt
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : systemStats?.newUsers?.week ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Bu Hafta Kayıt
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "..." : systemStats?.newUsers?.month ?? 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Bu Ay Kayıt
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admin Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Son Admin İşlemleri
          </h2>
          <div className="space-y-3">
            {recentActions?.actions && recentActions.actions.length > 0 ? (
              recentActions.actions.map((action: any) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      action.action.includes("BAN") ? "bg-red-100 text-red-600" :
                      action.action.includes("UPDATE") ? "bg-blue-100 text-blue-600" :
                      action.action.includes("DELETE") ? "bg-orange-100 text-orange-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {action.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {action.admin?.email ?? "Bilinmiyor"} {action.targetUser && `→ ${action.targetUser.email}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(action.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Henüz admin işlemi yok</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Security Logs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Güvenlik Logları
          </h2>
          <div className="space-y-3">
            {securityLogs?.logs && securityLogs.logs.length > 0 ? (
              securityLogs.logs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.status === "SUCCESS" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {log.status === "SUCCESS" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {log.user?.email ?? "Bilinmiyor"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Shield className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Henüz güvenlik logu yok</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* User Status Distribution */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Kullanıcı Durumu Dağılımı
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : dashboardStats?.users.active ?? 0}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">Aktif</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "..." : dashboardStats?.users.verified ?? 0}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400">Doğrulanmış</div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {isLoading ? "..." : dashboardStats?.users.secure ?? 0}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-400">Güvenli</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? "..." : dashboardStats?.users.corporate ?? 0}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-400">Kurumsal</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "..." : (dashboardStats?.users.banned ?? 0) + (dashboardStats?.users.frozen ?? 0)}
            </div>
            <div className="text-sm text-red-700 dark:text-red-400">Yasaklı/Dondurulmuş</div>
          </div>
        </div>
      </Card>

      {/* Platform Health */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Platform Durumu
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">API Durumu</span>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Çalışıyor
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Veritabanı</span>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Sağlıklı
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">CDN</span>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Email Servisi</span>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Çalışıyor
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

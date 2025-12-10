import { prisma } from "@hyble/database";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  LogIn,
  KeyRound,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Lock,
  Unlock,
  Eye,
  Download,
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  page?: string;
  action?: string;
  status?: string;
  days?: string;
}

async function getSecurityStats() {
  const today = new Date();
  const last7Days = subDays(today, 7);
  const last24Hours = subDays(today, 1);
  const last30Days = subDays(today, 30);

  const [
    totalLogins,
    failedLogins24h,
    failedLogins7d,
    twoFactorEnabled,
    totalUsers,
    suspendedUsers,
    activeSessionsCount,
    recentSecurityLogs,
    loginAttemptsByDay,
    topIpAddresses,
    recentSuspiciousActivity,
    passwordChanges7d,
    newUsers7d,
    blockedLogins7d,
  ] = await Promise.all([
    // Total successful logins in last 7 days
    prisma.securityLog.count({
      where: {
        action: "LOGIN",
        status: "SUCCESS",
        createdAt: { gte: last7Days },
      },
    }),
    // Failed logins in last 24 hours
    prisma.loginAttempt.count({
      where: {
        success: false,
        createdAt: { gte: last24Hours },
      },
    }),
    // Failed logins in last 7 days
    prisma.loginAttempt.count({
      where: {
        success: false,
        createdAt: { gte: last7Days },
      },
    }),
    // Users with 2FA enabled
    prisma.twoFactorAuth.count({
      where: { enabled: true },
    }),
    // Total users
    prisma.user.count(),
    // Suspended users
    prisma.user.count({
      where: { status: "SUSPENDED" },
    }),
    // Active sessions
    prisma.session.count({
      where: { expires: { gte: today } },
    }),
    // Recent security logs
    prisma.securityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    // Login attempts by day (last 7 days)
    prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) FILTER (WHERE success = false) as failed
      FROM "LoginAttempt"
      WHERE "createdAt" >= ${last7Days}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    ` as Promise<Array<{ date: Date; successful: bigint; failed: bigint }>>,
    // Top IP addresses with failed logins
    prisma.$queryRaw`
      SELECT "ipAddress" as ip_address, COUNT(*) as count
      FROM "LoginAttempt"
      WHERE success = false AND "createdAt" >= ${last7Days}
      GROUP BY "ipAddress"
      ORDER BY count DESC
      LIMIT 10
    ` as Promise<Array<{ ip_address: string; count: bigint }>>,
    // Recent suspicious activity (failed logins, blocked, account locks)
    prisma.securityLog.findMany({
      where: {
        OR: [
          { status: "FAILURE" },
          { status: "BLOCKED" },
          { action: "ACCOUNT_LOCK" },
        ],
        createdAt: { gte: last7Days },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    // Password changes in last 7 days
    prisma.securityLog.count({
      where: {
        action: "PASSWORD_CHANGE",
        status: "SUCCESS",
        createdAt: { gte: last7Days },
      },
    }),
    // New users in last 7 days
    prisma.user.count({
      where: {
        createdAt: { gte: last7Days },
      },
    }),
    // Blocked logins in last 7 days
    prisma.securityLog.count({
      where: {
        status: "BLOCKED",
        createdAt: { gte: last7Days },
      },
    }),
  ]);

  return {
    totalLogins,
    failedLogins24h,
    failedLogins7d,
    twoFactorEnabled,
    totalUsers,
    suspendedUsers,
    activeSessionsCount,
    recentSecurityLogs,
    loginAttemptsByDay,
    topIpAddresses,
    recentSuspiciousActivity,
    passwordChanges7d,
    newUsers7d,
    blockedLogins7d,
    twoFactorPercentage: totalUsers > 0 ? Math.round((twoFactorEnabled / totalUsers) * 100) : 0,
  };
}

async function getSecurityLogs(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;
  const days = parseInt(searchParams.days || "7");

  const where: any = {
    createdAt: { gte: subDays(new Date(), days) },
  };

  if (searchParams.action && searchParams.action !== "all") {
    where.action = searchParams.action;
  }

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }

  const [logs, total] = await Promise.all([
    prisma.securityLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.securityLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const [stats, logsData] = await Promise.all([
    getSecurityStats(),
    getSecurityLogs(searchParams),
  ]);

  const { logs, total, page, totalPages } = logsData;

  const actionLabels: Record<string, string> = {
    LOGIN: "Giriş",
    LOGOUT: "Çıkış",
    PASSWORD_CHANGE: "Şifre Değişikliği",
    EMAIL_CHANGE: "E-posta Değişikliği",
    PHONE_CHANGE: "Telefon Değişikliği",
    TWO_FACTOR_ENABLE: "2FA Etkinleştirme",
    TWO_FACTOR_DISABLE: "2FA Devre Dışı",
    ACCOUNT_LOCK: "Hesap Kilitleme",
    ACCOUNT_UNLOCK: "Hesap Kilit Açma",
    SESSION_REVOKE: "Oturum Sonlandırma",
    API_KEY_CREATE: "API Anahtarı Oluşturma",
    API_KEY_REVOKE: "API Anahtarı İptal",
  };

  const statusColors = {
    SUCCESS: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20",
    FAILURE: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20",
    BLOCKED: "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20",
  };

  const statusLabels = {
    SUCCESS: "Başarılı",
    FAILURE: "Başarısız",
    BLOCKED: "Engellendi",
  };

  const buildUrl = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return `/security?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Güvenlik Merkezi</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Sistem güvenliğini izleyin ve yönetin
        </p>
      </div>

      {/* Stats Grid - Primary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Başarılı Giriş (7 gün)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalLogins}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Başarısız Giriş (24 saat)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.failedLogins24h}</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                7 günde: {stats.failedLogins7d}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">2FA Kullanım Oranı</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">%{stats.twoFactorPercentage}</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                {stats.twoFactorEnabled} / {stats.totalUsers} kullanıcı
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Aktif Oturumlar</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.activeSessionsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Secondary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Askıya Alınan Hesaplar</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.suspendedUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Ban className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Engellenen Girişler (7 gün)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.blockedLogins7d}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Şifre Değişiklikleri (7 gün)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.passwordChanges7d}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Yeni Kullanıcılar (7 gün)</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.newUsers7d}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Charts and Suspicious Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Login Activity Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Giriş Aktivitesi (Son 7 Gün)
          </h2>
          <div className="space-y-3">
            {stats.loginAttemptsByDay.map((day, index) => {
              const successful = Number(day.successful);
              const failed = Number(day.failed);
              const total = successful + failed;
              const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-slate-600 dark:text-slate-400 text-sm w-20">
                    {format(new Date(day.date), "dd MMM", { locale: tr })}
                  </span>
                  <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${successRate}%` }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${100 - successRate}%` }}
                    />
                  </div>
                  <div className="text-right w-28">
                    <span className="text-green-600 dark:text-green-400 text-sm">{successful}</span>
                    <span className="text-slate-400 dark:text-slate-600 text-sm"> / </span>
                    <span className="text-red-600 dark:text-red-400 text-sm">{failed}</span>
                  </div>
                </div>
              );
            })}
            {stats.loginAttemptsByDay.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Veri bulunamadı</p>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-slate-600 dark:text-slate-400 text-sm">Başarılı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-slate-600 dark:text-slate-400 text-sm">Başarısız</span>
            </div>
          </div>
        </div>

        {/* Top IP Addresses */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Başarısız Giriş IP Adresleri (7 Gün)
          </h2>
          <div className="space-y-3">
            {stats.topIpAddresses.map((ip, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs">
                    {index + 1}
                  </span>
                  <code className="text-slate-900 dark:text-white text-sm">{ip.ip_address || "Bilinmiyor"}</code>
                </div>
                <span className="text-red-600 dark:text-red-400 font-medium">{Number(ip.count)}</span>
              </div>
            ))}
            {stats.topIpAddresses.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Başarısız giriş bulunamadı</p>
            )}
          </div>
        </div>
      </div>

      {/* Suspicious Activity */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          Şüpheli Aktiviteler (Son 7 Gün)
        </h2>
        {stats.recentSuspiciousActivity.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">Şüpheli aktivite bulunamadı</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">İşlem</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Durum</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">IP Adresi</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSuspiciousActivity.map((log) => (
                  <tr key={log.id} className="border-b border-slate-200/50 dark:border-slate-700/50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/users/${log.user.id}`}
                        className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {log.user.name || log.user.email}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-sm">
                      {actionLabels[log.action] || log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
                        {statusLabels[log.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-sm">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-sm">
                      {format(log.createdAt, "dd MMM HH:mm", { locale: tr })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm mb-6">
        <form className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              name="action"
              defaultValue={searchParams.action || "all"}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="LOGIN">Giriş</option>
              <option value="LOGOUT">Çıkış</option>
              <option value="PASSWORD_CHANGE">Şifre Değişikliği</option>
              <option value="TWO_FACTOR_ENABLE">2FA Etkinleştirme</option>
              <option value="TWO_FACTOR_DISABLE">2FA Devre Dışı</option>
              <option value="SESSION_REVOKE">Oturum Sonlandırma</option>
            </select>
          </div>
          <select
            name="status"
            defaultValue={searchParams.status || "all"}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="SUCCESS">Başarılı</option>
            <option value="FAILURE">Başarısız</option>
            <option value="BLOCKED">Engellendi</option>
          </select>
          <select
            name="days"
            defaultValue={searchParams.days || "7"}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1">Son 24 Saat</option>
            <option value="7">Son 7 Gün</option>
            <option value="30">Son 30 Gün</option>
            <option value="90">Son 90 Gün</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Filtrele
          </button>
        </form>
      </div>

      {/* Security Logs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Güvenlik Logları ({total})
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Kullanıcı</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">İşlem</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Durum</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">IP Adresi</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Cihaz</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Güvenlik kaydı bulunamadı
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-4 px-6">
                    <Link
                      href={`/users/${log.user.id}`}
                      className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {log.user.name || log.user.email}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    {actionLabels[log.action] || log.action}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
                      {statusLabels[log.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                    {log.ipAddress || "-"}
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                    {log.device || "-"}
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                    {format(log.createdAt, "dd MMM yyyy HH:mm", { locale: tr })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} arası gösteriliyor (toplam {total})
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ ...searchParams, page: String(page - 1) })}
                className={`p-2 rounded-lg ${
                  page === 1
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Link
                    key={pageNum}
                    href={buildUrl({ ...searchParams, page: String(pageNum) })}
                    className={`px-3 py-1 rounded-lg ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              <Link
                href={buildUrl({ ...searchParams, page: String(page + 1) })}
                className={`p-2 rounded-lg ${
                  page === totalPages
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import {
  FileText,
  Terminal,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Activity,
  LogIn,
  LogOut,
  Key,
  Lock,
  Unlock,
  UserPlus,
  Settings,
  Download,
  RefreshCw,
  Database,
  Clock,
} from "lucide-react";

interface SearchParams {
  page?: string;
  type?: string;
  action?: string;
  days?: string;
}

async function getLogsData(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 30;
  const skip = (page - 1) * pageSize;
  const days = parseInt(searchParams.days || "7");
  const type = searchParams.type || "all";
  const action = searchParams.action || "all";

  const dateFilter = subDays(new Date(), days);

  // Build where clause for security logs
  const securityWhere: any = {
    createdAt: { gte: dateFilter },
  };

  if (action !== "all") {
    securityWhere.action = action;
  }

  // Get logs based on type
  let logs: any[] = [];
  let total = 0;

  if (type === "all" || type === "security") {
    const [securityLogs, securityCount] = await Promise.all([
      prisma.securityLog.findMany({
        where: securityWhere,
        skip: type === "security" ? skip : 0,
        take: type === "security" ? pageSize : Math.ceil(pageSize / 2),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.securityLog.count({ where: securityWhere }),
    ]);

    logs = securityLogs.map((log) => ({
      id: log.id,
      type: "security",
      action: log.action,
      status: log.status,
      message: getActionDescription(log.action, log.status),
      user: log.user,
      ipAddress: log.ipAddress,
      device: log.device,
      createdAt: log.createdAt,
    }));

    if (type === "security") {
      total = securityCount;
    } else {
      total = securityCount;
    }
  }

  if (type === "all" || type === "access") {
    const loginWhere: any = {
      createdAt: { gte: dateFilter },
    };

    const [loginLogs, loginCount] = await Promise.all([
      prisma.loginAttempt.findMany({
        where: loginWhere,
        skip: type === "access" ? skip : 0,
        take: type === "access" ? pageSize : Math.ceil(pageSize / 2),
        orderBy: { createdAt: "desc" },
      }),
      prisma.loginAttempt.count({ where: loginWhere }),
    ]);

    const accessLogs = loginLogs.map((log) => ({
      id: log.id,
      type: "access",
      action: log.success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
      status: log.success ? "SUCCESS" : "FAILURE",
      message: log.success ? "Başarılı giriş" : `Başarısız giriş${log.failReason ? `: ${log.failReason}` : ""}`,
      user: { id: null, name: null, email: log.email },
      ipAddress: log.ipAddress,
      device: log.userAgent,
      createdAt: log.createdAt,
    }));

    if (type === "access") {
      logs = accessLogs;
      total = loginCount;
    } else if (type === "all") {
      logs = [...logs, ...accessLogs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, pageSize);
      total = total + loginCount;
    }
  }

  // Get stats
  const [
    totalSecurityLogs,
    totalLoginAttempts,
    failedLogins7d,
    securityLogsByAction,
  ] = await Promise.all([
    prisma.securityLog.count({ where: { createdAt: { gte: dateFilter } } }),
    prisma.loginAttempt.count({ where: { createdAt: { gte: dateFilter } } }),
    prisma.loginAttempt.count({
      where: { success: false, createdAt: { gte: dateFilter } },
    }),
    prisma.$queryRaw`
      SELECT action, COUNT(*) as count
      FROM "SecurityLog"
      WHERE "createdAt" >= ${dateFilter}
      GROUP BY action
      ORDER BY count DESC
      LIMIT 5
    ` as Promise<Array<{ action: string; count: bigint }>>,
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    stats: {
      totalSecurityLogs,
      totalLoginAttempts,
      failedLogins7d,
      securityLogsByAction,
    },
  };
}

function getActionDescription(action: string, status: string): string {
  const descriptions: Record<string, string> = {
    LOGIN: status === "SUCCESS" ? "Kullanıcı giriş yaptı" : "Giriş denemesi başarısız",
    LOGOUT: "Kullanıcı çıkış yaptı",
    PASSWORD_CHANGE: status === "SUCCESS" ? "Şifre değiştirildi" : "Şifre değişikliği başarısız",
    EMAIL_CHANGE: status === "SUCCESS" ? "E-posta değiştirildi" : "E-posta değişikliği başarısız",
    PHONE_CHANGE: status === "SUCCESS" ? "Telefon değiştirildi" : "Telefon değişikliği başarısız",
    TWO_FACTOR_ENABLE: status === "SUCCESS" ? "2FA etkinleştirildi" : "2FA etkinleştirme başarısız",
    TWO_FACTOR_DISABLE: status === "SUCCESS" ? "2FA devre dışı bırakıldı" : "2FA devre dışı bırakma başarısız",
    ACCOUNT_LOCK: "Hesap kilitlendi",
    ACCOUNT_UNLOCK: "Hesap kilidi açıldı",
    SESSION_REVOKE: "Oturum sonlandırıldı",
    API_KEY_CREATE: "API anahtarı oluşturuldu",
    API_KEY_REVOKE: "API anahtarı iptal edildi",
  };
  return descriptions[action] || action;
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const data = await getLogsData(searchParams);

  const actionLabels: Record<string, string> = {
    LOGIN: "Giriş",
    LOGOUT: "Çıkış",
    LOGIN_SUCCESS: "Başarılı Giriş",
    LOGIN_FAILED: "Başarısız Giriş",
    PASSWORD_CHANGE: "Şifre Değişikliği",
    EMAIL_CHANGE: "E-posta Değişikliği",
    PHONE_CHANGE: "Telefon Değişikliği",
    TWO_FACTOR_ENABLE: "2FA Etkinleştirme",
    TWO_FACTOR_DISABLE: "2FA Devre Dışı",
    ACCOUNT_LOCK: "Hesap Kilitleme",
    ACCOUNT_UNLOCK: "Hesap Kilidi Açma",
    SESSION_REVOKE: "Oturum Sonlandırma",
    API_KEY_CREATE: "API Anahtarı Oluşturma",
    API_KEY_REVOKE: "API Anahtarı İptal",
  };

  const actionIcons: Record<string, React.ElementType> = {
    LOGIN: LogIn,
    LOGOUT: LogOut,
    LOGIN_SUCCESS: LogIn,
    LOGIN_FAILED: AlertTriangle,
    PASSWORD_CHANGE: Key,
    TWO_FACTOR_ENABLE: Shield,
    TWO_FACTOR_DISABLE: Shield,
    ACCOUNT_LOCK: Lock,
    ACCOUNT_UNLOCK: Unlock,
    SESSION_REVOKE: RefreshCw,
    API_KEY_CREATE: Key,
    API_KEY_REVOKE: Key,
  };

  const statusColors: Record<string, string> = {
    SUCCESS: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20",
    FAILURE: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20",
    BLOCKED: "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20",
  };

  const statusLabels: Record<string, string> = {
    SUCCESS: "Başarılı",
    FAILURE: "Başarısız",
    BLOCKED: "Engellendi",
  };

  const typeColors: Record<string, string> = {
    security: "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20",
    access: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20",
  };

  const typeLabels: Record<string, string> = {
    security: "Güvenlik",
    access: "Erişim",
  };

  const buildUrl = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return `/logs?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Sistem Logları
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Güvenlik logları ve erişim kayıtlarını görüntüleyin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Güvenlik Logları</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {data.stats.totalSecurityLogs}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Son {searchParams.days || 7} gün
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Giriş Denemeleri</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {data.stats.totalLoginAttempts}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Son {searchParams.days || 7} gün
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Başarısız Girişler</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {data.stats.failedLogins7d}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Son {searchParams.days || 7} gün
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
              <p className="text-slate-500 dark:text-slate-400 text-sm">En Çok Aksiyon</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {data.stats.securityLogsByAction[0]
                  ? actionLabels[data.stats.securityLogsByAction[0].action] ||
                    data.stats.securityLogsByAction[0].action
                  : "-"}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                {data.stats.securityLogsByAction[0]
                  ? `${Number(data.stats.securityLogsByAction[0].count)} kayıt`
                  : "Veri yok"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions Chart */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            En Sık Aksiyonlar
          </h3>
          <div className="space-y-3">
            {data.stats.securityLogsByAction.map((item, index) => {
              const count = Number(item.count);
              const maxCount = Math.max(
                ...data.stats.securityLogsByAction.map((i) => Number(i.count)),
                1
              );
              const percentage = (count / maxCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400 text-xs w-32 truncate">
                    {actionLabels[item.action] || item.action}
                  </span>
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-slate-900 dark:text-white text-sm w-12 text-right">{count}</span>
                </div>
              );
            })}
            {data.stats.securityLogsByAction.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Veri bulunamadı</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Hızlı Filtreler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/logs?type=security"
              className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md transition-all"
            >
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-slate-900 dark:text-white font-medium">Güvenlik Logları</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tüm güvenlik olayları</p>
            </Link>
            <Link
              href="/logs?type=access"
              className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md transition-all"
            >
              <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-slate-900 dark:text-white font-medium">Erişim Logları</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Giriş denemeleri</p>
            </Link>
            <Link
              href="/logs?action=PASSWORD_CHANGE"
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md transition-all"
            >
              <Key className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-slate-900 dark:text-white font-medium">Şifre Değişiklikleri</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Şifre işlemleri</p>
            </Link>
            <Link
              href="/logs?action=ACCOUNT_LOCK"
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md transition-all"
            >
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400 mb-2" />
              <p className="text-slate-900 dark:text-white font-medium">Hesap Kilitleri</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Kilitli hesaplar</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 shadow-sm">
        <form className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <select
              name="type"
              defaultValue={searchParams.type || "all"}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Loglar</option>
              <option value="security">Güvenlik Logları</option>
              <option value="access">Erişim Logları</option>
            </select>
          </div>
          <select
            name="action"
            defaultValue={searchParams.action || "all"}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Aksiyonlar</option>
            <option value="LOGIN">Giriş</option>
            <option value="LOGOUT">Çıkış</option>
            <option value="PASSWORD_CHANGE">Şifre Değişikliği</option>
            <option value="TWO_FACTOR_ENABLE">2FA Etkinleştirme</option>
            <option value="TWO_FACTOR_DISABLE">2FA Devre Dışı</option>
            <option value="ACCOUNT_LOCK">Hesap Kilitleme</option>
            <option value="SESSION_REVOKE">Oturum Sonlandırma</option>
          </select>
          <select
            name="days"
            defaultValue={searchParams.days || "7"}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1">Son 24 Saat</option>
            <option value="7">Son 7 Gün</option>
            <option value="30">Son 30 Gün</option>
            <option value="90">Son 90 Gün</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Filtrele
          </button>
          <Link
            href="/logs"
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
          >
            Temizle
          </Link>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Log Kayıtları ({data.total})
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-medium transition-colors text-sm">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Zaman
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Tür
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Aksiyon
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Kullanıcı
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Mesaj
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  IP Adresi
                </th>
                <th className="text-left py-4 px-6 text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Log kaydı bulunamadı
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => {
                  const ActionIcon = actionIcons[log.action] || Activity;
                  return (
                    <tr
                      key={`${log.type}-${log.id}`}
                      className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm">
                            {format(log.createdAt, "dd MMM HH:mm:ss", { locale: tr })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[log.type]}`}
                        >
                          {typeLabels[log.type]}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-900 dark:text-white text-sm">
                            {actionLabels[log.action] || log.action}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {log.user ? (
                          <Link
                            href={`/users/${log.user.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm"
                          >
                            {log.user.name || log.user.email}
                          </Link>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 dark:text-slate-300 text-sm truncate max-w-xs block">
                          {log.message}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <code className="text-slate-600 dark:text-slate-400 text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                          {log.ipAddress || "-"}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}
                        >
                          {statusLabels[log.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {(data.page - 1) * data.pageSize + 1} -{" "}
              {Math.min(data.page * data.pageSize, data.total)} arası gösteriliyor
              (toplam {data.total})
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ ...searchParams, page: String(data.page - 1) })}
                className={`p-2 rounded-lg ${
                  data.page === 1
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                let pageNum: number;
                if (data.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (data.page <= 3) {
                  pageNum = i + 1;
                } else if (data.page >= data.totalPages - 2) {
                  pageNum = data.totalPages - 4 + i;
                } else {
                  pageNum = data.page - 2 + i;
                }
                return (
                  <Link
                    key={pageNum}
                    href={buildUrl({ ...searchParams, page: String(pageNum) })}
                    className={`px-3 py-1 rounded-lg ${
                      data.page === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              <Link
                href={buildUrl({ ...searchParams, page: String(data.page + 1) })}
                className={`p-2 rounded-lg ${
                  data.page === data.totalPages
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none"
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

import { prisma } from "@hyble/database";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { subDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Database,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  HardDrive,
  Cpu,
  Users,
  Wallet,
  Building2,
  Shield,
  Globe,
  Key,
  TrendingUp,
  Mail,
  Phone,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";

async function getSystemStatus() {
  const startTime = Date.now();
  const now = new Date();
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);
  const last24Hours = subDays(now, 1);

  // Test database connection
  let dbStatus = { connected: false, latency: 0 };
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = { connected: true, latency: Date.now() - dbStart };
  } catch (error) {
    dbStatus = { connected: false, latency: 0 };
  }

  // Get database stats
  const [
    userCount,
    activeUsers,
    suspendedUsers,
    frozenUsers,
    sessionCount,
    walletCount,
    organizationCount,
    twoFactorCount,
    securityLogCount,
    loginAttempts7d,
    failedLogins7d,
    emailVerifiedCount,
    phoneVerifiedCount,
    newUsers7d,
    newUsers30d,
    orgMemberCount,
    inviteCount,
    accountCount,
    usersByDay,
    loginsByDay,
    trustLevelStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { status: "FROZEN" } }),
    prisma.userSession.count({ where: { isRevoked: false, expiresAt: { gt: now } } }),
    prisma.wallet.count(),
    prisma.organization.count(),
    prisma.twoFactorAuth.count({ where: { enabled: true } }),
    prisma.securityLog.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.loginAttempt.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.loginAttempt.count({ where: { success: false, createdAt: { gte: last7Days } } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { phoneVerified: true } }),
    prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.organizationMember.count(),
    prisma.organizationInvite.count({ where: { status: "PENDING" } }),
    prisma.account.count(),
    // Users created per day (last 7 days)
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${last7Days}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    ` as Promise<Array<{ date: Date; count: bigint }>>,
    // Successful logins per day (last 7 days)
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "LoginAttempt"
      WHERE "createdAt" >= ${last7Days} AND success = true
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    ` as Promise<Array<{ date: Date; count: bigint }>>,
    // Trust level distribution
    prisma.$queryRaw`
      SELECT "trustLevel" as trust_level, COUNT(*) as count
      FROM "User"
      GROUP BY "trustLevel"
    ` as Promise<Array<{ trust_level: string; count: bigint }>>,
  ]);

  // Calculate uptime
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);

  return {
    database: dbStatus,
    stats: {
      users: {
        total: userCount,
        active: activeUsers,
        suspended: suspendedUsers,
        frozen: frozenUsers,
        emailVerified: emailVerifiedCount,
        phoneVerified: phoneVerifiedCount,
        new7d: newUsers7d,
        new30d: newUsers30d,
      },
      sessions: sessionCount,
      wallets: walletCount,
      organizations: organizationCount,
      orgMembers: orgMemberCount,
      pendingInvites: inviteCount,
      twoFactor: twoFactorCount,
      accounts: accountCount,
      securityLogs: securityLogCount,
      logins: {
        total: loginAttempts7d,
        failed: failedLogins7d,
      },
    },
    charts: {
      usersByDay,
      loginsByDay,
      trustLevelStats,
    },
    uptime: uptimeFormatted,
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    responseTime: Date.now() - startTime,
    env: process.env.NODE_ENV || "development",
  };
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  parts.push(`${secs}sn`);

  return parts.join(" ");
}

function formatBytes(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default async function SystemPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const status = await getSystemStatus();

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sistem Durumu</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Sistem sağlığını ve performansını izleyin
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Database Status */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {status.database.connected ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Veritabanı</h3>
          <p
            className={`text-sm ${
              status.database.connected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {status.database.connected ? "Bağlı" : "Bağlantı Yok"}
          </p>
          {status.database.connected && (
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
              Gecikme: {status.database.latency}ms
            </p>
          )}
        </div>

        {/* Server Uptime */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Çalışma Süresi</h3>
          <p className="text-green-600 dark:text-green-400 text-sm">{status.uptime}</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Sunucu çalışıyor</p>
        </div>

        {/* Response Time */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Yanıt Süresi</h3>
          <p className="text-green-600 dark:text-green-400 text-sm">{status.responseTime}ms</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Sayfa yükleme süresi</p>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bellek</h3>
          <p className="text-green-600 dark:text-green-400 text-sm">
            {formatBytes(status.memory.heapUsed)}
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            / {formatBytes(status.memory.heapTotal)}
          </p>
        </div>
      </div>

      {/* Database Stats Grid - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Kullanıcılar</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.total}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            {status.stats.users.active} aktif
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Yeni (7 gün)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.new7d}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            30 gün: {status.stats.users.new30d}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Oturumlar</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.sessions}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">aktif oturum</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Cüzdanlar</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.wallets}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">toplam cüzdan</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Organizasyonlar</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.organizations}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{status.stats.orgMembers} üye</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">2FA Aktif</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.twoFactor}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            %{status.stats.users.total > 0 ? Math.round((status.stats.twoFactor / status.stats.users.total) * 100) : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">OAuth Hesapları</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.accounts}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">bağlı hesap</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Başarısız Giriş</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.logins.failed}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">son 7 gün</p>
        </div>
      </div>

      {/* Database Stats Grid - Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">E-posta Doğrulama</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.emailVerified}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            %{status.stats.users.total > 0 ? Math.round((status.stats.users.emailVerified / status.stats.users.total) * 100) : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Telefon Doğrulama</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.phoneVerified}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            %{status.stats.users.total > 0 ? Math.round((status.stats.users.phoneVerified / status.stats.users.total) * 100) : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Aktif Kullanıcı</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.active}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            %{status.stats.users.total > 0 ? Math.round((status.stats.users.active / status.stats.users.total) * 100) : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Askıya Alınmış</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.users.suspended}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            dondurulmuş: {status.stats.users.frozen}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Güvenlik Logları</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.securityLogs}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">son 7 gün</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Bekleyen Davet</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.pendingInvites}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">org daveti</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Yeni Kullanıcılar (7 Gün)
          </h3>
          <div className="space-y-3">
            {status.charts.usersByDay.map((day, index) => {
              const count = Number(day.count);
              const maxCount = Math.max(...status.charts.usersByDay.map(d => Number(d.count)), 1);
              const percentage = (count / maxCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400 text-xs w-14">
                    {format(new Date(day.date), "dd MMM", { locale: tr })}
                  </span>
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-slate-900 dark:text-white text-sm w-8 text-right">{count}</span>
                </div>
              );
            })}
            {status.charts.usersByDay.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Veri bulunamadı</p>
            )}
          </div>
        </div>

        {/* Login Activity Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Giriş Aktivitesi (7 Gün)
          </h3>
          <div className="space-y-3">
            {status.charts.loginsByDay.map((day, index) => {
              const count = Number(day.count);
              const maxCount = Math.max(...status.charts.loginsByDay.map(d => Number(d.count)), 1);
              const percentage = (count / maxCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400 text-xs w-14">
                    {format(new Date(day.date), "dd MMM", { locale: tr })}
                  </span>
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-slate-900 dark:text-white text-sm w-8 text-right">{count}</span>
                </div>
              );
            })}
            {status.charts.loginsByDay.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Veri bulunamadı</p>
            )}
          </div>
        </div>

        {/* Trust Level Distribution */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Güven Seviyesi Dağılımı
          </h3>
          <div className="space-y-3">
            {status.charts.trustLevelStats.map((level, index) => {
              const count = Number(level.count);
              const percentage = status.stats.users.total > 0
                ? Math.round((count / status.stats.users.total) * 100)
                : 0;
              const colors: Record<string, string> = {
                GUEST: "from-slate-500 to-slate-400",
                BASIC: "from-blue-500 to-blue-400",
                VERIFIED: "from-green-500 to-green-400",
                TRUSTED: "from-blue-600 to-blue-500",
                VIP: "from-purple-500 to-purple-400",
              };
              const labels: Record<string, string> = {
                GUEST: "Misafir",
                BASIC: "Temel",
                VERIFIED: "Doğrulanmış",
                TRUSTED: "Güvenilir",
                VIP: "VIP",
              };
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400 text-xs w-20">
                    {labels[level.trust_level] || level.trust_level}
                  </span>
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[level.trust_level] || "from-slate-500 to-slate-400"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-slate-900 dark:text-white text-sm w-12 text-right">
                    {count} (%{percentage})
                  </span>
                </div>
              );
            })}
            {status.charts.trustLevelStats.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">Veri bulunamadı</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Database Stats */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Veritabanı İstatistikleri
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white">Toplam Kullanıcı</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {status.stats.users.total}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-slate-900 dark:text-white">Aktif Kullanıcılar</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {status.stats.users.active}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-slate-900 dark:text-white">Askıya Alınmış</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {status.stats.users.suspended}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white">Güvenlik Logları (7 gün)</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {status.stats.securityLogs}
              </span>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Sunucu Bilgileri
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Ortam</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                status.env === "production"
                  ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
              }`}>
                {status.env}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Node.js Sürümü</span>
              <code className="text-blue-600 dark:text-blue-400">{status.nodeVersion}</code>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Platform</span>
              <code className="text-blue-600 dark:text-blue-400">{status.platform}</code>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Heap Kullanımı</span>
              <code className="text-blue-600 dark:text-blue-400">
                {formatBytes(status.memory.heapUsed)}
              </code>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">RSS Bellek</span>
              <code className="text-blue-600 dark:text-blue-400">
                {formatBytes(status.memory.rss)}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Health Check Endpoint */}
      <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sağlık Kontrolü API
        </h3>
        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <code className="text-blue-600 dark:text-blue-400">GET /api/health</code>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                Harici izleme için bu endpoint kullanılabilir
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

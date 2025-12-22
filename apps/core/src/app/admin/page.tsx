import { prisma } from "@hyble/db";
import { Users, UserPlus, Activity, Wallet, Shield, Building2, PenLine, Package, Ticket, BarChart3, ArrowRight, Bell, Mail } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RegistrationChart } from "@/components/admin/RegistrationChart";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import Link from "next/link";

async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekAgo = subDays(now, 7);

  const [
    totalUsers,
    todayRegistrations,
    activeSessions,
    walletStats,
    verifiedUsers,
    secureUsers,
    totalOrganizations,
    pendingSupport,
    totalProducts,
    publishedBlogPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.session.count({
      where: { expires: { gte: now } },
    }),
    prisma.wallet.aggregate({
      _sum: { balance: true },
      _count: true,
    }),
    prisma.user.count({ where: { trustLevel: "VERIFIED" } }),
    prisma.user.count({ where: { trustLevel: "SECURE" } }),
    prisma.organization.count(),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.product.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);

  const registrationData = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const date = subDays(now, 6 - i);
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      });
      return {
        date: format(date, "MMM dd"),
        count,
      };
    })
  );

  const lastWeekStart = subDays(weekAgo, 7);
  const [lastWeekRegistrations, thisWeekRegistrations] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gte: lastWeekStart, lte: weekAgo } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: weekAgo, lte: now } },
    }),
  ]);

  const trend = lastWeekRegistrations > 0
    ? Math.round(((thisWeekRegistrations - lastWeekRegistrations) / lastWeekRegistrations) * 100)
    : thisWeekRegistrations > 0 ? 100 : 0;

  return {
    totalUsers,
    todayRegistrations,
    activeSessions,
    totalWallets: walletStats._count,
    totalBalance: walletStats._sum.balance || 0,
    registrationData,
    trend,
    verifiedUsers,
    secureUsers,
    totalOrganizations,
    pendingSupport,
    totalProducts,
    publishedBlogPosts,
  };
}

async function RecentUsersTable() {
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Kullanıcı</th>
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Rol</th>
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Durum</th>
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Kayıt Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id} className="border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="py-3 px-4">
                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">{user.name || "İsimsiz"}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">{user.email}</p>
                  </div>
                </Link>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin" ? "bg-purple-500/20 text-purple-600 dark:text-purple-400" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}>
                  {user.role === "admin" ? "Admin" : "Kullanıcı"}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.emailVerified ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                }`}>
                  {user.emailVerified ? "Doğrulanmış" : "Beklemede"}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {format(user.createdAt, "dd MMM yyyy")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ href, icon: Icon, title, description, color }: {
  href: string;
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Hoş geldiniz, {session.user?.name || "Admin"}. İşte güncel durum.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: stats.trend, isPositive: stats.trend >= 0 }}
        />
        <StatsCard
          title="Bugünkü Kayıtlar"
          value={stats.todayRegistrations}
          icon={UserPlus}
          description="Bugün yeni kayıt"
        />
        <StatsCard
          title="Aktif Oturum"
          value={stats.activeSessions}
          icon={Activity}
          description="Şu an aktif"
        />
        <StatsCard
          title="Toplam Cüzdan"
          value={stats.totalWallets}
          icon={Wallet}
          description={`$${stats.totalBalance.toFixed(2)} toplam bakiye`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.verifiedUsers}</p>
              <p className="text-xs text-slate-500">Doğrulanmış</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.secureUsers}</p>
              <p className="text-xs text-slate-500">2FA Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalOrganizations}</p>
              <p className="text-xs text-slate-500">Organizasyon</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.pendingSupport}</p>
              <p className="text-xs text-slate-500">Açık Destek</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/admin/users"
            icon={Users}
            title="Kullanıcılar"
            description={`${stats.totalUsers} kullanıcı`}
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <QuickActionCard
            href="/admin/blog/new"
            icon={PenLine}
            title="Blog Yazısı Ekle"
            description={`${stats.publishedBlogPosts} yayında`}
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
          <QuickActionCard
            href="/admin/pim"
            icon={Package}
            title="Ürünler"
            description={`${stats.totalProducts} ürün`}
            color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          />
          <QuickActionCard
            href="/admin/analytics"
            icon={BarChart3}
            title="Analitik"
            description="Detaylı istatistikler"
            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
        </div>
      </div>

      <RegistrationChart data={stats.registrationData} />

      {/* Recent Users Table */}
      <div className="mt-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Son Kullanıcılar</h3>
          <Link
            href="/admin/users"
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentUsersTable />
      </div>
    </div>
  );
}

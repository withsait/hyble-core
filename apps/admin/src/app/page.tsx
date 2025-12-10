import { prisma } from "@hyble/database";
import { Users, UserPlus, Activity, Wallet } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { RegistrationChart } from "@/components/RegistrationChart";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekAgo = subDays(now, 7);

  const totalUsers = await prisma.user.count();

  const todayRegistrations = await prisma.user.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const activeSessions = await prisma.session.count({
    where: {
      expires: {
        gte: now,
      },
    },
  });

  const walletStats = await prisma.wallet.aggregate({
    _sum: {
      balance: true,
    },
    _count: true,
  });

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
  const lastWeekRegistrations = await prisma.user.count({
    where: {
      createdAt: {
        gte: lastWeekStart,
        lte: weekAgo,
      },
    },
  });

  const thisWeekRegistrations = await prisma.user.count({
    where: {
      createdAt: {
        gte: weekAgo,
        lte: now,
      },
    },
  });

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
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Kullanıcı</th>
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Rol</th>
            <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium text-sm">Kayıt Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id} className="border-b border-slate-200/50 dark:border-slate-800/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">{user.name || "İsimsiz"}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin" ? "bg-purple-500/20 text-purple-600 dark:text-purple-400" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}>
                  {user.role === "admin" ? "Admin" : "Kullanıcı"}
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

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
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

      <RegistrationChart data={stats.registrationData} />

      <div className="mt-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Son Kullanıcılar</h3>
        <RecentUsersTable />
      </div>
    </div>
  );
}

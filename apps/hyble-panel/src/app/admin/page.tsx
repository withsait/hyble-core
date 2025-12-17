"use client";

import Link from "next/link";
import { Card } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Users,
  CreditCard,
  Cloud,
  Ticket,
  Activity,
  Bot,
  Package,
  Mail,
  Globe,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Server,
  Bell,
  Shield,
  Building2,
  UserX,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  href: string;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, change, icon, href, color, loading }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
            {change !== undefined && !loading && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change >= 0 ? "+" : ""}{change}% bu ay
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickLink({ title, description, icon, href, color }: QuickLinkProps) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  // Real data from tRPC
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getDashboardStats.useQuery();
  const { data: systemStats, isLoading: systemLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: pendingDeletions } = trpc.admin.getPendingDeletions.useQuery({ page: 1, limit: 5 });
  const { data: recentBans } = trpc.admin.listBans.useQuery({ page: 1, limit: 5, activeOnly: true });

  const isLoading = statsLoading || systemLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Secret Panel</h1>
          <p className="text-muted-foreground mt-1">
            Hoş geldiniz! İşte platformunuzun genel durumu.
          </p>
        </div>
        <button
          onClick={() => refetchStats()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={dashboardStats?.users.total ?? 0}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          href="/admin/users"
          color="bg-blue-100 dark:bg-blue-900/30"
          loading={isLoading}
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={dashboardStats?.users.active ?? 0}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          href="/admin/users?status=ACTIVE"
          color="bg-green-100 dark:bg-green-900/30"
          loading={isLoading}
        />
        <StatCard
          title="Organizasyon"
          value={dashboardStats?.organizations ?? 0}
          icon={<Building2 className="h-5 w-5 text-purple-600" />}
          href="/admin/users"
          color="bg-purple-100 dark:bg-purple-900/30"
          loading={isLoading}
        />
        <StatCard
          title="Yasaklı"
          value={dashboardStats?.users.banned ?? 0}
          icon={<UserX className="h-5 w-5 text-red-600" />}
          href="/admin/users?status=BANNED"
          color="bg-red-100 dark:bg-red-900/30"
          loading={isLoading}
        />
        <StatCard
          title="24s Giriş"
          value={dashboardStats?.recentLogins24h ?? 0}
          icon={<Activity className="h-5 w-5 text-cyan-600" />}
          href="/admin/watch"
          color="bg-cyan-100 dark:bg-cyan-900/30"
          loading={isLoading}
        />
        <StatCard
          title="2FA Aktif"
          value={systemStats?.security.twoFactorEnabled ?? 0}
          icon={<Shield className="h-5 w-5 text-amber-600" />}
          href="/admin/users"
          color="bg-amber-100 dark:bg-amber-900/30"
          loading={isLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bugün Kayıt</p>
              <p className="text-lg font-bold text-green-600">
                {isLoading ? "..." : systemStats?.newUsers.today ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bu Hafta</p>
              <p className="text-lg font-bold text-blue-600">
                {isLoading ? "..." : systemStats?.newUsers.week ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Başarılı Giriş</p>
              <p className="text-lg font-bold text-purple-600">
                {isLoading ? "..." : systemStats?.logins.successToday ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Başarısız Giriş</p>
              <p className="text-lg font-bold text-red-600">
                {isLoading ? "..." : systemStats?.logins.failedToday ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <QuickLink
              title="Kullanıcılar"
              description="Kullanıcı yönetimi"
              icon={<Users className="h-5 w-5 text-blue-600" />}
              href="/admin/users"
              color="bg-blue-100 dark:bg-blue-900/30"
            />
            <QuickLink
              title="Ürünler (PIM)"
              description="Ürün kataloğu"
              icon={<Package className="h-5 w-5 text-amber-600" />}
              href="/admin/pim"
              color="bg-amber-100 dark:bg-amber-900/30"
            />
            <QuickLink
              title="Cloud Hosting"
              description="Site yönetimi"
              icon={<Cloud className="h-5 w-5 text-purple-600" />}
              href="/admin/cloud"
              color="bg-purple-100 dark:bg-purple-900/30"
            />
            <QuickLink
              title="Destek Talepleri"
              description="Ticket sistemi"
              icon={<Ticket className="h-5 w-5 text-orange-600" />}
              href="/admin/support"
              color="bg-orange-100 dark:bg-orange-900/30"
            />
            <QuickLink
              title="Email Logları"
              description="Gönderilen emailler"
              icon={<Mail className="h-5 w-5 text-red-600" />}
              href="/admin/emails"
              color="bg-red-100 dark:bg-red-900/30"
            />
            <QuickLink
              title="Durum Sayfası"
              description="Servis durumları"
              icon={<Globe className="h-5 w-5 text-emerald-600" />}
              href="/admin/status"
              color="bg-emerald-100 dark:bg-emerald-900/30"
            />
            <QuickLink
              title="Monitoring"
              description="Sistem izleme"
              icon={<Activity className="h-5 w-5 text-cyan-600" />}
              href="/admin/watch"
              color="bg-cyan-100 dark:bg-cyan-900/30"
            />
            <QuickLink
              title="Hyla AI"
              description="AI asistan yönetimi"
              icon={<Bot className="h-5 w-5 text-pink-600" />}
              href="/admin/hyla"
              color="bg-pink-100 dark:bg-pink-900/30"
            />
            <QuickLink
              title="Bildirimler"
              description="Bildirim şablonları"
              icon={<Bell className="h-5 w-5 text-indigo-600" />}
              href="/admin/notifications"
              color="bg-indigo-100 dark:bg-indigo-900/30"
            />
            <QuickLink
              title="Ayarlar"
              description="Sistem yapılandırması"
              icon={<Settings className="h-5 w-5 text-slate-600" />}
              href="/admin/settings"
              color="bg-slate-100 dark:bg-slate-800"
            />
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Bans */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Aktif Yasaklar
            </h2>
            <div className="space-y-3">
              {recentBans?.bans && recentBans.bans.length > 0 ? (
                recentBans.bans.slice(0, 5).map((ban) => (
                  <div key={ban.id} className="flex items-start gap-3 text-sm">
                    <div className={`p-1 rounded ${
                      ban.type === "PERMANENT" ? "bg-red-100" :
                      ban.type === "TEMPORARY" ? "bg-yellow-100" : "bg-slate-100"
                    }`}>
                      <UserX className={`h-3 w-3 ${
                        ban.type === "PERMANENT" ? "text-red-600" :
                        ban.type === "TEMPORARY" ? "text-yellow-600" : "text-slate-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ban.user?.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{ban.reason}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      ban.type === "PERMANENT" ? "bg-red-100 text-red-700" :
                      ban.type === "TEMPORARY" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {ban.type === "PERMANENT" ? "Kalıcı" :
                       ban.type === "TEMPORARY" ? "Geçici" : "Gölge"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aktif yasak bulunmuyor
                </p>
              )}
            </div>
          </Card>

          {/* Pending Deletions */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Bekleyen Silmeler
            </h2>
            <div className="space-y-2">
              {pendingDeletions?.deletions && pendingDeletions.deletions.length > 0 ? (
                pendingDeletions.deletions.map((deletion) => (
                  <Link key={deletion.id} href={`/admin/users/${deletion.userId}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{deletion.user?.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(deletion.scheduledAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Bekleyen silme isteği yok
                </p>
              )}
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/10">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">Sistemler Sağlıklı</h3>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Tüm servisler normal çalışıyor
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

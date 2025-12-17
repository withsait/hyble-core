"use client";

import Link from "next/link";
import { Card } from "@hyble/ui";
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
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function StatCard({ title, value, change, icon, href, color }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
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
  // Mock stats - will be replaced with tRPC query
  const stats = {
    users: { total: 1234, change: 12 },
    revenue: { total: "€45,678", change: 8 },
    sites: { total: 213, change: 15 },
    tickets: { open: 23, change: -5 },
    monitors: { up: 12, total: 12 },
    aiChats: { total: 1543, change: 22 },
  };

  const recentAlerts = [
    { id: 1, type: "warning", message: "CPU kullanımı %85'in üzerinde", time: "5 dk önce" },
    { id: 2, type: "success", message: "Tüm sistemler normal", time: "1 saat önce" },
    { id: 3, type: "info", message: "Yeni destek talebi: #TKT-1234", time: "2 saat önce" },
  ];

  const pendingTasks = [
    { id: 1, title: "5 fatura onay bekliyor", href: "/admin/billing" },
    { id: 2, title: "3 yeni kullanıcı doğrulama bekliyor", href: "/admin/users" },
    { id: 3, title: "2 domain DNS doğrulaması bekliyor", href: "/admin/cloud" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Secret Panel</h1>
        <p className="text-muted-foreground mt-1">
          Hoş geldiniz! İşte platformunuzun genel durumu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.users.total}
          change={stats.users.change}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          href="/admin/users"
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Bu Ay Gelir"
          value={stats.revenue.total}
          change={stats.revenue.change}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          href="/admin/billing"
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Aktif Site"
          value={stats.sites.total}
          change={stats.sites.change}
          icon={<Cloud className="h-5 w-5 text-purple-600" />}
          href="/admin/cloud"
          color="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title="Açık Ticket"
          value={stats.tickets.open}
          change={stats.tickets.change}
          icon={<Ticket className="h-5 w-5 text-orange-600" />}
          href="/admin/support"
          color="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          title="Sistem Durumu"
          value={`${stats.monitors.up}/${stats.monitors.total}`}
          icon={<Activity className="h-5 w-5 text-cyan-600" />}
          href="/admin/watch"
          color="bg-cyan-100 dark:bg-cyan-900/30"
        />
        <StatCard
          title="AI Sohbet"
          value={stats.aiChats.total}
          change={stats.aiChats.change}
          icon={<Bot className="h-5 w-5 text-pink-600" />}
          href="/admin/hyla"
          color="bg-pink-100 dark:bg-pink-900/30"
        />
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
          {/* Recent Alerts */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Son Uyarılar
            </h2>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 text-sm">
                  {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                  {alert.type === "info" && <Bell className="h-4 w-4 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p>{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Bekleyen İşlemler
            </h2>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <Link key={task.id} href={task.href}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-sm">{task.title}</span>
                  </div>
                </Link>
              ))}
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

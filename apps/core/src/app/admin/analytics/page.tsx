"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  DollarSign,
  ShoppingBag,
  Eye,
  Calendar,
  RefreshCw,
  Download,
  Loader2,
  ArrowUpRight,
  Activity,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  newUsers: number;
  totalWebsites: number;
  activeWebsites: number;
  totalRevenue: number;
  totalOrders: number;
  totalDeployments: number;
  avgSessionDuration: number;
}

interface DailySignup {
  date: string;
  signups: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    newUsers: 0,
    totalWebsites: 0,
    activeWebsites: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalDeployments: 0,
    avgSessionDuration: 0,
  });
  const [dailySignups, setDailySignups] = useState<DailySignup[]>([]);

  useEffect(() => {
    // In production, fetch from tRPC
    setLoading(false);
    setDailySignups([]);
  }, [period]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
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
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats.newUsers}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam Kullanıcı
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.totalWebsites.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam Web Sitesi ({stats.activeWebsites} aktif)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +22%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            €{stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam Gelir
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +18%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.totalOrders.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam Sipariş
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {stats.totalDeployments}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Deployment (bu dönem)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {Math.floor(stats.avgSessionDuration / 60)}:{(stats.avgSessionDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Ortalama Oturum Süresi
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {stats.newUsers}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Yeni Kayıt (bu dönem)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Kullanıcı Kayıtları
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Günlük Kayıt</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : dailySignups.length > 0 ? (
          <div className="h-64 flex items-end gap-1">
            {dailySignups.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-amber-500 rounded-t hover:bg-amber-600 transition-colors cursor-pointer"
                  style={{
                    height: `${Math.max(4, (day.signups / Math.max(...dailySignups.map(d => d.signups))) * 200)}px`
                  }}
                  title={`${day.date}: ${day.signups} kayıt`}
                />
                <span className="text-xs text-slate-400">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Bu dönem için veri bulunmuyor
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Platform Durumu
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                API Durumu
              </span>
              <span className="text-sm text-green-600">Çalışıyor</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Veritabanı
              </span>
              <span className="text-sm text-green-600">Sağlıklı</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                CDN
              </span>
              <span className="text-sm text-green-600">Aktif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Email Servisi
              </span>
              <span className="text-sm text-green-600">Çalışıyor</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Gelir Dağılımı
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Web Hosting</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Template Satışları</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">30%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Freelancer Komisyonları</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">15%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Diğer</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">10%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

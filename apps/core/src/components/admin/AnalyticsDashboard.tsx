"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    totalRevenue: number;
    totalOrders: number;
  };
  trends: {
    visitors: { value: number; change: number };
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    conversion: { value: number; change: number };
  };
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geoData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  hourlyTraffic: number[];
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "sales" | "behavior">("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trpc/analytics.getDashboard?input=${encodeURIComponent(JSON.stringify({ json: { range: dateRange } }))}`);
      const result = await response.json();
      if (result.result?.data) {
        setData(result.result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500">
        Veri yüklenemedi
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-slate-500">
                Site performansı ve kullanıcı davranışları
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
            >
              <option value="today">Bugün</option>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 90 Gün</option>
              <option value="year">Bu Yıl</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400">
              <Download className="w-4 h-4" />
              Rapor İndir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { key: "overview", label: "Genel Bakış" },
            { key: "traffic", label: "Trafik" },
            { key: "sales", label: "Satışlar" },
            { key: "behavior", label: "Davranış" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  data.trends.visitors.change >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {data.trends.visitors.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(data.trends.visitors.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(data.overview.uniqueVisitors)}
              </p>
              <p className="text-sm text-slate-500">Tekil Ziyaretçi</p>
            </div>

            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  data.trends.revenue.change >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {data.trends.revenue.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(data.trends.revenue.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(data.overview.totalRevenue)}
              </p>
              <p className="text-sm text-slate-500">Toplam Gelir</p>
            </div>

            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  data.trends.orders.change >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {data.trends.orders.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(data.trends.orders.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.overview.totalOrders}
              </p>
              <p className="text-sm text-slate-500">Toplam Sipariş</p>
            </div>

            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  data.trends.conversion.change >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {data.trends.conversion.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(data.trends.conversion.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.overview.conversionRate.toFixed(2)}%
              </p>
              <p className="text-sm text-slate-500">Dönüşüm Oranı</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Gelir Trendi
              </h4>
              <div className="h-64 flex items-end gap-2">
                {data.dailyRevenue.slice(-14).map((day, i) => {
                  const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue));
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${formatCurrency(day.revenue)}`}
                      />
                      <span className="text-xs text-slate-400 rotate-45 origin-left">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Trafik Kaynakları
              </h4>
              <div className="space-y-4">
                {data.trafficSources.map((source, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{source.source}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {source.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Device Breakdown */}
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Cihaz Dağılımı
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Masaüstü</span>
                      <span className="text-sm font-medium">{data.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.deviceBreakdown.desktop}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mobil</span>
                      <span className="text-sm font-medium">{data.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.deviceBreakdown.mobile}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Tablet className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tablet</span>
                      <span className="text-sm font-medium">{data.deviceBreakdown.tablet}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.deviceBreakdown.tablet}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                En Çok Ziyaret Edilen Sayfalar
              </h4>
              <div className="space-y-3">
                {data.topPages.slice(0, 5).map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 w-5">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                          {page.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{page.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatNumber(page.views)}
                      </p>
                      <p className="text-xs text-slate-400">{formatDuration(page.avgTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Coğrafi Dağılım
              </h4>
              <div className="space-y-3">
                {data.geoData.slice(0, 5).map((geo, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{geo.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${geo.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                        {geo.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Traffic Tab */}
      {activeTab === "traffic" && (
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Saatlik Trafik Dağılımı
          </h4>
          <div className="h-64 flex items-end gap-1">
            {data.hourlyTraffic.map((count, hour) => {
              const maxTraffic = Math.max(...data.hourlyTraffic);
              const height = maxTraffic > 0 ? (count / maxTraffic) * 100 : 0;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-400 hover:bg-blue-500 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                    title={`${hour}:00 - ${count} ziyaretçi`}
                  />
                  <span className="text-xs text-slate-400 mt-1">{hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Satış İstatistikleri
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(data.overview.totalRevenue / data.overview.totalOrders)}
                </p>
                <p className="text-sm text-slate-500">Ortalama Sipariş</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.overview.conversionRate.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-500">Dönüşüm Oranı</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.overview.totalOrders}
                </p>
                <p className="text-sm text-slate-500">Toplam Sipariş</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(data.overview.totalRevenue)}
                </p>
                <p className="text-sm text-slate-500">Toplam Gelir</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Günlük Siparişler
            </h4>
            <div className="h-48 flex items-end gap-2">
              {data.dailyRevenue.slice(-14).map((day, i) => {
                const maxOrders = Math.max(...data.dailyRevenue.map(d => d.orders));
                const height = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 hover:bg-green-600 rounded-t transition-colors"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                      title={`${day.orders} sipariş`}
                    />
                    <span className="text-xs text-slate-400 mt-1">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Behavior Tab */}
      {activeTab === "behavior" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Kullanıcı Davranışları
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <div>
                  <p className="text-sm text-slate-500">Ortalama Oturum Süresi</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {formatDuration(data.overview.avgSessionDuration)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <div>
                  <p className="text-sm text-slate-500">Hemen Çıkma Oranı</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {data.overview.bounceRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl">
                <div>
                  <p className="text-sm text-slate-500">Sayfa / Oturum</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {(data.overview.pageViews / data.overview.totalVisitors).toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              En Popüler Sayfalar
            </h4>
            <div className="space-y-2">
              {data.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{page.title}</p>
                      <p className="text-xs text-slate-400">{page.path}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatNumber(page.views)} görüntüleme
                    </p>
                    <p className="text-xs text-slate-400">Ort. {formatDuration(page.avgTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

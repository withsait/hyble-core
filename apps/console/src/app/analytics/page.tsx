// @ts-nocheck
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Globe,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
} from "lucide-react";

type Period = "7d" | "30d" | "90d";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function calculateChange(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: current > 0 ? "+100%" : "0%", positive: current > 0 };
  const change = ((current - previous) / previous) * 100;
  return {
    value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    positive: change >= 0,
  };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading, refetch, isFetching } = trpc.analytics.getUserStats.useQuery(
    { period },
    { refetchOnWindowFocus: false }
  );

  const pageViewsChange = data ? calculateChange(data.totalPageViews, data.previousPeriod.pageViews) : null;
  const visitorsChange = data ? calculateChange(data.totalUniqueVisitors, data.previousPeriod.uniqueVisitors) : null;

  const stats = data ? [
    {
      label: "Toplam Ziyaretci",
      value: data.totalUniqueVisitors.toLocaleString(),
      change: visitorsChange,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Sayfa Goruntuleme",
      value: data.totalPageViews.toLocaleString(),
      change: pageViewsChange,
      icon: Eye,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Ort. Oturum Suresi",
      value: formatDuration(data.avgSessionDuration),
      change: null,
      icon: Clock,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Hemen Cikma Orani",
      value: `${data.avgBounceRate.toFixed(1)}%`,
      change: null,
      icon: BarChart3,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
  ] : [];

  const deviceIcons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Analitik
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {data?.websiteCount || 0} web sitesi icin toplam istatistikler
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p === "7d" ? "7 Gun" : p === "30d" ? "30 Gun" : "90 Gun"}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !data || data.websiteCount === 0 ? (
        <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Henuz veri yok
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Web siteleriniz trafik almaya basladiginda burada istatistikler gorunecek.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {stat.change && (
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          stat.change.positive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change.positive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {stat.change.value}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Chart and Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traffic Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Trafik Trendi
              </h2>
              {data.daily.length > 0 ? (
                <div className="h-64">
                  <div className="flex items-end justify-between h-full gap-1">
                    {data.daily.map((day, index) => {
                      const maxViews = Math.max(...data.daily.map((d) => d.pageViews));
                      const height = maxViews > 0 ? (day.pageViews / maxViews) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                            style={{ height: `${height}%`, minHeight: day.pageViews > 0 ? "4px" : "0" }}
                            title={`${day.date}: ${day.pageViews} goruntuleme`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{data.daily[0]?.date}</span>
                    <span>{data.daily[data.daily.length - 1]?.date}</span>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Grafik verisi yok
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Traffic Sources & Devices */}
            <div className="space-y-6">
              {/* Sources */}
              <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Trafik Kaynaklari
                </h2>
                {data.sources.length > 0 ? (
                  <div className="space-y-3">
                    {data.sources.map(([source, count], index) => {
                      const total = data.sources.reduce((sum, [, c]) => sum + c, 0);
                      const percent = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300 truncate">
                              {source}
                            </span>
                            <span className="text-slate-500">{percent.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Kaynak verisi yok
                  </p>
                )}
              </div>

              {/* Devices */}
              <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Cihazlar
                </h2>
                {data.devices.length > 0 ? (
                  <div className="space-y-3">
                    {data.devices.map(([device, count], index) => {
                      const total = data.devices.reduce((sum, [, c]) => sum + c, 0);
                      const percent = total > 0 ? (count / total) * 100 : 0;
                      const DeviceIcon = deviceIcons[device] || Monitor;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                              {device}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500">{percent.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cihaz verisi yok
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                En Cok Ziyaret Edilen Sayfalar
              </h2>
            </div>
            {data.topPages.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {data.topPages.map((page, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0d0d14]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-900 dark:text-white">{page.path}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">
                      {page.views.toLocaleString()} goruntuleme
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Sayfa verisi yok
              </div>
            )}
          </div>

          {/* Countries */}
          {data.countries.length > 0 && (
            <div className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Ulkelere Gore Ziyaretciler
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.countries.map(([country, count], index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center"
                  >
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {count.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

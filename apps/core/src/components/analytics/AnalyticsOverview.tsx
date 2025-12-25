"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Globe,
  MousePointer,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Facebook,
  Twitter,
  Linkedin,
  Share2,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

interface AnalyticsOverviewProps {
  siteId?: string;
}

// Mock data
const overviewStats = {
  visitors: { value: 12450, change: 12.5, period: "vs last month" },
  pageViews: { value: 45230, change: -3.2, period: "vs last month" },
  bounceRate: { value: 42.3, change: -5.1, period: "vs last month" },
  avgSession: { value: "2m 45s", change: 8.3, period: "vs last month" },
  conversions: { value: 324, change: 15.7, period: "vs last month" },
  revenue: { value: 15420, change: 22.3, period: "vs last month" },
};

const topPages = [
  { path: "/", title: "Home", views: 12450, uniqueViews: 8920, avgTime: "1:45" },
  { path: "/products", title: "Products", views: 8340, uniqueViews: 6120, avgTime: "3:20" },
  { path: "/about", title: "About Us", views: 4560, uniqueViews: 3890, avgTime: "2:10" },
  { path: "/contact", title: "Contact", views: 2340, uniqueViews: 2100, avgTime: "1:30" },
  { path: "/blog", title: "Blog", views: 1890, uniqueViews: 1560, avgTime: "4:15" },
];

const trafficSources = [
  { source: "Organic Search", visitors: 5420, percentage: 43.5 },
  { source: "Direct", visitors: 3210, percentage: 25.8 },
  { source: "Social Media", visitors: 2140, percentage: 17.2 },
  { source: "Referral", visitors: 1120, percentage: 9.0 },
  { source: "Email", visitors: 560, percentage: 4.5 },
];

const deviceStats = [
  { device: "Desktop", percentage: 58, icon: Monitor },
  { device: "Mobile", percentage: 35, icon: Smartphone },
  { device: "Tablet", percentage: 7, icon: Tablet },
];

const geoData = [
  { country: "Turkey", visitors: 6840, percentage: 54.9 },
  { country: "United States", visitors: 2120, percentage: 17.0 },
  { country: "Germany", visitors: 1450, percentage: 11.6 },
  { country: "United Kingdom", visitors: 890, percentage: 7.1 },
  { country: "Other", visitors: 1150, percentage: 9.4 },
];

const realtimeVisitors = 42;

export function AnalyticsOverview({ siteId }: AnalyticsOverviewProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your website performance and user behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw
              size={18}
              className={`text-gray-600 dark:text-gray-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Realtime visitors */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-lg font-medium">
              {realtimeVisitors} visitors right now
            </span>
          </div>
          <a href="#" className="text-sm hover:underline flex items-center gap-1">
            View realtime <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-6 gap-4">
        {[
          {
            label: "Total Visitors",
            value: overviewStats.visitors.value,
            change: overviewStats.visitors.change,
            icon: Users,
            color: "blue",
          },
          {
            label: "Page Views",
            value: overviewStats.pageViews.value,
            change: overviewStats.pageViews.change,
            icon: Eye,
            color: "purple",
          },
          {
            label: "Bounce Rate",
            value: `${overviewStats.bounceRate.value}%`,
            change: overviewStats.bounceRate.change,
            icon: Target,
            color: "yellow",
            inverseChange: true,
          },
          {
            label: "Avg. Session",
            value: overviewStats.avgSession.value,
            change: overviewStats.avgSession.change,
            icon: Clock,
            color: "green",
          },
          {
            label: "Conversions",
            value: overviewStats.conversions.value,
            change: overviewStats.conversions.change,
            icon: ShoppingCart,
            color: "orange",
          },
          {
            label: "Revenue",
            value: `₺${formatNumber(overviewStats.revenue.value)}`,
            change: overviewStats.revenue.change,
            icon: DollarSign,
            color: "pink",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : stat.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : stat.color === "yellow"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : stat.color === "green"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : stat.color === "orange"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : "bg-pink-100 dark:bg-pink-900/30"
                }`}
              >
                <stat.icon
                  size={20}
                  className={
                    stat.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : stat.color === "purple"
                      ? "text-purple-600 dark:text-purple-400"
                      : stat.color === "yellow"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : stat.color === "green"
                      ? "text-green-600 dark:text-green-400"
                      : stat.color === "orange"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-pink-600 dark:text-pink-400"
                  }
                />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  (stat.inverseChange ? stat.change < 0 : stat.change > 0)
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {(stat.inverseChange ? stat.change < 0 : stat.change > 0) ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Traffic chart placeholder */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Traffic Overview
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Visitors</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Page Views</span>
              </label>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart visualization</p>
          </div>
        </div>

        {/* Traffic sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Traffic Sources
          </h2>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {source.source}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {source.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      index === 0
                        ? "bg-blue-500"
                        : index === 1
                        ? "bg-purple-500"
                        : index === 2
                        ? "bg-green-500"
                        : index === 3
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Top pages */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Top Pages
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Page
                </th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">
                  Views
                </th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">
                  Unique
                </th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">
                  Avg. Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topPages.map((page, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {page.title}
                    </p>
                    <p className="text-sm text-gray-500">{page.path}</p>
                  </td>
                  <td className="p-4 text-right text-gray-900 dark:text-white">
                    {formatNumber(page.views)}
                  </td>
                  <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                    {formatNumber(page.uniqueViews)}
                  </td>
                  <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                    {page.avgTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Device & Geo */}
        <div className="space-y-6">
          {/* Devices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Devices
            </h2>
            <div className="space-y-3">
              {deviceStats.map((device, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <device.icon size={16} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {device.device}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geography */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Top Countries
            </h2>
            <div className="space-y-3">
              {geoData.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {country.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatNumber(country.visitors)}
                    </span>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverview;

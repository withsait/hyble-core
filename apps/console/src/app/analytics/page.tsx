"use client";

import { Card } from "@hyble/ui";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Globe,
} from "lucide-react";

export default function AnalyticsPage() {
  // Mock data for demonstration
  const stats = [
    { label: "Toplam Ziyaretçi", value: "12,345", change: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Sayfa Görüntüleme", value: "45,678", change: "+8%", icon: Eye, color: "text-green-600" },
    { label: "Ort. Oturum Süresi", value: "3:45", change: "+5%", icon: Clock, color: "text-purple-600" },
    { label: "Hemen Çıkma Oranı", value: "42%", change: "-3%", icon: BarChart3, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Analitik
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Web sitelerinizin performansını izleyin
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Chart Placeholder */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Ziyaretçi Grafiği
          </h2>
          <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">
                Grafik verisi yükleniyor...
              </p>
            </div>
          </div>
        </Card>

        {/* Top Pages */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            En Çok Ziyaret Edilen Sayfalar
          </h2>
          <div className="space-y-4">
            {[
              { path: "/", views: 5234 },
              { path: "/store", views: 3456 },
              { path: "/about", views: 2345 },
              { path: "/contact", views: 1234 },
              { path: "/blog", views: 987 },
            ].map((page, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{page.path}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400">
                  {page.views.toLocaleString()} görüntüleme
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

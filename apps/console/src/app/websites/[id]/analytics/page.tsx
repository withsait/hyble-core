"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Globe,
} from "lucide-react";

export default function WebsiteAnalyticsPage() {
  const params = useParams();
  const websiteId = params.id as string;

  // Mock data
  const stats = [
    { label: "Toplam Ziyaretçi", value: "4,567", change: "+15%", icon: Users, color: "text-blue-600" },
    { label: "Sayfa Görüntüleme", value: "12,345", change: "+10%", icon: Eye, color: "text-green-600" },
    { label: "Ort. Oturum Süresi", value: "4:12", change: "+8%", icon: Clock, color: "text-purple-600" },
    { label: "Hemen Çıkma Oranı", value: "38%", change: "-5%", icon: BarChart3, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/websites"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Site Analitikleri
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Bu web sitesinin performans metrikleri
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
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800">
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
            Ziyaretçi Trendi
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
              { path: "/", views: 2345 },
              { path: "/about", views: 1234 },
              { path: "/services", views: 876 },
              { path: "/contact", views: 543 },
              { path: "/blog", views: 321 },
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

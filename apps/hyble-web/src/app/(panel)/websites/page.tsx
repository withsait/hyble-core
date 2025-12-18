"use client";

import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Globe,
  Plus,
  ExternalLink,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CREATING: { label: "Oluşturuluyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  SUSPENDED: { label: "Askıda", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertTriangle },
  ERROR: { label: "Hata", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertTriangle },
};

// Mock data
const websites = [
  {
    id: "1",
    name: "My Business Site",
    domain: "mybusiness.hyble.co",
    status: "ACTIVE",
    views: 1234,
    updatedAt: "2 gün önce"
  },
  {
    id: "2",
    name: "E-Commerce Store",
    domain: "mystore.hyble.co",
    status: "ACTIVE",
    views: 5678,
    updatedAt: "1 saat önce"
  },
];

export default function WebsitesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Web Sitelerim
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Web sitelerinizi yönetin
            </p>
          </div>
          <Link
            href="/websites/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yeni Site
          </Link>
        </div>

        {/* Websites Grid */}
        {websites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((site) => {
              const status = statusConfig[site.status] ?? statusConfig.ACTIVE!;
              const StatusIcon = status!.icon;
              return (
                <Card key={site.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {site.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {site.domain}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {site.views.toLocaleString()} ziyaret
                    </span>
                    <span>{site.updatedAt}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/websites/${site.id}/editor`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Düzenle
                    </Link>
                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </a>
                    <Link
                      href={`/websites/${site.id}/settings`}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-16 text-center">
            <Globe className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Henüz Web Siteniz Yok
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              İlk web sitenizi oluşturarak başlayın.
            </p>
            <Link
              href="/websites/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              İlk Web Sitemi Oluştur
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

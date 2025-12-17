// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  FolderKanban,
  Plus,
  Search,
  Loader2,
  Globe,
  Server,
  Calendar,
  ExternalLink,
  Settings,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  RefreshCw,
} from "lucide-react";

type ProjectStatus = "ACTIVE" | "PAUSED" | "DEPLOYING" | "ERROR";

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  PAUSED: { label: "Duraklatılmış", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  DEPLOYING: { label: "Deploy Ediliyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  ERROR: { label: "Hata", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

// Mock projects data (replace with tRPC when backend ready)
const mockProjects = [
  {
    id: "1",
    name: "portfolio-site",
    domain: "portfolio.hyble.net",
    status: "ACTIVE" as ProjectStatus,
    framework: "Next.js",
    lastDeployAt: new Date("2024-12-15"),
    createdAt: new Date("2024-10-01"),
  },
  {
    id: "2",
    name: "blog-app",
    domain: "blog.hyble.net",
    status: "DEPLOYING" as ProjectStatus,
    framework: "Astro",
    lastDeployAt: new Date("2024-12-17"),
    createdAt: new Date("2024-11-15"),
  },
  {
    id: "3",
    name: "api-service",
    domain: "api.myapp.com",
    status: "PAUSED" as ProjectStatus,
    framework: "Node.js",
    lastDeployAt: new Date("2024-12-10"),
    createdAt: new Date("2024-09-20"),
  },
];

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // In future, use tRPC:
  // const { data, isLoading, refetch } = trpc.project.list.useQuery();

  const projects = mockProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Projeler
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cloud projelerinizi yönetin ve deploy edin.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Yeni Proje
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Proje</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {mockProjects.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {mockProjects.filter((p) => p.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Deploy Sayısı</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Domain</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">3</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Proje veya domain ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">Yükleniyor...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Proje bulunamadı
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm ? "Arama kriterlerine uygun proje yok." : "Henüz bir proje oluşturmadınız."}
            </p>
            {!searchTerm && (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                İlk Projenizi Oluşturun
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {projects.map((project) => {
              const config = statusConfig[project.status];

              return (
                <div
                  key={project.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                        <Server className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <a
                            href={`https://${project.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {project.domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {project.framework}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            Son deploy: {project.lastDeployAt.toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <RefreshCw className="h-4 w-4 text-slate-500" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        {project.status === "ACTIVE" ? (
                          <Pause className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Play className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Settings className="h-4 w-4 text-slate-500" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Deploy Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <FolderKanban className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Hızlı Deploy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              GitHub, GitLab veya Bitbucket'tan projenizi import edin ve saniyeler içinde deploy edin.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Import from Git
              </Link>
              <Link
                href="/docs/deploy"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Dokümantasyon
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

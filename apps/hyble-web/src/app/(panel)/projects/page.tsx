// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
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
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Construction,
  Github,
  GitBranch,
} from "lucide-react";

export default function ProjectsPage() {
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
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Yeni Proje
        </button>
      </div>

      {/* Stats - Placeholder */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Proje</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Deploy Sayısı</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Domain</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">0</p>
        </div>
      </div>

      {/* Construction Notice */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12">
        <div className="text-center">
          <Construction className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Yapım Aşamasında
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Cloud hosting modülü şu anda geliştirme aşamasındadır.
            Site oluşturma, deployment yönetimi ve kaynak izleme özellikleri yakında eklenecektir.
          </p>
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl max-w-lg mx-auto">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Planlanan Özellikler:
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 text-left">
              <li className="flex items-center gap-3">
                <Github className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>GitHub, GitLab, Bitbucket entegrasyonu</span>
              </li>
              <li className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>Otomatik CI/CD pipeline</span>
              </li>
              <li className="flex items-center gap-3">
                <Server className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>Next.js, Astro, Nuxt, Vue, React desteği</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>Custom domain ve otomatik SSL</span>
              </li>
              <li className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>Rollback ve preview deployments</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Deploy Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <FolderKanban className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Alternatif Çözümler
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Cloud hosting modülü hazır olana kadar aşağıdaki platformları kullanabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Vercel
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Netlify
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://railway.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Railway
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

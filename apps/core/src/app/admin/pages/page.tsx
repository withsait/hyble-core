"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  Copy,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const statusConfig: Record<PageStatus, { label: string; color: string }> = {
  DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PUBLISHED: { label: "Yayında", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  ARCHIVED: { label: "Arşivlenmiş", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

// Predefined system pages
const systemPages = [
  { slug: "privacy-policy", title: "Gizlilik Politikası", type: "legal" },
  { slug: "terms-of-service", title: "Kullanım Şartları", type: "legal" },
  { slug: "cookie-policy", title: "Çerez Politikası", type: "legal" },
  { slug: "refund-policy", title: "İade Politikası", type: "legal" },
  { slug: "about", title: "Hakkımızda", type: "info" },
  { slug: "contact", title: "İletişim", type: "info" },
  { slug: "faq", title: "Sık Sorulan Sorular", type: "info" },
];

export default function AdminPagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PageStatus | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // tRPC queries
  const { data: pagesData, isLoading, refetch } = trpc.cms.listPages.useQuery({
    search: searchTerm || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const createPage = trpc.cms.createPage.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      setNewPageTitle("");
      setNewPageSlug("");
      refetch();
    },
  });

  const deletePage = trpc.cms.deletePage.useMutation({
    onSuccess: () => refetch(),
  });

  const pages = pagesData?.pages ?? [];

  const handleCreatePage = () => {
    if (!newPageTitle || !newPageSlug) return;
    createPage.mutate({
      title: newPageTitle,
      slug: newPageSlug,
      content: "",
      status: "DRAFT",
    });
  };

  const handleDeletePage = (id: string, title: string) => {
    if (confirm(`"${title}" sayfasını silmek istediğinize emin misiniz?`)) {
      deletePage.mutate({ id });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <FileText className="h-7 w-7 text-blue-600" />
            Sayfa Yönetimi (CMS)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Statik sayfaları oluşturun ve düzenleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sayfa
          </Button>
        </div>
      </div>

      {/* Quick Templates */}
      <Card className="p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Hızlı Şablonlar</h3>
        <div className="flex flex-wrap gap-2">
          {systemPages.map((page) => {
            const exists = pages.some((p: any) => p.slug === page.slug);
            return (
              <button
                key={page.slug}
                onClick={() => {
                  if (!exists) {
                    setNewPageTitle(page.title);
                    setNewPageSlug(page.slug);
                    setShowCreateModal(true);
                  }
                }}
                disabled={exists}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  exists
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                }`}
              >
                {exists ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {page.title}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Sayfa adı veya slug ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PageStatus | "ALL")}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Pages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Sayfa</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Güncelleme</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 mt-2">Sayfa bulunamadı</p>
                    <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Sayfayı Oluştur
                    </Button>
                  </td>
                </tr>
              ) : (
                pages.map((page: any) => {
                  const config = statusConfig[page.status as PageStatus] || statusConfig.DRAFT;
                  return (
                    <tr key={page.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{page.title}</p>
                        {page.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{page.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            /{page.slug}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(`/${page.slug}`)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            title="Kopyala"
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {format(new Date(page.updatedAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4 text-slate-400" />
                          </Link>
                          {page.status === "PUBLISHED" && (
                            <a
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                              title="Görüntüle"
                            >
                              <ExternalLink className="h-4 w-4 text-slate-400" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeletePage(page.id, page.title)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Yeni Sayfa Oluştur
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sayfa Başlığı
                </label>
                <Input
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    setNewPageSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Örn: Gizlilik Politikası"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Slug (URL)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">/</span>
                  <Input
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="ornek-sayfa"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPageTitle("");
                  setNewPageSlug("");
                }}
              >
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreatePage}
                disabled={createPage.isPending || !newPageTitle || !newPageSlug}
              >
                {createPage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Oluştur"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

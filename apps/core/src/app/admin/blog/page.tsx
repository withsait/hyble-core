"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Star,
  Pin,
  MoreHorizontal,
  Clock,
  CheckCircle,
  Archive,
  Loader2,
  RefreshCw,
  BarChart3,
  Filter,
  ChevronRight,
  Globe,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

interface BlogPostItem {
  id: string;
  slug: string;
  status: string;
  vertical: string;
  titleTr: string;
  titleEn: string;
  thumbnail?: string | null;
  isFeatured: boolean;
  isPinned: boolean;
  viewCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  category?: { id: string; slug: string; nameTr: string; nameEn: string } | null;
}

const statusConfig: Record<PostStatus, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: "Taslak", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: FileText },
  SCHEDULED: { label: "Zamanlanmış", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Calendar },
  PUBLISHED: { label: "Yayında", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  ARCHIVED: { label: "Arşiv", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Archive },
};

const verticalConfig: Record<PostVertical, { label: string; color: string }> = {
  GENERAL: { label: "Genel", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
  DIGITAL: { label: "Digital", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  STUDIOS: { label: "Studios", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function AdminBlogPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [verticalFilter, setVerticalFilter] = useState<PostVertical | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  // tRPC queries
  const { data: statsData, isLoading: statsLoading } = trpc.blog.stats.useQuery();
  const { data: postsData, isLoading: postsLoading, refetch } = trpc.blog.list.useQuery({
    limit: 50,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    vertical: verticalFilter !== "ALL" ? verticalFilter : undefined,
    search: debouncedSearch || undefined,
  });
  const { data: categoriesData } = trpc.blog.listCategories.useQuery({ includeInactive: true });

  // Mutations
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
    },
  });

  const duplicateMutation = trpc.blog.duplicate.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
    },
  });

  const toggleFeaturedMutation = trpc.blog.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
    },
  });

  const togglePinnedMutation = trpc.blog.togglePinned.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
    },
  });

  const publishMutation = trpc.blog.publish.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
    },
  });

  const unpublishMutation = trpc.blog.unpublish.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
    },
  });

  const archiveMutation = trpc.blog.archive.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
    },
  });

  const isLoading = statsLoading || postsLoading;
  const posts = postsData?.posts ?? [];

  const handleDelete = async (id: string) => {
    if (confirm("Bu yazıyı silmek istediğinize emin misiniz?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync({ id });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            Blog Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Blog yazılarını oluşturun, düzenleyin ve yayınlayın
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/blog/categories")}>
            <Filter className="h-4 w-4 mr-2" />
            Kategoriler
          </Button>
          <Button onClick={() => router.push("/admin/blog/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Yazı</p>
          <p className="text-2xl font-bold mt-1">{statsData?.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground">Yayında</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{statsData?.published ?? 0}</p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-700">
          <p className="text-sm text-muted-foreground">Taslak</p>
          <p className="text-2xl font-bold mt-1 text-slate-600">{statsData?.draft ?? 0}</p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground">Zamanlanmış</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{statsData?.scheduled ?? 0}</p>
        </Card>
        <Card className="p-4 border-amber-200 dark:border-amber-800">
          <p className="text-sm text-muted-foreground">Arşiv</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{statsData?.archived ?? 0}</p>
        </Card>
        <Card className="p-4 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Toplam Görüntülenme</p>
              <p className="text-2xl font-bold text-purple-600">
                {statsData?.totalViews?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Vertical Stats */}
      {statsData?.verticalStats && Object.keys(statsData.verticalStats).length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Dikeye Göre Dağılım</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statsData.verticalStats).map(([vertical, count]) => (
              <div
                key={vertical}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${verticalConfig[vertical as PostVertical]?.color || "bg-muted"}`}
              >
                <span>{verticalConfig[vertical as PostVertical]?.label || vertical}</span>
                <span className="font-semibold">{String(count)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Posts */}
      {statsData?.topPosts && statsData.topPosts.length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            En Çok Okunan Yazılar
          </h3>
          <div className="flex flex-wrap gap-3">
            {statsData.topPosts.map((post: { id: string; titleTr: string; viewCount: number }, index: number) => (
              <div
                key={post.id}
                onClick={() => router.push(`/admin/blog/${post.id}`)}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <span className="font-bold text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{post.titleTr}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Başlık veya etiket ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PostStatus | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={verticalFilter}
              onChange={(e) => setVerticalFilter(e.target.value as PostVertical | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Dikeyler</option>
              {Object.entries(verticalConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ALL")}
        >
          Tümü
        </Button>
        <Button
          variant={statusFilter === "DRAFT" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("DRAFT")}
        >
          <FileText className="h-3 w-3 mr-1" />
          Taslaklar
        </Button>
        <Button
          variant={statusFilter === "PUBLISHED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PUBLISHED")}
          className={statusFilter === "PUBLISHED" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Yayında
        </Button>
        <Button
          variant={statusFilter === "SCHEDULED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("SCHEDULED")}
          className={statusFilter === "SCHEDULED" ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Zamanlanmış
        </Button>
        <Button
          variant={statusFilter === "ARCHIVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ARCHIVED")}
          className={statusFilter === "ARCHIVED" ? "bg-amber-600 hover:bg-amber-700" : ""}
        >
          <Archive className="h-3 w-3 mr-1" />
          Arşiv
        </Button>
      </div>

      {/* Posts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-semibold">Yazı</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Dikey</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Görüntülenme</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Tarih</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {postsLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">Blog yazısı bulunamadı</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push("/admin/blog/new")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Yazıyı Oluştur
                    </Button>
                  </td>
                </tr>
              ) : (
                posts.map((post: BlogPostItem) => {
                  const StatusIcon = statusConfig[post.status as PostStatus]?.icon || FileText;
                  return (
                    <tr
                      key={post.id}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {post.thumbnail && (
                            <img
                              src={post.thumbnail}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {post.isPinned && <Pin className="h-3 w-3 text-blue-500" />}
                              {post.isFeatured && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                              <span
                                className="font-medium line-clamp-1 cursor-pointer hover:text-primary"
                                onClick={() => router.push(`/admin/blog/${post.id}`)}
                              >
                                {post.titleTr}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              /{post.slug}
                            </p>
                            {post.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-muted px-1.5 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {post.category ? (
                          <span className="text-sm">{post.category.nameTr}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${verticalConfig[post.vertical as PostVertical]?.color || "bg-muted"}`}>
                          {verticalConfig[post.vertical as PostVertical]?.label || post.vertical}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[post.status as PostStatus]?.color || "bg-muted"}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[post.status as PostStatus]?.label || post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {post.viewCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{format(new Date(post.updatedAt), "d MMM yyyy", { locale: tr })}</span>
                          <span className="text-xs">{format(new Date(post.updatedAt), "HH:mm", { locale: tr })}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {activeDropdown === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-lg shadow-lg z-50">
                              <div className="p-1">
                                <button
                                  onClick={() => {
                                    router.push(`/admin/blog/${post.id}`);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => {
                                    window.open(`/blog/${post.slug}`, "_blank");
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                >
                                  <Globe className="h-4 w-4" />
                                  Sitede Görüntüle
                                </button>
                                <div className="border-t my-1" />
                                <button
                                  onClick={() => {
                                    toggleFeaturedMutation.mutate({ id: post.id });
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                >
                                  <Star className={`h-4 w-4 ${post.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                                  {post.isFeatured ? "Öne Çıkarmayı Kaldır" : "Öne Çıkar"}
                                </button>
                                <button
                                  onClick={() => {
                                    togglePinnedMutation.mutate({ id: post.id });
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                >
                                  <Pin className={`h-4 w-4 ${post.isPinned ? "text-blue-500" : ""}`} />
                                  {post.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                                </button>
                                <div className="border-t my-1" />
                                {post.status === "DRAFT" && (
                                  <button
                                    onClick={() => {
                                      publishMutation.mutate({ id: post.id });
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Yayınla
                                  </button>
                                )}
                                {post.status === "PUBLISHED" && (
                                  <button
                                    onClick={() => {
                                      unpublishMutation.mutate({ id: post.id });
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-amber-600"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Taslağa Al
                                  </button>
                                )}
                                {post.status !== "ARCHIVED" && (
                                  <button
                                    onClick={() => {
                                      archiveMutation.mutate({ id: post.id });
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Arşivle
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleDuplicate(post.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted"
                                >
                                  <Copy className="h-4 w-4" />
                                  Kopyala
                                </button>
                                <div className="border-t my-1" />
                                <button
                                  onClick={() => {
                                    handleDelete(post.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Sil
                                </button>
                              </div>
                            </div>
                          )}
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

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}

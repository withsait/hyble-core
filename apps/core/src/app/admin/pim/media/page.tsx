"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Image as ImageIcon,
  Video,
  RotateCw,
  Upload,
  Trash2,
  Star,
  Eye,
  Download,
  Filter,
  Grid,
  List,
  Search,
  MoreVertical,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Palette,
  Sparkles,
  Wand2,
  Layers,
  ZoomIn,
  Play,
  ExternalLink,
  Copy,
  RefreshCw,
  ChevronDown,
  Settings,
  FolderOpen,
  Tag,
} from "lucide-react";

type MediaType = "IMAGE" | "VIDEO" | "THUMBNAIL" | "BANNER" | "ICON" | "GALLERY" | "VARIANT" | "VIEW_360" | "LIFESTYLE" | "SIZE_CHART" | "INFOGRAPHIC";
type MediaStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED" | "ARCHIVED";

const typeConfig: Record<MediaType, { label: string; icon: typeof ImageIcon; color: string }> = {
  IMAGE: { label: "Görsel", icon: ImageIcon, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  VIDEO: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  THUMBNAIL: { label: "Küçük Resim", icon: ImageIcon, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  BANNER: { label: "Banner", icon: Layers, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  ICON: { label: "İkon", icon: ImageIcon, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  GALLERY: { label: "Galeri", icon: Grid, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  VARIANT: { label: "Varyant", icon: Palette, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  VIEW_360: { label: "360°", icon: RotateCw, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  LIFESTYLE: { label: "Yaşam Tarzı", icon: ImageIcon, color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  SIZE_CHART: { label: "Beden Tablosu", icon: ImageIcon, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  INFOGRAPHIC: { label: "İnfografik", icon: ImageIcon, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
};

const statusConfig: Record<MediaStatus, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PROCESSING: { label: "İşleniyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  READY: { label: "Hazır", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  FAILED: { label: "Başarısız", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ARCHIVED: { label: "Arşiv", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

function ProductMediaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<MediaStatus | "ALL">("ALL");
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    url: "",
    alt: "",
    title: "",
    type: "IMAGE" as MediaType,
    variantValue: "",
  });

  // Queries
  const { data: product } = trpc.pim.getProductById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const { data: mediaData, isLoading, refetch } = trpc.productMedia.list.useQuery(
    {
      productId: productId!,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    },
    { enabled: !!productId }
  );

  const { data: statsData } = trpc.productMedia.adminStats.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  );

  // Mutations
  const createMedia = trpc.productMedia.adminCreate.useMutation({
    onSuccess: () => {
      setShowUploadModal(false);
      setUploadForm({ url: "", alt: "", title: "", type: "IMAGE", variantValue: "" });
      refetch();
    },
  });

  const deleteMedia = trpc.productMedia.adminDelete.useMutation({
    onSuccess: () => refetch(),
  });

  const bulkDelete = trpc.productMedia.adminBulkDelete.useMutation({
    onSuccess: () => {
      setSelectedMedia(new Set());
      refetch();
    },
  });

  const setPrimary = trpc.productMedia.adminSetPrimary.useMutation({
    onSuccess: () => refetch(),
  });

  const setHover = trpc.productMedia.adminSetHover.useMutation({
    onSuccess: () => refetch(),
  });

  const updateMedia = trpc.productMedia.adminUpdate.useMutation({
    onSuccess: () => refetch(),
  });

  const media = mediaData?.media ?? [];

  const handleUpload = () => {
    if (!productId || !uploadForm.url) return;
    createMedia.mutate({
      productId,
      originalUrl: uploadForm.url,
      url: uploadForm.url,
      alt: uploadForm.alt || undefined,
      title: uploadForm.title || undefined,
      type: uploadForm.type,
      variantValue: uploadForm.variantValue || undefined,
    });
  };

  const handleSelectAll = () => {
    if (selectedMedia.size === media.length) {
      setSelectedMedia(new Set());
    } else {
      setSelectedMedia(new Set(media.map((m) => m.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedMedia.size === 0) return;
    if (confirm(`${selectedMedia.size} görseli silmek istediğinize emin misiniz?`)) {
      bulkDelete.mutate({ ids: Array.from(selectedMedia) });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (!productId) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ürün seçilmedi</h3>
          <p className="text-muted-foreground mb-4">
            Görsel yönetimi için bir ürün seçin
          </p>
          <Link href="/admin/pim">
            <Button>Ürün Listesine Git</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/pim/products/${productId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Medya Yönetimi</h1>
            {product && (
              <p className="text-muted-foreground">{product.nameTr}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Görsel Ekle
          </Button>
        </div>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ImageIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Görsel</p>
                <p className="text-2xl font-bold">{statsData.totalMedia}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Video</p>
                <p className="text-2xl font-bold">{statsData.totalVideos}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <RotateCw className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">360° Görünüm</p>
                <p className="text-2xl font-bold">{statsData.total360Views}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hazır</p>
                <p className="text-2xl font-bold">
                  {statsData.byStatus.find((s) => s.status === "READY")?.count || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Loader2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">İşleniyor</p>
                <p className="text-2xl font-bold">{statsData.pendingJobs}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Görsel ara..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MediaType | "ALL")}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="ALL">Tüm Tipler</option>
              {Object.entries(typeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MediaStatus | "ALL")}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMedia.size > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedMedia.size} öğe seçili
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedMedia.size === media.length ? "Seçimi Kaldır" : "Tümünü Seç"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Seçilenleri Sil
            </Button>
          </div>
        )}
      </Card>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz görsel yok</h3>
          <p className="text-muted-foreground mb-4">
            Bu ürün için henüz görsel eklenmemiş
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            İlk Görseli Ekle
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => {
            const typeConf = typeConfig[item.type as MediaType] || typeConfig.IMAGE;
            const statusConf = statusConfig[item.status as MediaStatus] || statusConfig.READY;
            const isSelected = selectedMedia.has(item.id);

            return (
              <Card
                key={item.id}
                className={`overflow-hidden group relative aspect-square cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  if (selectedMedia.size > 0) {
                    const newSet = new Set(selectedMedia);
                    if (isSelected) {
                      newSet.delete(item.id);
                    } else {
                      newSet.add(item.id);
                    }
                    setSelectedMedia(newSet);
                  } else {
                    setShowPreviewModal(item.id);
                  }
                }}
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || ""}
                  className="w-full h-full object-cover"
                />

                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "border-white bg-black/20 opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newSet = new Set(selectedMedia);
                    if (isSelected) {
                      newSet.delete(item.id);
                    } else {
                      newSet.add(item.id);
                    }
                    setSelectedMedia(newSet);
                  }}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.isPrimary && (
                    <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Ana
                    </span>
                  )}
                  {item.isHover && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                      Hover
                    </span>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreviewModal(item.id);
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Görseli silmek istediğinize emin misiniz?")) {
                          deleteMedia.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {!item.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary.mutate({ productId: productId!, mediaId: item.id });
                      }}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Ana Yap
                    </Button>
                  )}
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${typeConf.color}`}>
                      {typeConf.label}
                    </span>
                    {item.variantValue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500 text-white">
                        {item.variantValue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quality/AI Badge */}
                {(item.qualityScore || (item.aiTags && item.aiTags.length > 0)) && (
                  <div className="absolute bottom-8 right-2 flex gap-1">
                    {item.qualityScore && (
                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded">
                        Q{item.qualityScore}
                      </span>
                    )}
                    {item.aiTags && item.aiTags.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] rounded flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => {
            const typeConf = typeConfig[item.type as MediaType] || typeConfig.IMAGE;
            const statusConf = statusConfig[item.status as MediaStatus] || statusConfig.READY;
            const isSelected = selectedMedia.has(item.id);

            return (
              <Card key={item.id} className={`p-4 ${isSelected ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                      isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground"
                    }`}
                    onClick={() => {
                      const newSet = new Set(selectedMedia);
                      if (isSelected) {
                        newSet.delete(item.id);
                      } else {
                        newSet.add(item.id);
                      }
                      setSelectedMedia(newSet);
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>

                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.alt || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${typeConf.color}`}>
                        {typeConf.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                      {item.isPrimary && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Ana
                        </span>
                      )}
                      {item.isHover && (
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                          Hover
                        </span>
                      )}
                    </div>
                    <p className="text-sm truncate">{item.alt || item.title || "İsimsiz"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.width && item.height ? `${item.width}x${item.height}` : ""}
                      {item.fileSize ? ` • ${Math.round(item.fileSize / 1024)}KB` : ""}
                    </p>
                  </div>

                  {item.dominantColor && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: item.dominantColor }}
                      title={item.dominantColor}
                    />
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreviewModal(item.id)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyUrl(item.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!item.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPrimary.mutate({ productId: productId!, mediaId: item.id })}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => {
                        if (confirm("Görseli silmek istediğinize emin misiniz?")) {
                          deleteMedia.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Görsel Ekle</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Görsel URL'si *</label>
                <Input
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Alt Text</label>
                  <Input
                    value={uploadForm.alt}
                    onChange={(e) => setUploadForm((p) => ({ ...p, alt: e.target.value }))}
                    placeholder="Görsel açıklaması"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Başlık</label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Görsel başlığı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tip</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm((p) => ({ ...p, type: e.target.value as MediaType }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Varyant Değeri</label>
                  <Input
                    value={uploadForm.variantValue}
                    onChange={(e) => setUploadForm((p) => ({ ...p, variantValue: e.target.value }))}
                    placeholder="red, blue, xl..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Varyant görselleri için</p>
                </div>
              </div>

              {uploadForm.url && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Önizleme</p>
                  <img
                    src={uploadForm.url}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                İptal
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadForm.url || createMedia.isPending}
              >
                {createMedia.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Ekle
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={() => setShowPreviewModal(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {(() => {
              const previewItem = media.find((m) => m.id === showPreviewModal);
              if (!previewItem) return null;

              return (
                <div className="bg-background rounded-lg overflow-hidden">
                  <div className="aspect-video relative bg-black">
                    <img
                      src={previewItem.largeUrl || previewItem.url}
                      alt={previewItem.alt || ""}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {previewItem.title || previewItem.alt || "İsimsiz Görsel"}
                        </h3>
                        {previewItem.caption && (
                          <p className="text-muted-foreground mt-1">{previewItem.caption}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!previewItem.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPrimary.mutate({ productId: productId!, mediaId: previewItem.id });
                            }}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Ana Yap
                          </Button>
                        )}
                        {!previewItem.isHover && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setHover.mutate({ productId: productId!, mediaId: previewItem.id });
                            }}
                          >
                            Hover Yap
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(previewItem.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Boyut</p>
                        <p className="font-medium">
                          {previewItem.width && previewItem.height
                            ? `${previewItem.width} x ${previewItem.height}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dosya Boyutu</p>
                        <p className="font-medium">
                          {previewItem.fileSize
                            ? `${(previewItem.fileSize / 1024).toFixed(1)} KB`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Format</p>
                        <p className="font-medium">{previewItem.mimeType || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Baskın Renk</p>
                        <div className="flex items-center gap-2">
                          {previewItem.dominantColor ? (
                            <>
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: previewItem.dominantColor }}
                              />
                              <span className="font-medium">{previewItem.dominantColor}</span>
                            </>
                          ) : (
                            <span className="font-medium">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {previewItem.aiTags && previewItem.aiTags.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="h-4 w-4" />
                          AI Etiketleri
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previewItem.aiTags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewItem.colorPalette && previewItem.colorPalette.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <Palette className="h-4 w-4" />
                          Renk Paleti
                        </p>
                        <div className="flex gap-2">
                          {previewItem.colorPalette.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-lg shadow-sm border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductMediaPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductMediaPageContent />
    </Suspense>
  );
}

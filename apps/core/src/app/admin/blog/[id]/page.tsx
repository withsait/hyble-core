"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
  Tag,
  Globe,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle,
  Trash2,
  Archive,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";
type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

const statusConfig: Record<PostStatus, { label: string; color: string }> = {
  DRAFT: { label: "Taslak", color: "bg-slate-100 text-slate-700" },
  SCHEDULED: { label: "Zamanlanmış", color: "bg-blue-100 text-blue-700" },
  PUBLISHED: { label: "Yayında", color: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "Arşiv", color: "bg-amber-100 text-amber-700" },
};

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const utils = trpc.useUtils();

  // Form state
  const [formData, setFormData] = useState({
    slug: "",
    vertical: "GENERAL" as PostVertical,
    titleTr: "",
    titleEn: "",
    excerptTr: "",
    excerptEn: "",
    contentTr: "",
    contentEn: "",
    categoryId: "",
    tags: [] as string[],
    featuredImage: "",
    thumbnail: "",
    metaTitleTr: "",
    metaTitleEn: "",
    metaDescTr: "",
    metaDescEn: "",
    authorName: "",
    authorImage: "",
    isFeatured: false,
    isPinned: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<"tr" | "en">("tr");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch post data
  const { data: post, isLoading: postLoading } = trpc.blog.getById.useQuery({ id: postId });
  const { data: categoriesData } = trpc.blog.listCategories.useQuery({ includeInactive: false });

  // Load post data into form
  useEffect(() => {
    if (post) {
      setFormData({
        slug: post.slug,
        vertical: post.vertical as PostVertical,
        titleTr: post.titleTr,
        titleEn: post.titleEn,
        excerptTr: post.excerptTr || "",
        excerptEn: post.excerptEn || "",
        contentTr: post.contentTr,
        contentEn: post.contentEn,
        categoryId: post.categoryId || "",
        tags: post.tags,
        featuredImage: post.featuredImage || "",
        thumbnail: post.thumbnail || "",
        metaTitleTr: post.metaTitleTr || "",
        metaTitleEn: post.metaTitleEn || "",
        metaDescTr: post.metaDescTr || "",
        metaDescEn: post.metaDescEn || "",
        authorName: post.authorName || "",
        authorImage: post.authorImage || "",
        isFeatured: post.isFeatured,
        isPinned: post.isPinned,
      });
    }
  }, [post]);

  // Mutations
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.getById.invalidate({ id: postId });
      setHasChanges(false);
    },
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
      router.push("/admin/blog");
    },
  });

  const publishMutation = trpc.blog.publish.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.getById.invalidate({ id: postId });
      utils.blog.stats.invalidate();
    },
  });

  const unpublishMutation = trpc.blog.unpublish.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.getById.invalidate({ id: postId });
      utils.blog.stats.invalidate();
    },
  });

  const archiveMutation = trpc.blog.archive.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.getById.invalidate({ id: postId });
      utils.blog.stats.invalidate();
    },
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Track changes
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      updateFormData({ tags: [...formData.tags, tagInput.trim().toLowerCase()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateFormData({ tags: formData.tags.filter((t) => t !== tag) });
  };

  // Submit form
  const handleSave = async () => {
    if (!formData.titleTr || !formData.titleEn || !formData.contentTr || !formData.contentEn) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    await updateMutation.mutateAsync({
      id: postId,
      ...formData,
      categoryId: formData.categoryId || undefined,
      featuredImage: formData.featuredImage || undefined,
      thumbnail: formData.thumbnail || undefined,
      authorImage: formData.authorImage || undefined,
    });
  };

  const handleDelete = async () => {
    if (confirm("Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      await deleteMutation.mutateAsync({ id: postId });
    }
  };

  if (postLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">Yazı bulunamadı</p>
        <Link href="/admin/blog">
          <Button variant="outline" className="mt-4">
            Geri Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Yazıyı Düzenle</h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[post.status as PostStatus]?.color}`}>
                {statusConfig[post.status as PostStatus]?.label}
              </span>
              {hasChanges && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Kaydedilmemiş değişiklikler
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Son güncelleme: {format(new Date(post.updatedAt), "d MMMM yyyy HH:mm", { locale: tr })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {post.status === "PUBLISHED" && (
            <Button
              variant="outline"
              onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Sitede Gör
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasChanges}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Kaydet
          </Button>
          {post.status === "DRAFT" && (
            <Button
              onClick={() => publishMutation.mutate({ id: postId })}
              disabled={publishMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Yayınla
            </Button>
          )}
          {post.status === "PUBLISHED" && (
            <Button
              variant="outline"
              onClick={() => unpublishMutation.mutate({ id: postId })}
              disabled={unpublishMutation.isPending}
            >
              {unpublishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Taslağa Al
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{post.viewCount.toLocaleString()}</span>
            <span className="text-muted-foreground">görüntülenme</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{post.readingTime}</span>
            <span className="text-muted-foreground">dk okuma</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{post.wordCount.toLocaleString()}</span>
            <span className="text-muted-foreground">kelime</span>
          </div>
          {post.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Yayın:</span>
              <span className="font-medium">{format(new Date(post.publishedAt), "d MMM yyyy", { locale: tr })}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Language Tabs */}
          <Card className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("tr")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "tr"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setActiveTab("en")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "en"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                English
              </button>
            </div>

            {/* Turkish Content */}
            {activeTab === "tr" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık (TR) *</label>
                  <Input
                    value={formData.titleTr}
                    onChange={(e) => updateFormData({ titleTr: e.target.value })}
                    placeholder="Yazı başlığını girin..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Özet (TR)</label>
                  <textarea
                    value={formData.excerptTr}
                    onChange={(e) => updateFormData({ excerptTr: e.target.value })}
                    placeholder="Kısa özet yazın..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">İçerik (TR) *</label>
                  <textarea
                    value={formData.contentTr}
                    onChange={(e) => updateFormData({ contentTr: e.target.value })}
                    placeholder="Yazı içeriğini girin... (Markdown desteklenir)"
                    rows={20}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Markdown formatı desteklenir</p>
                </div>
              </div>
            )}

            {/* English Content */}
            {activeTab === "en" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title (EN) *</label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => updateFormData({ titleEn: e.target.value })}
                    placeholder="Enter post title..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt (EN)</label>
                  <textarea
                    value={formData.excerptEn}
                    onChange={(e) => updateFormData({ excerptEn: e.target.value })}
                    placeholder="Write a short excerpt..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content (EN) *</label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => updateFormData({ contentEn: e.target.value })}
                    placeholder="Enter post content... (Markdown supported)"
                    rows={20}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Markdown format supported</p>
                </div>
              </div>
            )}
          </Card>

          {/* SEO Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              SEO Ayarları
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Başlık (TR)</label>
                  <Input
                    value={formData.metaTitleTr}
                    onChange={(e) => updateFormData({ metaTitleTr: e.target.value })}
                    placeholder="SEO başlığı..."
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.metaTitleTr.length}/70</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Title (EN)</label>
                  <Input
                    value={formData.metaTitleEn}
                    onChange={(e) => updateFormData({ metaTitleEn: e.target.value })}
                    placeholder="SEO title..."
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.metaTitleEn.length}/70</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Açıklama (TR)</label>
                  <textarea
                    value={formData.metaDescTr}
                    onChange={(e) => updateFormData({ metaDescTr: e.target.value })}
                    placeholder="SEO açıklaması..."
                    rows={2}
                    maxLength={160}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.metaDescTr.length}/160</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description (EN)</label>
                  <textarea
                    value={formData.metaDescEn}
                    onChange={(e) => updateFormData({ metaDescEn: e.target.value })}
                    placeholder="SEO description..."
                    rows={2}
                    maxLength={160}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.metaDescEn.length}/160</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Yazı Ayarları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => updateFormData({ slug: generateSlug(e.target.value) })}
                  placeholder="yazi-url-adresi"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  hyble.co/blog/{formData.slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dikey</label>
                <select
                  value={formData.vertical}
                  onChange={(e) => updateFormData({ vertical: e.target.value as PostVertical })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                >
                  <option value="GENERAL">Genel (Hyble)</option>
                  <option value="DIGITAL">Hyble Digital</option>
                  <option value="STUDIOS">Hyble Studios</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => updateFormData({ categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                >
                  <option value="">Kategori seçin...</option>
                  {categoriesData?.map((cat: { id: string; nameTr: string }) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameTr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Etiketler
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Etiket ekle..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button variant="outline" size="sm" onClick={handleAddTag}>
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Featured Image */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Görseller
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Öne Çıkan Görsel</label>
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => updateFormData({ featuredImage: e.target.value })}
                  placeholder="https://..."
                />
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="mt-2 rounded-lg w-full h-40 object-cover"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => updateFormData({ thumbnail: e.target.value })}
                  placeholder="https://..."
                />
                {formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail"
                    className="mt-2 rounded-lg w-24 h-24 object-cover"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Author */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Yazar Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Yazar Adı</label>
                <Input
                  value={formData.authorName}
                  onChange={(e) => updateFormData({ authorName: e.target.value })}
                  placeholder="Yazar adını girin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Yazar Fotoğrafı</label>
                <Input
                  value={formData.authorImage}
                  onChange={(e) => updateFormData({ authorImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </Card>

          {/* Options */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Seçenekler
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => updateFormData({ isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Öne çıkar</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => updateFormData({ isPinned: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Sabitle (en üstte göster)</span>
              </label>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 border-red-200 dark:border-red-900">
            <h3 className="font-semibold mb-4 text-red-600">Tehlikeli İşlemler</h3>
            <div className="space-y-2">
              {post.status !== "ARCHIVED" && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() => archiveMutation.mutate({ id: postId })}
                  disabled={archiveMutation.isPending}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Arşivle
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Yazıyı Sil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

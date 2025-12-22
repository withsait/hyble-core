"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

export default function NewBlogPostPage() {
  const router = useRouter();
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
  const [previewMode, setPreviewMode] = useState(false);

  // tRPC queries
  const { data: categoriesData } = trpc.blog.listCategories.useQuery({ includeInactive: false });

  // Create mutation
  const createMutation = trpc.blog.create.useMutation({
    onSuccess: (data) => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
      router.push(`/admin/blog/${data.id}`);
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

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string, lang: "tr" | "en") => {
    setFormData((prev) => ({
      ...prev,
      [`title${lang === "tr" ? "Tr" : "En"}`]: value,
    }));

    // Auto-generate slug from Turkish title
    if (lang === "tr" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Submit form
  const handleSubmit = async (publishImmediately: boolean = false) => {
    if (!formData.titleTr || !formData.titleEn || !formData.contentTr || !formData.contentEn) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    await createMutation.mutateAsync({
      ...formData,
      categoryId: formData.categoryId || undefined,
      featuredImage: formData.featuredImage || undefined,
      thumbnail: formData.thumbnail || undefined,
      authorImage: formData.authorImage || undefined,
      publishImmediately,
    });
  };

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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Yeni Blog Yazısı
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Düzenle" : "Önizleme"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Taslak Kaydet
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Yayınla
          </Button>
        </div>
      </div>

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
                    onChange={(e) => handleTitleChange(e.target.value, "tr")}
                    placeholder="Yazı başlığını girin..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Özet (TR)</label>
                  <textarea
                    value={formData.excerptTr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerptTr: e.target.value }))}
                    placeholder="Kısa özet yazın..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">İçerik (TR) *</label>
                  <textarea
                    value={formData.contentTr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contentTr: e.target.value }))}
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
                    onChange={(e) => handleTitleChange(e.target.value, "en")}
                    placeholder="Enter post title..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt (EN)</label>
                  <textarea
                    value={formData.excerptEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerptEn: e.target.value }))}
                    placeholder="Write a short excerpt..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content (EN) *</label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contentEn: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaTitleTr: e.target.value }))}
                    placeholder="SEO başlığı..."
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.metaTitleTr.length}/70</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Title (EN)</label>
                  <Input
                    value={formData.metaTitleEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaTitleEn: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescTr: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescEn: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, vertical: e.target.value as PostVertical }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Yazar adını girin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Yazar Fotoğrafı</label>
                <Input
                  value={formData.authorImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorImage: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Öne çıkar</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Sabitle (en üstte göster)</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

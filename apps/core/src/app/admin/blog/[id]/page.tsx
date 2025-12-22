"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Upload,
  X,
  AlertCircle,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  ImagePlus,
  CloudOff,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";
type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

// Field validation errors type
interface ValidationErrors {
  titleTr?: string;
  titleEn?: string;
  contentTr?: string;
  contentEn?: string;
  slug?: string;
}

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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch post data
  const { data: post, isLoading: postLoading } = trpc.blog.getById.useQuery({ id: postId });
  const { data: categoriesData } = trpc.blog.listCategories.useQuery({ includeInactive: false });
  const uploadMutation = trpc.upload.getUploadUrl.useMutation();
  const confirmUploadMutation = trpc.upload.confirmUpload.useMutation();

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

  // Calculate reading time
  const calculateReadingTime = useCallback((content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes < 1 ? 1 : minutes;
  }, []);

  // Get current reading time
  const readingTimeTr = calculateReadingTime(formData.contentTr);
  const readingTimeEn = calculateReadingTime(formData.contentEn);
  const wordCountTr = formData.contentTr.trim().split(/\s+/).filter(Boolean).length;
  const wordCountEn = formData.contentEn.trim().split(/\s+/).filter(Boolean).length;

  // Validation - matches backend schema requirements
  const validateField = useCallback((field: string, value: string): string | undefined => {
    switch (field) {
      case "titleTr":
        if (!value.trim()) return "Türkçe başlık zorunludur";
        if (value.length < 3) return "Başlık en az 3 karakter olmalı";
        break;
      case "titleEn":
        if (!value.trim()) return "İngilizce başlık zorunludur";
        if (value.length < 3) return "Başlık en az 3 karakter olmalı";
        break;
      case "contentTr":
        if (!value.trim()) return "Türkçe içerik zorunludur";
        if (value.length < 10) return "İçerik en az 10 karakter olmalı";
        break;
      case "contentEn":
        if (!value.trim()) return "İngilizce içerik zorunludur";
        if (value.length < 10) return "İçerik en az 10 karakter olmalı";
        break;
      case "slug":
        if (!value.trim()) return "URL slug zorunludur";
        if (value.length < 2) return "Slug en az 2 karakter olmalı";
        if (!/^[a-z0-9-]+$/.test(value)) return "Slug sadece küçük harf, rakam ve tire içerebilir";
        break;
    }
    return undefined;
  }, []);

  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors = {};
    newErrors.titleTr = validateField("titleTr", formData.titleTr);
    newErrors.titleEn = validateField("titleEn", formData.titleEn);
    newErrors.contentTr = validateField("contentTr", formData.contentTr);
    newErrors.contentEn = validateField("contentEn", formData.contentEn);
    newErrors.slug = validateField("slug", formData.slug);

    const filteredErrors: ValidationErrors = {};
    Object.entries(newErrors).forEach(([key, value]) => {
      if (value) filteredErrors[key as keyof ValidationErrors] = value;
    });

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  }, [formData, validateField]);

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Mutations
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.getById.invalidate({ id: postId });
      setHasChanges(false);
      setLastSaved(new Date());
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

  // Rich text formatting helpers
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeTab === "tr" ? formData.contentTr : formData.contentEn;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

    updateFormData({
      [activeTab === "tr" ? "contentTr" : "contentEn"]: newText,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Sadece görsel dosyaları yükleyebilirsiniz");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan büyük olamaz");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { uploadUrl, publicUrl, uploadId } = await uploadMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        fileType: "image",
        purpose: "blog-image",
      });

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      await confirmUploadMutation.mutateAsync({ uploadId });

      if (publicUrl) {
        updateFormData({ featuredImage: publicUrl });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Görsel yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  // Auto-save
  useEffect(() => {
    if (hasChanges && formData.titleTr) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(async () => {
        if (hasChanges && formData.titleTr && validateAll()) {
          setIsSaving(true);
          try {
            await updateMutation.mutateAsync({
              id: postId,
              ...formData,
              categoryId: formData.categoryId || undefined,
              featuredImage: formData.featuredImage || undefined,
              thumbnail: formData.thumbnail || undefined,
              authorImage: formData.authorImage || undefined,
            });
          } catch (error) {
            console.error("Auto-save failed:", error);
          } finally {
            setIsSaving(false);
          }
        }
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasChanges, formData, postId]);

  // Server error state
  const [serverError, setServerError] = useState<string | null>(null);

  // Submit form
  const handleSave = async () => {
    // Clear previous server error
    setServerError(null);

    setTouched({
      titleTr: true,
      titleEn: true,
      contentTr: true,
      contentEn: true,
      slug: true,
    });

    if (!validateAll()) {
      const currentErrors = {
        titleTr: validateField("titleTr", formData.titleTr),
        titleEn: validateField("titleEn", formData.titleEn),
        contentTr: validateField("contentTr", formData.contentTr),
        contentEn: validateField("contentEn", formData.contentEn),
        slug: validateField("slug", formData.slug),
      };

      if (currentErrors.titleTr || currentErrors.contentTr) {
        setActiveTab("tr");
      } else if (currentErrors.titleEn || currentErrors.contentEn) {
        setActiveTab("en");
      }
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: postId,
        ...formData,
        categoryId: formData.categoryId || undefined,
        featuredImage: formData.featuredImage || undefined,
        thumbnail: formData.thumbnail || undefined,
        authorImage: formData.authorImage || undefined,
      });
    } catch (error: any) {
      console.error("Blog update error:", error);
      const message = error?.message || error?.data?.message || "Blog yazısı güncellenirken bir hata oluştu";
      setServerError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async () => {
    if (confirm("Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      await deleteMutation.mutateAsync({ id: postId });
    }
  };

  // Get error class for inputs
  const getInputClass = (field: string, baseClass: string) => {
    const hasError = touched[field] && errors[field as keyof ValidationErrors];
    return `${baseClass} ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`;
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
    <div className="pb-24">
      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-64 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Auto-save status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className="text-amber-600">Otomatik kaydediliyor...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span className="text-slate-500">
                    Son kayıt: {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              ) : hasChanges ? (
                <>
                  <CloudOff className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600">Kaydedilmemiş değişiklikler</span>
                </>
              ) : null}
            </div>

            {/* Reading time indicator */}
            <div className="flex items-center gap-2 text-sm text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-4">
              <Clock className="h-4 w-4" />
              <span>
                {activeTab === "tr" ? `${readingTimeTr} dk okuma` : `${readingTimeEn} min read`}
                {" · "}
                {activeTab === "tr" ? `${wordCountTr} kelime` : `${wordCountEn} words`}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
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
      </div>

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
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Son güncelleme: {format(new Date(post.updatedAt), "d MMMM yyyy HH:mm", { locale: tr })}
              </p>
            </div>
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

        {/* Server Error */}
        {serverError && (
          <Card className="p-4 mb-6 border-red-300 dark:border-red-800 bg-red-100 dark:bg-red-950/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">Sunucu Hatası</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{serverError}</p>
              </div>
              <button
                onClick={() => setServerError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
          <Card className="p-4 mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-400">Lütfen aşağıdaki hataları düzeltin:</h4>
                <ul className="mt-2 text-sm text-red-600 dark:text-red-400 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    error && <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Language Tabs */}
            <Card className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("tr")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "tr"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Türkçe
                  {(touched.titleTr || touched.contentTr) && (errors.titleTr || errors.contentTr) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "en"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  English
                  {(touched.titleEn || touched.contentEn) && (errors.titleEn || errors.contentEn) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Turkish Content */}
              {activeTab === "tr" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Başlık (TR) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.titleTr}
                      onChange={(e) => updateFormData({ titleTr: e.target.value })}
                      onBlur={() => handleBlur("titleTr")}
                      placeholder="Yazı başlığını girin..."
                      className={getInputClass("titleTr", "text-lg")}
                    />
                    {touched.titleTr && errors.titleTr && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.titleTr}
                      </p>
                    )}
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
                    <label className="block text-sm font-medium mb-2">
                      İçerik (TR) <span className="text-red-500">*</span>
                    </label>

                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-slate-50 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Kalın"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="İtalik"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("# ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Başlık 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("## ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Başlık 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("- ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Liste"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("1. ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Numaralı Liste"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("[", "](url)")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("> ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Alıntı"
                      >
                        <Quote className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("`", "`")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Kod"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("![alt](", ")")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Görsel Ekle"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      ref={contentTextareaRef}
                      value={formData.contentTr}
                      onChange={(e) => updateFormData({ contentTr: e.target.value })}
                      onBlur={() => handleBlur("contentTr")}
                      placeholder="Yazı içeriğini girin... (Markdown desteklenir)"
                      rows={20}
                      className={getInputClass("contentTr", "w-full px-3 py-2 border border-t-0 rounded-b-lg bg-background text-sm font-mono resize-none")}
                    />
                    {touched.contentTr && errors.contentTr && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.contentTr}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Markdown formatı desteklenir · {wordCountTr} kelime · {readingTimeTr} dk okuma süresi
                    </p>
                  </div>
                </div>
              )}

              {/* English Content */}
              {activeTab === "en" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title (EN) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => updateFormData({ titleEn: e.target.value })}
                      onBlur={() => handleBlur("titleEn")}
                      placeholder="Enter post title..."
                      className={getInputClass("titleEn", "text-lg")}
                    />
                    {touched.titleEn && errors.titleEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.titleEn}
                      </p>
                    )}
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
                    <label className="block text-sm font-medium mb-2">
                      Content (EN) <span className="text-red-500">*</span>
                    </label>

                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-slate-50 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("# ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("## ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("- ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="List"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("1. ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("[", "](url)")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("> ")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Quote"
                      >
                        <Quote className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("`", "`")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Code"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("![alt](", ")")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        title="Insert Image"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      ref={activeTab === "en" ? contentTextareaRef : undefined}
                      value={formData.contentEn}
                      onChange={(e) => updateFormData({ contentEn: e.target.value })}
                      onBlur={() => handleBlur("contentEn")}
                      placeholder="Enter post content... (Markdown supported)"
                      rows={20}
                      className={getInputClass("contentEn", "w-full px-3 py-2 border border-t-0 rounded-b-lg bg-background text-sm font-mono resize-none")}
                    />
                    {touched.contentEn && errors.contentEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.contentEn}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Markdown format supported · {wordCountEn} words · {readingTimeEn} min read
                    </p>
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
                  <label className="block text-sm font-medium mb-2">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => updateFormData({ slug: generateSlug(e.target.value) })}
                    onBlur={() => handleBlur("slug")}
                    placeholder="yazi-url-adresi"
                    className={getInputClass("slug", "")}
                  />
                  {touched.slug && errors.slug && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.slug}
                    </p>
                  )}
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

            {/* Featured Image with Drag & Drop */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Görseller
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Öne Çıkan Görsel</label>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-slate-300 dark:border-slate-700 hover:border-primary"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Yükleniyor... {uploadProgress}%</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : formData.featuredImage ? (
                      <div className="relative">
                        <img
                          src={formData.featuredImage}
                          alt="Featured"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFormData({ featuredImage: "" });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Sürükle & bırak veya tıkla
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF, WebP (maks. 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Or enter URL */}
                  <div className="mt-2">
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) => updateFormData({ featuredImage: e.target.value })}
                      placeholder="veya URL girin: https://..."
                      className="text-sm"
                    />
                  </div>
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
    </div>
  );
}

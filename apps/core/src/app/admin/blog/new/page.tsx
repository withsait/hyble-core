"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  FileText,
  Sparkles,
  CheckCircle,
  Upload,
  X,
  Clock,
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

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

// Field validation errors type
interface ValidationErrors {
  titleTr?: string;
  titleEn?: string;
  contentTr?: string;
  contentEn?: string;
  slug?: string;
}

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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // tRPC queries and mutations
  const { data: categoriesData } = trpc.blog.listCategories.useQuery({ includeInactive: false });
  const uploadMutation = trpc.upload.getUploadUrl.useMutation();
  const confirmUploadMutation = trpc.upload.confirmUpload.useMutation();

  // Create mutation
  const createMutation = trpc.blog.create.useMutation({
    onSuccess: (data) => {
      utils.blog.list.invalidate();
      utils.blog.stats.invalidate();
      router.push(`/admin/blog/${data.id}`);
    },
  });

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

    // Filter out undefined values
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
    setHasUnsavedChanges(true);

    // Auto-generate slug from Turkish title
    if (lang === "tr" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Handle content change
  const handleContentChange = (value: string, lang: "tr" | "en") => {
    setFormData((prev) => ({
      ...prev,
      [`content${lang === "tr" ? "Tr" : "En"}`]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
    setHasUnsavedChanges(true);
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

    handleContentChange(newText, activeTab);

    // Set cursor position after insert
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
      // Get presigned URL
      const { uploadUrl, publicUrl, uploadId } = await uploadMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        fileType: "image",
        purpose: "blog-image",
      });

      // Upload to R2
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

      // Confirm upload
      await confirmUploadMutation.mutateAsync({ uploadId });

      // Update form with image URL
      if (publicUrl) {
        setFormData((prev) => ({
          ...prev,
          featuredImage: publicUrl,
        }));
        setHasUnsavedChanges(true);
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

  // Auto-save draft
  useEffect(() => {
    if (hasUnsavedChanges && formData.titleTr) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for 30 seconds
      autoSaveTimerRef.current = setTimeout(async () => {
        if (hasUnsavedChanges && formData.titleTr) {
          setIsSaving(true);
          try {
            // Save as draft (we'll store in localStorage for now)
            const draftKey = `blog-draft-${Date.now()}`;
            localStorage.setItem("blog-draft-current", JSON.stringify({
              key: draftKey,
              data: formData,
              savedAt: new Date().toISOString(),
            }));
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
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
  }, [hasUnsavedChanges, formData]);

  // Load draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("blog-draft-current");
      if (savedDraft) {
        const { data, savedAt } = JSON.parse(savedDraft);
        const savedDate = new Date(savedAt);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Only load drafts from the last hour
        if (savedDate > hourAgo && data.titleTr) {
          const shouldLoad = confirm(`Bir taslak bulundu (${savedDate.toLocaleTimeString()}). Yüklemek ister misiniz?`);
          if (shouldLoad) {
            setFormData(data);
            setLastSaved(savedDate);
          } else {
            localStorage.removeItem("blog-draft-current");
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Server error state
  const [serverError, setServerError] = useState<string | null>(null);

  // Submit form
  const handleSubmit = async (publishImmediately: boolean = false) => {
    // Clear previous server error
    setServerError(null);

    // Mark all fields as touched
    setTouched({
      titleTr: true,
      titleEn: true,
      contentTr: true,
      contentEn: true,
      slug: true,
    });

    if (!validateAll()) {
      // Find first error and switch to that tab if needed
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
      await createMutation.mutateAsync({
        ...formData,
        categoryId: formData.categoryId || undefined,
        featuredImage: formData.featuredImage || undefined,
        thumbnail: formData.thumbnail || undefined,
        authorImage: formData.authorImage || undefined,
        publishImmediately,
      });

      // Clear draft on successful save
      localStorage.removeItem("blog-draft-current");
    } catch (error: any) {
      console.error("Blog creation error:", error);
      // Extract error message from tRPC error
      const message = error?.message || error?.data?.message || "Blog yazısı oluşturulurken bir hata oluştu";
      setServerError(message);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get error class for inputs
  const getInputClass = (field: string, baseClass: string) => {
    const hasError = touched[field] && errors[field as keyof ValidationErrors];
    return `${baseClass} ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`;
  };

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
              ) : hasUnsavedChanges ? (
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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Yeni Blog Yazısı
              </h1>
            </div>
          </div>
        </div>

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
                      onChange={(e) => handleTitleChange(e.target.value, "tr")}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, excerptTr: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
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
                      onChange={(e) => handleContentChange(e.target.value, "tr")}
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
                      onChange={(e) => handleTitleChange(e.target.value, "en")}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, excerptEn: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
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
                      onChange={(e) => handleContentChange(e.target.value, "en")}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, metaTitleTr: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="SEO başlığı..."
                      maxLength={70}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.metaTitleTr.length}/70</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Title (EN)</label>
                    <Input
                      value={formData.metaTitleEn}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, metaTitleEn: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, metaDescTr: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, metaDescEn: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                      setHasUnsavedChanges(true);
                    }}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, vertical: e.target.value as PostVertical }));
                      setHasUnsavedChanges(true);
                    }}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, categoryId: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
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
                            setFormData((prev) => ({ ...prev, featuredImage: "" }));
                            setHasUnsavedChanges(true);
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, featuredImage: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="veya URL girin: https://..."
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail</label>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, thumbnail: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, authorName: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Yazar adını girin..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Yazar Fotoğrafı</label>
                  <Input
                    value={formData.authorImage}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, authorImage: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Öne çıkar</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, isPinned: e.target.checked }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Sabitle (en üstte göster)</span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

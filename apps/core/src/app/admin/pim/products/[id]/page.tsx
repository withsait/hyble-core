"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Package,
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Check,
  X,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Globe,
  Settings,
  AlertCircle,
  Archive,
  Zap,
  Copy,
  Star,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  MoreVertical,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  FileText,
  Hash,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";

type Tab = "general" | "variants" | "media" | "seo" | "analytics";

const statusConfig = {
  DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Edit },
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Eye },
  ARCHIVED: { label: "Arşiv", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: Archive },
};

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

const billingPeriodLabels: Record<string, string> = {
  monthly: "Aylık",
  quarterly: "3 Aylık",
  annually: "Yıllık",
  "": "Tek seferlik",
};

interface VariantForm {
  id?: string;
  sku: string;
  name: string;
  price: string;
  compareAtPrice: string;
  billingPeriod: string;
  features: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyVariant: VariantForm = {
  sku: "",
  name: "",
  price: "",
  compareAtPrice: "",
  billingPeriod: "monthly",
  features: {},
  isDefault: false,
  isActive: true,
  sortOrder: 0,
};

interface SeoForm {
  metaTitleTr: string;
  metaTitleEn: string;
  metaDescTr: string;
  metaDescEn: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
}

const emptySeo: SeoForm = {
  metaTitleTr: "",
  metaTitleEn: "",
  metaDescTr: "",
  metaDescEn: "",
  keywords: [],
  ogImage: "",
  canonicalUrl: "",
};

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [generalForm, setGeneralForm] = useState({
    nameTr: "",
    nameEn: "",
    slug: "",
    categoryId: "",
    shortDescTr: "",
    shortDescEn: "",
    descriptionTr: "",
    descriptionEn: "",
    basePrice: "",
    currency: "EUR",
    taxRate: "20",
    targetAudience: [] as string[],
    tags: [] as string[],
    isFeatured: false,
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "ARCHIVED",
  });

  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariant);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [featureKey, setFeatureKey] = useState("");
  const [featureValue, setFeatureValue] = useState("");
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "thumbnail" | "banner">("image");

  const [seoForm, setSeoForm] = useState<SeoForm>(emptySeo);
  const [keywordInput, setKeywordInput] = useState("");

  const [tagInput, setTagInput] = useState("");

  // tRPC queries
  const { data: product, isLoading, refetch } = trpc.pim.getProductById.useQuery({ id: productId });
  const { data: categories } = trpc.pim.listCategories.useQuery({ includeInactive: false });

  // tRPC mutations
  const updateProduct = trpc.pim.updateProduct.useMutation({
    onSuccess: () => {
      setSuccessMessage("Ürün güncellendi");
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    },
    onError: (error) => setErrors({ submit: error.message }),
  });

  const createVariant = trpc.pim.createVariant.useMutation({
    onSuccess: () => {
      setShowVariantModal(false);
      setVariantForm(emptyVariant);
      setSuccessMessage("Varyant eklendi");
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    },
    onError: (error) => setErrors({ variant: error.message }),
  });

  const updateVariant = trpc.pim.updateVariant.useMutation({
    onSuccess: () => {
      setShowVariantModal(false);
      setEditingVariantId(null);
      setVariantForm(emptyVariant);
      setSuccessMessage("Varyant güncellendi");
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    },
    onError: (error) => setErrors({ variant: error.message }),
  });

  const deleteVariant = trpc.pim.deleteVariant.useMutation({
    onSuccess: () => {
      setSuccessMessage("Varyant silindi");
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    },
  });

  const addMedia = trpc.pim.addMedia.useMutation({
    onSuccess: () => {
      setMediaUrl("");
      setMediaAlt("");
      setSuccessMessage("Görsel eklendi");
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    },
    onError: (error) => setErrors({ media: error.message }),
  });

  const deleteMedia = trpc.pim.deleteMedia.useMutation({
    onSuccess: () => refetch(),
  });

  const setPrimaryMedia = trpc.pim.setPrimaryMedia.useMutation({
    onSuccess: () => refetch(),
  });

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setGeneralForm({
        nameTr: product.nameTr,
        nameEn: product.nameEn,
        slug: product.slug,
        categoryId: product.categoryId || "",
        shortDescTr: product.shortDescTr || "",
        shortDescEn: product.shortDescEn || "",
        descriptionTr: product.descriptionTr || "",
        descriptionEn: product.descriptionEn || "",
        basePrice: product.basePrice?.toString() || "",
        currency: product.currency,
        taxRate: product.taxRate?.toString() || "20",
        targetAudience: product.targetAudience || [],
        tags: product.tags || [],
        isFeatured: product.isFeatured,
        status: product.status,
      });

      // Initialize SEO form from product meta
      const meta = product.meta as Record<string, unknown> || {};
      setSeoForm({
        metaTitleTr: (meta.metaTitleTr as string) || "",
        metaTitleEn: (meta.metaTitleEn as string) || "",
        metaDescTr: (meta.metaDescTr as string) || "",
        metaDescEn: (meta.metaDescEn as string) || "",
        keywords: (meta.keywords as string[]) || [],
        ogImage: (meta.ogImage as string) || "",
        canonicalUrl: (meta.canonicalUrl as string) || "",
      });
    }
  }, [product]);

  const tabs = [
    { id: "general" as Tab, label: "Genel", icon: Package },
    { id: "variants" as Tab, label: "Varyantlar", icon: DollarSign, count: product?.variants.length },
    { id: "media" as Tab, label: "Medya", icon: ImageIcon, count: product?.media.length },
    { id: "seo" as Tab, label: "SEO", icon: Search },
    { id: "analytics" as Tab, label: "Analitik", icon: BarChart3 },
  ];

  const handleSaveGeneral = () => {
    setIsSaving(true);
    updateProduct.mutate({
      id: productId,
      nameTr: generalForm.nameTr,
      nameEn: generalForm.nameEn,
      slug: generalForm.slug,
      categoryId: generalForm.categoryId || undefined,
      shortDescTr: generalForm.shortDescTr || undefined,
      shortDescEn: generalForm.shortDescEn || undefined,
      descriptionTr: generalForm.descriptionTr || undefined,
      descriptionEn: generalForm.descriptionEn || undefined,
      basePrice: generalForm.basePrice ? parseFloat(generalForm.basePrice) : undefined,
      currency: generalForm.currency,
      taxRate: parseFloat(generalForm.taxRate),
      targetAudience: generalForm.targetAudience,
      tags: generalForm.tags,
      isFeatured: generalForm.isFeatured,
      status: generalForm.status,
    }, {
      onSettled: () => setIsSaving(false),
    });
  };

  const handleSaveSeo = () => {
    setIsSaving(true);
    updateProduct.mutate({
      id: productId,
      meta: {
        metaTitleTr: seoForm.metaTitleTr || undefined,
        metaTitleEn: seoForm.metaTitleEn || undefined,
        metaDescTr: seoForm.metaDescTr || undefined,
        metaDescEn: seoForm.metaDescEn || undefined,
        keywords: seoForm.keywords.length > 0 ? seoForm.keywords : undefined,
        ogImage: seoForm.ogImage || undefined,
        canonicalUrl: seoForm.canonicalUrl || undefined,
      },
    }, {
      onSettled: () => setIsSaving(false),
    });
  };

  const handleSaveVariant = () => {
    if (!variantForm.name || !variantForm.sku || !variantForm.price) {
      setErrors({ variant: "Plan adı, SKU ve fiyat zorunludur" });
      return;
    }

    if (editingVariantId) {
      updateVariant.mutate({
        id: editingVariantId,
        sku: variantForm.sku,
        name: variantForm.name,
        price: parseFloat(variantForm.price),
        billingPeriod: variantForm.billingPeriod || undefined,
        features: Object.keys(variantForm.features).length > 0 ? variantForm.features : undefined,
        isDefault: variantForm.isDefault,
        isActive: variantForm.isActive,
      });
    } else {
      createVariant.mutate({
        productId,
        sku: variantForm.sku,
        name: variantForm.name,
        price: parseFloat(variantForm.price),
        billingPeriod: variantForm.billingPeriod || undefined,
        features: Object.keys(variantForm.features).length > 0 ? variantForm.features : undefined,
        isDefault: variantForm.isDefault,
      });
    }
  };

  const handleEditVariant = (variant: NonNullable<typeof product>["variants"][0]) => {
    setEditingVariantId(variant.id);
    setVariantForm({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      price: variant.price.toString(),
      compareAtPrice: "",
      billingPeriod: variant.billingPeriod || "",
      features: (variant.features as Record<string, string>) || {},
      isDefault: variant.isDefault,
      isActive: variant.isActive,
      sortOrder: variant.sortOrder,
    });
    setShowVariantModal(true);
  };

  const handleDuplicateVariant = (variant: NonNullable<typeof product>["variants"][0]) => {
    setEditingVariantId(null);
    setVariantForm({
      sku: `${variant.sku}-copy`,
      name: `${variant.name} (Kopya)`,
      price: variant.price.toString(),
      compareAtPrice: "",
      billingPeriod: variant.billingPeriod || "",
      features: (variant.features as Record<string, string>) || {},
      isDefault: false,
      isActive: true,
      sortOrder: (product?.variants.length || 0) + 1,
    });
    setShowVariantModal(true);
  };

  const addFeature = () => {
    if (featureKey.trim() && featureValue.trim()) {
      setVariantForm((prev) => ({
        ...prev,
        features: { ...prev.features, [featureKey.trim()]: featureValue.trim() },
      }));
      setFeatureKey("");
      setFeatureValue("");
    }
  };

  const removeFeature = (key: string) => {
    setVariantForm((prev) => {
      const newFeatures = { ...prev.features };
      delete newFeatures[key];
      return { ...prev, features: newFeatures };
    });
  };

  const handleAddMedia = () => {
    if (!mediaUrl) return;
    addMedia.mutate({
      productId,
      type: mediaType,
      url: mediaUrl,
      alt: mediaAlt || undefined,
      isPrimary: product?.media.length === 0,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !generalForm.tags.includes(tagInput.trim())) {
      setGeneralForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setGeneralForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoForm.keywords.includes(keywordInput.trim())) {
      setSeoForm((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage("Kopyalandı!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const toggleVariantExpand = (id: string) => {
    setExpandedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Ürün bulunamadı</p>
          <Link href="/admin/pim">
            <Button className="mt-4">Ürün Listesine Dön</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const status = statusConfig[product.status];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/pim">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{product.nameTr}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <status.icon className="h-3 w-3" />
                {status.label}
              </span>
              <span className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium">
                {typeLabels[product.type]}
              </span>
              {product.isFeatured && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Öne Çıkan
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => copyToClipboard(`hyble.co/store/${product.slug}`)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <LinkIcon className="h-3 w-3" />
                /{product.slug}
                <Copy className="h-3 w-3" />
              </button>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {product.variants.length} varyant
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {product.media.length} görsel
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {product.status === "DRAFT" && (
            <Button
              variant="outline"
              onClick={() => {
                setGeneralForm((prev) => ({ ...prev, status: "ACTIVE" }));
                setTimeout(handleSaveGeneral, 100);
              }}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Yayınla
            </Button>
          )}
          {product.status === "ACTIVE" && (
            <Button
              variant="outline"
              onClick={() => {
                setGeneralForm((prev) => ({ ...prev, status: "DRAFT" }));
                setTimeout(handleSaveGeneral, 100);
              }}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Taslağa Al
            </Button>
          )}
          <Button onClick={handleSaveGeneral} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {errors.submit}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? "bg-primary text-white" : "bg-muted"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Temel Bilgiler
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Ürün Adı (TR)</label>
                    <Input
                      value={generalForm.nameTr}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, nameTr: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Ürün Adı (EN)</label>
                    <Input
                      value={generalForm.nameEn}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, nameEn: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">URL Slug</label>
                    <Input
                      value={generalForm.slug}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kategori</label>
                    <select
                      value={generalForm.categoryId}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, categoryId: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Kategori seçin</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nameTr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Açıklamalar
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (TR)</label>
                    <textarea
                      value={generalForm.shortDescTr}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, shortDescTr: e.target.value }))}
                      rows={2}
                      maxLength={300}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{generalForm.shortDescTr.length}/300</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (EN)</label>
                    <textarea
                      value={generalForm.shortDescEn}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, shortDescEn: e.target.value }))}
                      rows={2}
                      maxLength={300}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{generalForm.shortDescEn.length}/300</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (TR)</label>
                    <textarea
                      value={generalForm.descriptionTr}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, descriptionTr: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Markdown desteklenir</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (EN)</label>
                    <textarea
                      value={generalForm.descriptionEn}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Markdown supported</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Durum & Görünürlük
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Durum</label>
                  <select
                    value={generalForm.status}
                    onChange={(e) => setGeneralForm((p) => ({ ...p, status: e.target.value as typeof generalForm.status }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="DRAFT">Taslak</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="ARCHIVED">Arşiv</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={generalForm.isFeatured}
                    onChange={(e) => setGeneralForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Öne çıkan ürün
                    </p>
                    <p className="text-xs text-muted-foreground">Ana sayfada gösterilir</p>
                  </div>
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fiyatlandırma
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Temel Fiyat</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={generalForm.basePrice}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, basePrice: e.target.value }))}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {generalForm.currency}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Para Birimi</label>
                    <select
                      value={generalForm.currency}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, currency: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">KDV (%)</label>
                    <Input
                      type="number"
                      value={generalForm.taxRate}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, taxRate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Etiketler
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Etiket ekle..."
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {generalForm.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Variants Tab */}
      {activeTab === "variants" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Varyantlar (Planlar)</h3>
              <p className="text-sm text-muted-foreground">
                Farklı plan seçenekleri oluşturun (Starter, Business, Enterprise vb.)
              </p>
            </div>
            <Button onClick={() => { setEditingVariantId(null); setVariantForm(emptyVariant); setShowVariantModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Varyant
            </Button>
          </div>

          {product.variants.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz varyant yok</h3>
              <p className="text-muted-foreground mb-6">Farklı fiyat seçenekleri sunmak için varyantlar ekleyin</p>
              <Button onClick={() => setShowVariantModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Varyantı Ekle
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {product.variants.map((variant, index) => (
                <Card
                  key={variant.id}
                  className={`overflow-hidden transition-all ${!variant.isActive ? "opacity-60" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-mono">#{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{variant.name}</h4>
                          {variant.isDefault && (
                            <span className="px-2 py-0.5 bg-primary text-white rounded text-xs">Varsayılan</span>
                          )}
                          {!variant.isActive && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs">Pasif</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{variant.sku}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold">{Number(variant.price).toFixed(2)} {variant.currency}</p>
                        {variant.billingPeriod && (
                          <p className="text-sm text-muted-foreground">/{billingPeriodLabels[variant.billingPeriod] || variant.billingPeriod}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVariantExpand(variant.id)}
                        >
                          {expandedVariants.has(variant.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditVariant(variant)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateVariant(variant)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm("Bu varyantı silmek istediğinize emin misiniz?")) {
                              deleteVariant.mutate({ id: variant.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Features */}
                    {expandedVariants.has(variant.id) && variant.features && Object.keys(variant.features as object).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Özellikler:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(variant.features as Record<string, string>).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Görseller</h3>
              <p className="text-sm text-muted-foreground">Ürün görselleri ve bannerları yönetin</p>
            </div>
          </div>

          {/* Add Media Form */}
          <Card className="p-6 mb-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Görsel Ekle
            </h4>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Görsel URL'si</label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium mb-1.5">Alt Text</label>
                <Input
                  value={mediaAlt}
                  onChange={(e) => setMediaAlt(e.target.value)}
                  placeholder="Görsel açıklaması"
                />
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium mb-1.5">Tip</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as typeof mediaType)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="image">Görsel</option>
                  <option value="thumbnail">Küçük Resim</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddMedia} disabled={!mediaUrl || addMedia.isPending}>
                  {addMedia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Ekle
                </Button>
              </div>
            </div>
            {errors.media && (
              <p className="text-sm text-red-500 mt-2">{errors.media}</p>
            )}
          </Card>

          {/* Media Gallery */}
          {product.media.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz görsel yok</h3>
              <p className="text-muted-foreground">Yukarıdaki formu kullanarak görsel ekleyin</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {product.media.map((media) => (
                <Card key={media.id} className="overflow-hidden group relative aspect-square">
                  <img
                    src={media.url}
                    alt={media.alt || ""}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {!media.isPrimary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryMedia.mutate({ id: media.id, productId })}
                        className="w-full"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Ana Yap
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMedia.mutate({ id: media.id })}
                      className="w-full"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Sil
                    </Button>
                  </div>
                  {media.isPrimary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Ana
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-xs truncate">{media.type}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">SEO Ayarları</h3>
              <p className="text-sm text-muted-foreground">Arama motoru optimizasyonu için meta bilgilerini düzenleyin</p>
            </div>
            <Button onClick={handleSaveSeo} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              SEO Ayarlarını Kaydet
            </Button>
          </div>

          <div className="space-y-6">
            {/* Meta Titles */}
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meta Başlıkları
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Türkçe Başlık
                    <span className="text-muted-foreground ml-2 text-xs">({seoForm.metaTitleTr.length}/60)</span>
                  </label>
                  <Input
                    value={seoForm.metaTitleTr}
                    onChange={(e) => setSeoForm((p) => ({ ...p, metaTitleTr: e.target.value }))}
                    placeholder={product.nameTr}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    İngilizce Başlık
                    <span className="text-muted-foreground ml-2 text-xs">({seoForm.metaTitleEn.length}/60)</span>
                  </label>
                  <Input
                    value={seoForm.metaTitleEn}
                    onChange={(e) => setSeoForm((p) => ({ ...p, metaTitleEn: e.target.value }))}
                    placeholder={product.nameEn}
                    maxLength={60}
                  />
                </div>
              </div>
            </Card>

            {/* Meta Descriptions */}
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Meta Açıklamaları
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Türkçe Açıklama
                    <span className="text-muted-foreground ml-2 text-xs">({seoForm.metaDescTr.length}/160)</span>
                  </label>
                  <textarea
                    value={seoForm.metaDescTr}
                    onChange={(e) => setSeoForm((p) => ({ ...p, metaDescTr: e.target.value }))}
                    placeholder={product.shortDescTr || "Ürün açıklaması..."}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    İngilizce Açıklama
                    <span className="text-muted-foreground ml-2 text-xs">({seoForm.metaDescEn.length}/160)</span>
                  </label>
                  <textarea
                    value={seoForm.metaDescEn}
                    onChange={(e) => setSeoForm((p) => ({ ...p, metaDescEn: e.target.value }))}
                    placeholder={product.shortDescEn || "Product description..."}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Keywords */}
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Anahtar Kelimeler
              </h4>
              <div className="flex gap-2 mb-3">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  placeholder="Anahtar kelime ekle..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  Ekle
                </Button>
              </div>
              {seoForm.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {seoForm.keywords.map((keyword) => (
                    <span key={keyword} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* OG Image & Canonical */}
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Sosyal Medya & URL
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">OG Image URL</label>
                  <Input
                    value={seoForm.ogImage}
                    onChange={(e) => setSeoForm((p) => ({ ...p, ogImage: e.target.value }))}
                    placeholder="https://example.com/og-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Sosyal medyada paylaşıldığında gösterilecek görsel</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Canonical URL</label>
                  <Input
                    value={seoForm.canonicalUrl}
                    onChange={(e) => setSeoForm((p) => ({ ...p, canonicalUrl: e.target.value }))}
                    placeholder={`https://hyble.co/store/${product.slug}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">İçerik çoğaltma sorunlarını önlemek için orijinal URL</p>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-muted/30">
              <h4 className="font-medium mb-4">Google Önizlemesi</h4>
              <div className="p-4 bg-background rounded-lg max-w-xl">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                  {seoForm.metaTitleTr || product.nameTr} | Hyble
                </p>
                <p className="text-green-700 text-sm">
                  hyble.co/store/{product.slug}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {seoForm.metaDescTr || product.shortDescTr || "Ürün açıklaması burada görünecek..."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Analitik</h3>
              <p className="text-sm text-muted-foreground">Ürün performansını izleyin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Görüntüleme</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Satış</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Abonelik</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dönüşüm</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Analitik Yakında</h3>
            <p className="text-muted-foreground">
              Ürün görüntüleme, satış ve dönüşüm istatistikleri bu bölümde gösterilecek
            </p>
          </Card>
        </div>
      )}

      {/* Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background p-6 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingVariantId ? "Varyant Düzenle" : "Yeni Varyant Oluştur"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowVariantModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {errors.variant && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.variant}
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h4 className="font-medium mb-3">Temel Bilgiler</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Plan Adı *</label>
                    <Input
                      value={variantForm.name}
                      onChange={(e) => setVariantForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Starter, Business, Enterprise..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">SKU *</label>
                    <Input
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm((p) => ({ ...p, sku: e.target.value }))}
                      placeholder="WEB-STARTER-M"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="font-medium mb-3">Fiyatlandırma</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Fiyat *</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm((p) => ({ ...p, price: e.target.value }))}
                        placeholder="9.99"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {product.currency}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Karşılaştırma Fiyatı</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={variantForm.compareAtPrice}
                        onChange={(e) => setVariantForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                        placeholder="12.99"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {product.currency}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Fatura Periyodu</label>
                    <select
                      value={variantForm.billingPeriod}
                      onChange={(e) => setVariantForm((p) => ({ ...p, billingPeriod: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Tek seferlik</option>
                      <option value="monthly">Aylık</option>
                      <option value="quarterly">3 Aylık</option>
                      <option value="annually">Yıllık</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Özellikler</h4>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={featureKey}
                    onChange={(e) => setFeatureKey(e.target.value)}
                    placeholder="Özellik adı (örn: Disk)"
                    className="flex-1"
                  />
                  <Input
                    value={featureValue}
                    onChange={(e) => setFeatureValue(e.target.value)}
                    placeholder="Değer (örn: 10GB)"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {Object.keys(variantForm.features).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(variantForm.features).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFeature(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div>
                <h4 className="font-medium mb-3">Seçenekler</h4>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variantForm.isDefault}
                      onChange={(e) => setVariantForm((p) => ({ ...p, isDefault: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">Varsayılan plan</span>
                  </label>
                  {editingVariantId && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variantForm.isActive}
                        onChange={(e) => setVariantForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm">Aktif</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVariantModal(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSaveVariant}
                disabled={createVariant.isPending || updateVariant.isPending}
              >
                {(createVariant.isPending || updateVariant.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingVariantId ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

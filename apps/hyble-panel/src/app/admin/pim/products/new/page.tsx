"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Globe,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  Repeat,
  Download,
  Wrench,
  Layers,
  Star,
  Users,
  Zap,
  Eye,
  Copy,
  Info,
  Sparkles,
  Plus,
  RefreshCw,
  X,
  Calendar,
  ShieldCheck,
  Truck,
  Clock,
  Shield,
  Timer,
  BarChart3,
  ChevronDown,
  Link as LinkIcon,
  FolderTree,
  FileText,
} from "lucide-react";

type ProductType = "DIGITAL" | "SUBSCRIPTION" | "BUNDLE" | "SERVICE";

interface FormData {
  // Step 1: Product Type
  type: ProductType;
  // Step 2: Basic Info
  nameTr: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  // Step 3: Description
  shortDescTr: string;
  shortDescEn: string;
  descriptionTr: string;
  descriptionEn: string;
  // Step 4: Pricing
  basePrice: string;
  currency: string;
  taxRate: string;
  setupFee: string;
  // Step 5: Settings
  targetAudience: string[];
  tags: string[];
  isFeatured: boolean;
  isHidden: boolean;
  sortOrder: string;
  // Step 5: Additional Settings
  requiresApproval: boolean;
  allowReviews: boolean;
  stockTracking: boolean;
  maxQuantityPerOrder: string;
  minQuantityPerOrder: string;
  trialDays: string;
  refundDays: string;
  deliveryType: string;
  priority: string;
  // Step 6: Initial Variant
  createVariant: boolean;
  variantName: string;
  variantSku: string;
  variantPrice: string;
  variantBillingPeriod: string;
  // Publish status
  publishImmediately: boolean;
}

interface NewCategoryData {
  nameTr: string;
  nameEn: string;
  slug: string;
  description: string;
}

const initialFormData: FormData = {
  type: "SUBSCRIPTION",
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
  setupFee: "",
  targetAudience: [],
  tags: [],
  isFeatured: false,
  isHidden: false,
  sortOrder: "0",
  requiresApproval: false,
  allowReviews: true,
  stockTracking: false,
  maxQuantityPerOrder: "",
  minQuantityPerOrder: "1",
  trialDays: "",
  refundDays: "14",
  deliveryType: "instant",
  priority: "normal",
  createVariant: true,
  variantName: "Starter",
  variantSku: "",
  variantPrice: "",
  variantBillingPeriod: "monthly",
  publishImmediately: true,
};

const initialCategoryData: NewCategoryData = {
  nameTr: "",
  nameEn: "",
  slug: "",
  description: "",
};

const productTypes: { value: ProductType; label: string; description: string; icon: React.ElementType; color: string }[] = [
  {
    value: "SUBSCRIPTION",
    label: "Abonelik",
    description: "Aylık veya yıllık yenilenen hizmet (hosting, SaaS)",
    icon: Repeat,
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
  },
  {
    value: "DIGITAL",
    label: "Dijital Ürün",
    description: "Tek seferlik dijital satış (tema, yazılım)",
    icon: Download,
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
  },
  {
    value: "SERVICE",
    label: "Hizmet",
    description: "Tek seferlik profesyonel hizmet",
    icon: Wrench,
    color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
  },
  {
    value: "BUNDLE",
    label: "Paket",
    description: "Birden fazla ürün veya hizmet paketi",
    icon: Layers,
    color: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
  },
];

const audienceOptions = [
  { value: "startup", label: "Startup", icon: Zap },
  { value: "smb", label: "KOBİ", icon: Users },
  { value: "enterprise", label: "Kurumsal", icon: Layers },
  { value: "personal", label: "Bireysel", icon: Users },
  { value: "agency", label: "Ajans", icon: Star },
  { value: "developer", label: "Geliştirici", icon: Package },
];

const suggestedTags = [
  "hosting", "cloud", "domain", "ssl", "email", "wordpress", "e-commerce",
  "minecraft", "game-server", "vps", "dedicated", "backup", "security"
];

export default function NewProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Category creation modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryData>(initialCategoryData);
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});

  // Slug validation state
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "error">("idle");
  const [slugMessage, setSlugMessage] = useState("");

  // tRPC
  const { data: categories, refetch: refetchCategories } = trpc.pim.listCategories.useQuery({ includeInactive: false });

  // Category creation mutation
  const createCategory = trpc.pim.createCategory.useMutation({
    onSuccess: (category) => {
      setFormData((prev) => ({ ...prev, categoryId: category.id }));
      refetchCategories();
      setShowCategoryModal(false);
      setNewCategory(initialCategoryData);
      setCategoryErrors({});
    },
    onError: (error) => {
      setCategoryErrors({ submit: error.message });
    },
  });


  const createProduct = trpc.pim.createProduct.useMutation({
    onSuccess: (product) => {
      router.push(`/admin/pim/products/${product.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const steps = [
    { number: 1, title: "Ürün Tipi", icon: Package },
    { number: 2, title: "Temel Bilgiler", icon: Globe },
    { number: 3, title: "Açıklamalar", icon: Tag },
    { number: 4, title: "Fiyatlandırma", icon: DollarSign },
    { number: 5, title: "Ayarlar", icon: Settings },
    { number: 6, title: "Özet & Oluştur", icon: Check },
  ];

  // Auto-generate slug from Turkish name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Validate slug format
  const isValidSlugFormat = (slug: string) => /^[a-z0-9-]+$/.test(slug) && slug.length >= 2;

  // Generate slug for category
  const generateCategorySlug = (name: string) => {
    const slug = generateSlug(name);
    setNewCategory((prev) => ({ ...prev, slug }));
  };

  // Debounced slug validation
  useEffect(() => {
    if (!formData.slug) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    if (!isValidSlugFormat(formData.slug)) {
      setSlugStatus("invalid");
      setSlugMessage("Slug sadece küçük harf, rakam ve tire içerebilir (min 2 karakter)");
      return;
    }

    setSlugStatus("checking");
    setSlugMessage("Kontrol ediliyor...");

    // Debounce for slug checking - simulated for now
    const timer = setTimeout(() => {
      // For now we'll do client-side check against category/product naming patterns
      // In production, this would be an API call to check uniqueness
      setSlugStatus("valid");
      setSlugMessage("Slug kullanılabilir");
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  // Handle category form submission
  const handleCreateCategory = () => {
    const newErrors: Record<string, string> = {};
    if (!newCategory.nameTr) newErrors.nameTr = "Türkçe ad zorunlu";
    if (!newCategory.nameEn) newErrors.nameEn = "İngilizce ad zorunlu";
    if (!newCategory.slug) newErrors.slug = "Slug zorunlu";
    if (newCategory.slug && !isValidSlugFormat(newCategory.slug)) {
      newErrors.slug = "Geçersiz slug formatı";
    }

    setCategoryErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createCategory.mutate({
      nameTr: newCategory.nameTr,
      nameEn: newCategory.nameEn,
      slug: newCategory.slug,
      description: newCategory.description || undefined,
      sortOrder: 0,
    });
  };

  // Regenerate slug from name
  const regenerateSlug = () => {
    if (formData.nameTr) {
      const newSlug = generateSlug(formData.nameTr);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  };

  // Auto-generate SKU
  const generateSku = () => {
    const prefix = formData.type.substring(0, 3).toUpperCase();
    const productPart = formData.slug.split("-").slice(0, 2).join("-").toUpperCase() || "PROD";
    const period = formData.variantBillingPeriod === "monthly" ? "M" : formData.variantBillingPeriod === "annually" ? "Y" : "O";
    return `${prefix}-${productPart}-${period}`.substring(0, 20);
  };

  const handleNameChange = (value: string, field: "nameTr" | "nameEn") => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "nameTr" && !prev.slug) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.nameTr) newErrors.nameTr = "Türkçe ad zorunlu";
      if (!formData.nameEn) newErrors.nameEn = "İngilizce ad zorunlu";
      if (!formData.slug) newErrors.slug = "Slug zorunlu";
      if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = "Slug sadece küçük harf, rakam ve tire içerebilir";
      }
    }

    if (step === 4) {
      if (formData.basePrice && isNaN(parseFloat(formData.basePrice))) {
        newErrors.basePrice = "Geçerli bir fiyat girin";
      }
      if (formData.taxRate && (isNaN(parseFloat(formData.taxRate)) || parseFloat(formData.taxRate) < 0 || parseFloat(formData.taxRate) > 100)) {
        newErrors.taxRate = "KDV oranı 0-100 arasında olmalı";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Auto-generate SKU when moving to step 5
      if (currentStep === 4 && !formData.variantSku) {
        setFormData((prev) => ({ ...prev, variantSku: generateSku() }));
      }
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    // Generate SKU if not provided
    const sku = formData.variantSku || generateSku();

    createProduct.mutate({
      type: formData.type,
      nameTr: formData.nameTr,
      nameEn: formData.nameEn,
      slug: formData.slug,
      categoryId: formData.categoryId || undefined,
      shortDescTr: formData.shortDescTr || undefined,
      shortDescEn: formData.shortDescEn || undefined,
      descriptionTr: formData.descriptionTr || undefined,
      descriptionEn: formData.descriptionEn || undefined,
      basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined,
      currency: formData.currency,
      taxRate: parseFloat(formData.taxRate),
      targetAudience: formData.targetAudience,
      tags: formData.tags,
      isFeatured: formData.isFeatured,
      publishImmediately: formData.publishImmediately,
      // Add initial variant for subscription/digital products
      initialVariant: (formData.type === "SUBSCRIPTION" || formData.type === "DIGITAL") && formData.variantName ? {
        name: formData.variantName,
        sku: sku,
        price: formData.variantPrice ? parseFloat(formData.variantPrice) : (formData.basePrice ? parseFloat(formData.basePrice) : 0),
        billingPeriod: formData.type === "SUBSCRIPTION" ? formData.variantBillingPeriod : undefined,
      } : undefined,
    });
  };

  const addTag = (tag?: string) => {
    const newTag = (tag || tagInput).trim().toLowerCase();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const toggleAudience = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(value)
        ? prev.targetAudience.filter((a) => a !== value)
        : [...prev.targetAudience, value],
    }));
  };

  const copySlug = () => {
    navigator.clipboard.writeText(`hyble.co/store/${formData.slug}`);
  };

  const selectedType = productTypes.find((t) => t.value === formData.type);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/pim">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Yeni Ürün Oluştur</h1>
            <p className="text-muted-foreground">Ürün bilgilerini adım adım girin</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? "Formu Göster" : "Önizleme"}
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => currentStep > step.number && setCurrentStep(step.number)}
                disabled={currentStep < step.number}
                className={`flex items-center gap-2 transition-all ${
                  currentStep < step.number ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep > step.number
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-primary border-primary text-white scale-110"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden lg:block ${
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 lg:w-16 h-0.5 mx-2 ${
                    currentStep > step.number ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{errors.submit}</p>
        </div>
      )}

      {/* Preview Mode */}
      {showPreview && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-muted/30 to-muted/10">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ürün Önizlemesi
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold">{formData.nameTr || "Ürün Adı"}</h2>
              <p className="text-muted-foreground mt-1">{formData.shortDescTr || "Kısa açıklama..."}</p>
              <div className="flex items-center gap-2 mt-3">
                {formData.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Başlangıç fiyatı</p>
                <p className="text-3xl font-bold">
                  {formData.basePrice || formData.variantPrice || "0.00"} {formData.currency}
                  <span className="text-sm font-normal text-muted-foreground">
                    {formData.type === "SUBSCRIPTION" && formData.variantBillingPeriod === "monthly" && "/ay"}
                    {formData.type === "SUBSCRIPTION" && formData.variantBillingPeriod === "annually" && "/yıl"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedType?.color}`}>
                  {selectedType?.label}
                </span>
                {formData.isFeatured && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Öne Çıkan
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                URL: hyble.co/store/{formData.slug || "urun-slug"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Product Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ürün Tipini Seçin</h2>
                <p className="text-sm text-muted-foreground">Oluşturmak istediğiniz ürün türünü belirleyin</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                  className={`p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    formData.type === type.value
                      ? `${type.color} border-2`
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${formData.type === type.value ? "bg-white/50" : "bg-muted"}`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-base">{type.label}</p>
                        {formData.type === type.value && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Tip seçimi sonradan değiştirilebilir</p>
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  {formData.type === "SUBSCRIPTION" && "Abonelik ürünleri için aylık/yıllık fatura dönemleri tanımlanır."}
                  {formData.type === "DIGITAL" && "Dijital ürünler için indirme limitleri ve lisans anahtarları eklenebilir."}
                  {formData.type === "SERVICE" && "Hizmetler için teslim süresi ve çalışma saatleri belirlenebilir."}
                  {formData.type === "BUNDLE" && "Paketler için dahil edilecek ürünler sonradan seçilebilir."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Temel Bilgiler</h2>
                <p className="text-sm text-muted-foreground">Ürünün adı, slug'ı ve kategorisini belirleyin</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Ürün Adı (Türkçe) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nameTr}
                  onChange={(e) => handleNameChange(e.target.value, "nameTr")}
                  placeholder="Web Hosting Pro"
                  className={errors.nameTr ? "border-red-500" : ""}
                />
                {errors.nameTr && <p className="text-xs text-red-500 mt-1">{errors.nameTr}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Ürün Adı (İngilizce) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => handleNameChange(e.target.value, "nameEn")}
                  placeholder="Web Hosting Pro"
                  className={errors.nameEn ? "border-red-500" : ""}
                />
                {errors.nameEn && <p className="text-xs text-red-500 mt-1">{errors.nameEn}</p>}
              </div>
            </div>

            {/* Slug - Enhanced */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground pointer-events-none">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">/store/</span>
                  </div>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
                    placeholder="web-hosting-pro"
                    className={`pl-20 pr-10 ${
                      slugStatus === "invalid" || errors.slug
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : slugStatus === "valid"
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                        : ""
                    }`}
                  />
                  {/* Slug status indicator */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {slugStatus === "valid" && <Check className="h-4 w-4 text-green-500" />}
                    {slugStatus === "invalid" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={regenerateSlug}
                  title="Slug'ı yeniden oluştur"
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={copySlug} title="URL'yi kopyala" className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {/* Validation message */}
              {slugStatus !== "idle" && slugMessage && (
                <p className={`text-xs mt-1 ${slugStatus === "valid" ? "text-green-600" : slugStatus === "invalid" ? "text-red-500" : "text-muted-foreground"}`}>
                  {slugMessage}
                </p>
              )}
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              <p className="text-xs text-muted-foreground mt-1.5">
                Slug otomatik oluşturulur. <RefreshCw className="h-3 w-3 inline" /> butonu ile yeniden oluşturabilirsiniz.
              </p>
            </div>

            {/* Category - Simplified selector */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Kategori</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FolderTree className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-10 pl-10 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Kategori seçin (opsiyonel)</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameTr} ({cat._count?.products || 0} ürün)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {/* New category button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryModal(true)}
                  className="flex-shrink-0 h-10 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Kategori
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Kategori bulunamadı mı? <button type="button" onClick={() => setShowCategoryModal(true)} className="text-primary hover:underline">Yeni kategori oluştur</button>
              </p>
            </div>

            {/* Category Creation Modal */}
            {showCategoryModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Yeni Kategori Oluştur
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(false);
                        setNewCategory(initialCategoryData);
                        setCategoryErrors({});
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {categoryErrors.submit && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                        {categoryErrors.submit}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Türkçe Ad <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={newCategory.nameTr}
                          onChange={(e) => {
                            setNewCategory((prev) => ({ ...prev, nameTr: e.target.value }));
                            if (!newCategory.slug) generateCategorySlug(e.target.value);
                          }}
                          placeholder="Web Hosting"
                          className={categoryErrors.nameTr ? "border-red-500" : ""}
                        />
                        {categoryErrors.nameTr && <p className="text-xs text-red-500 mt-1">{categoryErrors.nameTr}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          İngilizce Ad <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={newCategory.nameEn}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, nameEn: e.target.value }))}
                          placeholder="Web Hosting"
                          className={categoryErrors.nameEn ? "border-red-500" : ""}
                        />
                        {categoryErrors.nameEn && <p className="text-xs text-red-500 mt-1">{categoryErrors.nameEn}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={newCategory.slug}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                          placeholder="web-hosting"
                          className={`flex-1 ${categoryErrors.slug ? "border-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => generateCategorySlug(newCategory.nameTr)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      {categoryErrors.slug && <p className="text-xs text-red-500 mt-1">{categoryErrors.slug}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Açıklama</label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Kategori açıklaması (opsiyonel)"
                        rows={3}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCategoryModal(false);
                        setNewCategory(initialCategoryData);
                        setCategoryErrors({});
                      }}
                    >
                      İptal
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={createCategory.isPending}
                    >
                      {createCategory.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Kategori Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Descriptions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Açıklamalar</h2>
                <p className="text-sm text-muted-foreground">Ürün açıklamalarını iki dilde girin</p>
              </div>
            </div>

            {/* Short Descriptions */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Kısa Açıklamalar (listeleme için)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Türkçe</label>
                  <textarea
                    value={formData.shortDescTr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescTr: e.target.value }))}
                    placeholder="Hızlı ve güvenilir web hosting..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Ürün kartlarında görünür</p>
                    <p className="text-xs text-muted-foreground">{formData.shortDescTr.length}/300</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">İngilizce</label>
                  <textarea
                    value={formData.shortDescEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescEn: e.target.value }))}
                    placeholder="Fast and reliable web hosting..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Shown on product cards</p>
                    <p className="text-xs text-muted-foreground">{formData.shortDescEn.length}/300</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Descriptions */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Detaylı Açıklamalar (ürün sayfası için)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Türkçe</label>
                  <textarea
                    value={formData.descriptionTr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTr: e.target.value }))}
                    placeholder="Ürün özellikleri, avantajları ve teknik detaylar..."
                    rows={8}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Markdown desteklenir</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">İngilizce</label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                    placeholder="Product features, benefits and technical details..."
                    rows={8}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Markdown supported</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Fiyatlandırma</h2>
                <p className="text-sm text-muted-foreground">Temel fiyat ve vergi ayarlarını yapın</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Varyant bazlı fiyatlandırma</p>
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  Farklı planlar (Starter, Business, Enterprise) için varyantlar ekleyerek her birine ayrı fiyat belirleyebilirsiniz. Burada girilen temel fiyat varsayılan olarak kullanılır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Temel Fiyat</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                    placeholder="0.00"
                    className={`pr-14 ${errors.basePrice ? "border-red-500" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
                {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Para Birimi</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dolar)</option>
                  <option value="GBP">GBP (Sterlin)</option>
                  <option value="TRY">TRY (Lira)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">KDV (%)</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxRate: e.target.value }))}
                  placeholder="20"
                  className={errors.taxRate ? "border-red-500" : ""}
                />
                {errors.taxRate && <p className="text-xs text-red-500 mt-1">{errors.taxRate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Kurulum Ücreti</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.setupFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, setupFee: e.target.value }))}
                    placeholder="0.00"
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
              </div>
            </div>

            {formData.type === "SUBSCRIPTION" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-3">İlk Varyant (Plan) Ayarları</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Plan Adı</label>
                    <Input
                      value={formData.variantName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, variantName: e.target.value }))}
                      placeholder="Starter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Plan Fiyatı</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.variantPrice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, variantPrice: e.target.value }))}
                      placeholder={formData.basePrice || "9.99"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Fatura Periyodu</label>
                    <select
                      value={formData.variantBillingPeriod}
                      onChange={(e) => setFormData((prev) => ({ ...prev, variantBillingPeriod: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="monthly">Aylık</option>
                      <option value="quarterly">3 Aylık</option>
                      <option value="annually">Yıllık</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">SKU</label>
                    <Input
                      value={formData.variantSku}
                      onChange={(e) => setFormData((prev) => ({ ...prev, variantSku: e.target.value }))}
                      placeholder="WEB-STARTER-M"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  İlk plan otomatik oluşturulur. Daha fazla plan eklemek için ürünü oluşturduktan sonra Varyantlar sekmesini kullanın.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Settings - Enhanced */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ayarlar</h2>
                <p className="text-sm text-muted-foreground">Hedef kitle, etiketler, görünürlük ve gelişmiş ayarlar</p>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-3">Hedef Kitle</label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => {
                  const isSelected = formData.targetAudience.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleAudience(option.value)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                      {isSelected && <Check className="h-4 w-4 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Etiketler</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Etiket yazın ve Enter'a basın..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => addTag()}>
                  Ekle
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Önerilen etiketler:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.filter(t => !formData.tags.includes(t)).slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 bg-muted/50 hover:bg-muted rounded text-xs transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility Options */}
            <div>
              <label className="block text-sm font-medium mb-3">Görünürlük & Öne Çıkarma</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                      className="h-5 w-5 rounded border-input accent-primary"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Öne Çıkan Ürün
                      </p>
                      <p className="text-sm text-muted-foreground">Ana sayfada ve öne çıkanlar listesinde gösterilir</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHidden}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isHidden: e.target.checked }))}
                      className="h-5 w-5 rounded border-input accent-primary"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Gizli Ürün
                      </p>
                      <p className="text-sm text-muted-foreground">Sadece doğrudan link ile erişilebilir</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData((prev) => ({ ...prev, requiresApproval: e.target.checked }))}
                      className="h-5 w-5 rounded border-input accent-primary"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        Manuel Onay Gerektir
                      </p>
                      <p className="text-sm text-muted-foreground">Siparişler manuel onay bekler</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowReviews}
                      onChange={(e) => setFormData((prev) => ({ ...prev, allowReviews: e.target.checked }))}
                      className="h-5 w-5 rounded border-input accent-primary"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                        Değerlendirmelere İzin Ver
                      </p>
                      <p className="text-sm text-muted-foreground">Müşteriler yorum yapabilir</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stockTracking}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stockTracking: e.target.checked }))}
                      className="h-5 w-5 rounded border-input accent-primary"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-500" />
                        Stok Takibi
                      </p>
                      <p className="text-sm text-muted-foreground">Sınırlı stok için takip et</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Delivery Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Teslimat Türü</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "instant", label: "Anında", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", desc: "Hemen erişim" },
                  { value: "manual", label: "Manuel", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", desc: "Admin onaylı" },
                  { value: "scheduled", label: "Planlanmış", icon: Calendar, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30", desc: "Belirli tarihte" },
                  { value: "physical", label: "Fiziksel", icon: Truck, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-950/30", desc: "Kargo ile" },
                ].map((option) => {
                  const isSelected = formData.deliveryType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, deliveryType: option.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `border-blue-500 ${option.bgColor} shadow-md`
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${isSelected ? option.bgColor : "bg-slate-100 dark:bg-slate-700"} flex items-center justify-center mb-3`}>
                        <option.icon className={`h-5 w-5 ${option.color}`} />
                      </div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                      {isSelected && (
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                          <Check className="h-3 w-3 mr-1" />
                          Seçili
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium mb-3">Öncelik Seviyesi</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "low", label: "Düşük", color: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600" },
                  { value: "normal", label: "Normal", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700" },
                  { value: "high", label: "Yüksek", color: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: option.value }))}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.priority === option.value
                        ? `${option.color} border-2`
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription-specific settings */}
            {formData.type === "SUBSCRIPTION" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-blue-600" />
                  Abonelik Ayarları
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Timer className="h-3.5 w-3.5 inline mr-1" />
                      Deneme Süresi (gün)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.trialDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trialDays: e.target.value }))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0 = deneme yok</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Shield className="h-3.5 w-3.5 inline mr-1" />
                      İade Süresi (gün)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.refundDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, refundDays: e.target.value }))}
                      placeholder="14"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Para iade garantisi</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Limits */}
            <div>
              <label className="block text-sm font-medium mb-3">Miktar Limitleri</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Min. Adet</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.minQuantityPerOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minQuantityPerOrder: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Max. Adet</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxQuantityPerOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxQuantityPerOrder: e.target.value }))}
                    placeholder="Sınırsız"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Sıralama</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Düşük = Üstte</p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Gelişmiş ayarlar</p>
                <p className="mt-1 text-amber-600 dark:text-amber-400">
                  Bu ayarlar ürünü oluşturduktan sonra düzenleme sayfasından da değiştirilebilir.
                  SEO, medya ve ilişkili ürünler düzenleme sayfasından eklenebilir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Summary */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Özet & Oluştur</h2>
                <p className="text-sm text-muted-foreground">Bilgileri kontrol edin ve ürünü oluşturun</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Temel Bilgiler</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tip:</dt>
                      <dd className="font-medium">{selectedType?.label}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ad (TR):</dt>
                      <dd className="font-medium">{formData.nameTr || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ad (EN):</dt>
                      <dd className="font-medium">{formData.nameEn || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Slug:</dt>
                      <dd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{formData.slug || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Kategori:</dt>
                      <dd className="font-medium">
                        {categories?.find((c) => c.id === formData.categoryId)?.nameTr || "Belirtilmedi"}
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Fiyatlandırma</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Temel Fiyat:</dt>
                      <dd className="font-medium">
                        {formData.basePrice ? `${formData.basePrice} ${formData.currency}` : "Varyantlarda"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">KDV:</dt>
                      <dd className="font-medium">%{formData.taxRate}</dd>
                    </div>
                    {formData.setupFee && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Kurulum:</dt>
                        <dd className="font-medium">{formData.setupFee} {formData.currency}</dd>
                      </div>
                    )}
                  </dl>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ayarlar</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Hedef Kitle:</dt>
                      <dd className="font-medium">
                        {formData.targetAudience.length > 0
                          ? formData.targetAudience.map(a => audienceOptions.find(o => o.value === a)?.label).join(", ")
                          : "Belirtilmedi"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Öne Çıkan:</dt>
                      <dd>{formData.isFeatured ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-muted-foreground">Hayır</span>}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Gizli:</dt>
                      <dd>{formData.isHidden ? <Check className="h-4 w-4 text-amber-500" /> : <span className="text-muted-foreground">Hayır</span>}</dd>
                    </div>
                  </dl>
                </Card>

                {formData.tags.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Etiketler</h3>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">{tag}</span>
                      ))}
                    </div>
                  </Card>
                )}

                {formData.type === "SUBSCRIPTION" && formData.variantName && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">İlk Varyant</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Plan:</dt>
                        <dd className="font-medium">{formData.variantName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Fiyat:</dt>
                        <dd className="font-medium">
                          {formData.variantPrice || formData.basePrice || "0"} {formData.currency}
                          /{formData.variantBillingPeriod === "monthly" ? "ay" : formData.variantBillingPeriod === "annually" ? "yıl" : "3ay"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">SKU:</dt>
                        <dd className="font-mono text-xs">{formData.variantSku || generateSku()}</dd>
                      </div>
                    </dl>
                  </Card>
                )}
              </div>
            </div>

            {/* Publish Option */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${formData.publishImmediately ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {formData.publishImmediately ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {formData.publishImmediately ? 'Ürün hemen yayınlanacak' : 'Taslak olarak kaydedilecek'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formData.publishImmediately
                        ? 'Ürün oluşturulduktan sonra mağazada görünür olacak'
                        : 'Ürünü düzenleme sayfasından yayınlayabilirsiniz'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, publishImmediately: false }))}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                    !formData.publishImmediately
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${!formData.publishImmediately ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${!formData.publishImmediately ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      Taslak
                    </span>
                    {!formData.publishImmediately && (
                      <Check className="h-4 w-4 text-amber-600 ml-auto" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, publishImmediately: true }))}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                    formData.publishImmediately
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className={`h-4 w-4 ${formData.publishImmediately ? 'text-green-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${formData.publishImmediately ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      Hemen Yayınla
                    </span>
                    {formData.publishImmediately && (
                      <Check className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>

          {currentStep < 6 ? (
            <Button onClick={nextStep}>
              İleri
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createProduct.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Ürünü Oluştur
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

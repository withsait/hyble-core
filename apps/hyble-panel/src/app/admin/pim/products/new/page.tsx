"use client";

import { useState } from "react";
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
  // Step 6: Initial Variant
  createVariant: boolean;
  variantName: string;
  variantSku: string;
  variantPrice: string;
  variantBillingPeriod: string;
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
  createVariant: true,
  variantName: "Starter",
  variantSku: "",
  variantPrice: "",
  variantBillingPeriod: "monthly",
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

  // tRPC
  const { data: categories } = trpc.pim.listCategories.useQuery({ includeInactive: false });

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

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    hyble.co/store/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                    placeholder="web-hosting-pro"
                    className={`pl-28 ${errors.slug ? "border-red-500" : ""}`}
                  />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={copySlug}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Otomatik oluşturuldu. Özelleştirmek için düzenleyebilirsiniz.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Kategori</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Kategori seçin (opsiyonel)</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameTr}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Kategoriler PIM &gt; Kategoriler bölümünden yönetilebilir
              </p>
            </div>
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

        {/* Step 5: Settings */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ayarlar</h2>
                <p className="text-sm text-muted-foreground">Hedef kitle, etiketler ve görünürlük ayarları</p>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-3">Hedef Kitle</label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleAudience(option.value)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.targetAudience.includes(option.value)
                        ? "bg-primary text-white shadow-md"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </button>
                ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-5 w-5 rounded border-input"
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

              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHidden}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isHidden: e.target.checked }))}
                    className="h-5 w-5 rounded border-input"
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
            </div>

            {/* Sort Order */}
            <div className="w-48">
              <label className="block text-sm font-medium mb-1.5">Sıralama Önceliği</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Düşük değer = Üstte görünür</p>
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

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Ürün "Taslak" olarak oluşturulacak</p>
                <p className="mt-1 text-amber-600 dark:text-amber-400">
                  Ürünü düzenleme sayfasından yayınlayabilir, varyant ekleyebilir ve medya yükleyebilirsiniz.
                </p>
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

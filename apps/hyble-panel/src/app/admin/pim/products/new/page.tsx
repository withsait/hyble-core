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
} from "lucide-react";

type ProductType = "DIGITAL" | "SUBSCRIPTION" | "BUNDLE" | "SERVICE";

interface FormData {
  // Step 1: Basic Info
  type: ProductType;
  nameTr: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  // Step 2: Description
  shortDescTr: string;
  shortDescEn: string;
  descriptionTr: string;
  descriptionEn: string;
  // Step 3: Pricing
  basePrice: string;
  currency: string;
  taxRate: string;
  // Step 4: Settings
  targetAudience: string[];
  tags: string[];
  isFeatured: boolean;
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
  targetAudience: [],
  tags: [],
  isFeatured: false,
};

const productTypes: { value: ProductType; label: string; description: string; icon: string }[] = [
  { value: "SUBSCRIPTION", label: "Abonelik", description: "Aylık/yıllık yenilenen hizmet", icon: "repeat" },
  { value: "DIGITAL", label: "Dijital Ürün", description: "Tek seferlik dijital satış", icon: "download" },
  { value: "SERVICE", label: "Hizmet", description: "Tek seferlik hizmet", icon: "wrench" },
  { value: "BUNDLE", label: "Paket", description: "Birden fazla ürün paketi", icon: "package" },
];

const audienceOptions = [
  { value: "startup", label: "Startup" },
  { value: "smb", label: "KOBİ" },
  { value: "enterprise", label: "Kurumsal" },
  { value: "personal", label: "Bireysel" },
  { value: "agency", label: "Ajans" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    { number: 1, title: "Temel Bilgiler", icon: Package },
    { number: 2, title: "Açıklamalar", icon: Globe },
    { number: 3, title: "Fiyatlandırma", icon: DollarSign },
    { number: 4, title: "Ayarlar", icon: Settings },
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

  const handleNameChange = (value: string, field: "nameTr" | "nameEn") => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "nameTr" && !prev.slug ? { slug: generateSlug(value) } : {}),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nameTr) newErrors.nameTr = "Türkçe ad zorunlu";
      if (!formData.nameEn) newErrors.nameEn = "İngilizce ad zorunlu";
      if (!formData.slug) newErrors.slug = "Slug zorunlu";
      if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = "Slug sadece küçük harf, rakam ve tire içerebilir";
      }
    }

    if (step === 3) {
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
      setCurrentStep((prev) => Math.min(prev + 1, 4));
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep > step.number
                  ? "bg-green-500 border-green-500 text-white"
                  : currentStep === step.number
                  ? "bg-primary border-primary text-white"
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
              className={`ml-2 text-sm font-medium hidden sm:block ${
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.number ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{errors.submit}</p>
        </div>
      )}

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Temel Bilgiler
            </h2>

            {/* Product Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Ürün Tipi</label>
              <div className="grid grid-cols-2 gap-3">
                {productTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.type === type.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
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
                <span className="text-sm text-muted-foreground">hyble.co/store/</span>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  placeholder="web-hosting-pro"
                  className={`flex-1 ${errors.slug ? "border-red-500" : ""}`}
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
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
            </div>
          </div>
        )}

        {/* Step 2: Descriptions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Açıklamalar
            </h2>

            {/* Short Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (Türkçe)</label>
                <textarea
                  value={formData.shortDescTr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescTr: e.target.value }))}
                  placeholder="Ürün listeleme için kısa açıklama..."
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.shortDescTr.length}/300</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (İngilizce)</label>
                <textarea
                  value={formData.shortDescEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescEn: e.target.value }))}
                  placeholder="Short description for listings..."
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.shortDescEn.length}/300</p>
              </div>
            </div>

            {/* Full Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (Türkçe)</label>
                <textarea
                  value={formData.descriptionTr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTr: e.target.value }))}
                  placeholder="Ürün detay sayfası için tam açıklama..."
                  rows={6}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (İngilizce)</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                  placeholder="Full description for product page..."
                  rows={6}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fiyatlandırma
            </h2>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Not:</strong> Bu temel fiyattır. Ürün oluşturduktan sonra farklı planlar (Starter, Business, Enterprise) için varyantlar ekleyebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Temel Fiyat</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                    placeholder="0.00"
                    className={`pr-12 ${errors.basePrice ? "border-red-500" : ""}`}
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
                  <option value="TRY">TRY (Türk Lirası)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">KDV Oranı (%)</label>
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
            </div>

            {formData.type === "SUBSCRIPTION" && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Abonelik ürünü:</strong> Fatura periyodları (aylık, yıllık) varyantlar üzerinden tanımlanır.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Settings */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ayarlar
            </h2>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-3">Hedef Kitle</label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleAudience(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.targetAudience.includes(option.value)
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Etiketler</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Etiket ekle..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Ekle
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">
                Öne çıkan ürün olarak işaretle
              </label>
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-3">Özet</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Tip:</dt>
                <dd>{productTypes.find((t) => t.value === formData.type)?.label}</dd>
                <dt className="text-muted-foreground">Ad:</dt>
                <dd>{formData.nameTr || "-"}</dd>
                <dt className="text-muted-foreground">Slug:</dt>
                <dd className="font-mono">{formData.slug || "-"}</dd>
                <dt className="text-muted-foreground">Fiyat:</dt>
                <dd>{formData.basePrice ? `${formData.basePrice} ${formData.currency}` : "Varyantlarda belirlenecek"}</dd>
              </dl>
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

          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              İleri
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createProduct.isPending}
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

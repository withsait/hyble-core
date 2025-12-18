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
} from "lucide-react";

type Tab = "general" | "variants" | "media" | "seo";

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

interface VariantForm {
  id?: string;
  sku: string;
  name: string;
  price: string;
  billingPeriod: string;
  features: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
}

const emptyVariant: VariantForm = {
  sku: "",
  name: "",
  price: "",
  billingPeriod: "monthly",
  features: {},
  isDefault: false,
  isActive: true,
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

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "thumbnail" | "banner">("image");

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
      refetch();
    },
    onError: (error) => setErrors({ variant: error.message }),
  });

  const updateVariant = trpc.pim.updateVariant.useMutation({
    onSuccess: () => {
      setShowVariantModal(false);
      setEditingVariantId(null);
      setVariantForm(emptyVariant);
      refetch();
    },
    onError: (error) => setErrors({ variant: error.message }),
  });

  const deleteVariant = trpc.pim.deleteVariant.useMutation({
    onSuccess: () => refetch(),
  });

  const addMedia = trpc.pim.addMedia.useMutation({
    onSuccess: () => {
      setMediaUrl("");
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
    }
  }, [product]);

  const tabs = [
    { id: "general" as Tab, label: "Genel", icon: Package },
    { id: "variants" as Tab, label: "Varyantlar", icon: DollarSign },
    { id: "media" as Tab, label: "Medya", icon: ImageIcon },
    { id: "seo" as Tab, label: "SEO", icon: Globe },
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

  const handleSaveVariant = () => {
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
      billingPeriod: variant.billingPeriod || "monthly",
      features: (variant.features as Record<string, string>) || {},
      isDefault: variant.isDefault,
      isActive: variant.isActive,
    });
    setShowVariantModal(true);
  };

  const handleAddMedia = () => {
    if (!mediaUrl) return;
    addMedia.mutate({
      productId,
      type: mediaType,
      url: mediaUrl,
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
    <div className="p-6 max-w-6xl mx-auto">
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
            </div>
            <p className="text-sm text-muted-foreground mt-1">/{product.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.status === "DRAFT" && (
            <Button
              variant="outline"
              onClick={() => {
                setGeneralForm((prev) => ({ ...prev, status: "ACTIVE" }));
                setTimeout(handleSaveGeneral, 100);
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Yayınla
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
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "variants" && (
                <span className="ml-1 px-1.5 py-0.5 bg-muted rounded text-xs">{product.variants.length}</span>
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
              <h3 className="font-semibold mb-4">Temel Bilgiler</h3>
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
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Açıklamalar</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (TR)</label>
                    <textarea
                      value={generalForm.shortDescTr}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, shortDescTr: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Kısa Açıklama (EN)</label>
                    <textarea
                      value={generalForm.shortDescEn}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, shortDescEn: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (TR)</label>
                    <textarea
                      value={generalForm.descriptionTr}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, descriptionTr: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama (EN)</label>
                    <textarea
                      value={generalForm.descriptionEn}
                      onChange={(e) => setGeneralForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Durum</h3>
              <select
                value={generalForm.status}
                onChange={(e) => setGeneralForm((p) => ({ ...p, status: e.target.value as typeof generalForm.status }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="DRAFT">Taslak</option>
                <option value="ACTIVE">Aktif</option>
                <option value="ARCHIVED">Arşiv</option>
              </select>
              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={generalForm.isFeatured}
                  onChange={(e) => setGeneralForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Öne çıkan ürün</span>
              </label>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Fiyatlandırma</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Temel Fiyat</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={generalForm.basePrice}
                    onChange={(e) => setGeneralForm((p) => ({ ...p, basePrice: e.target.value }))}
                  />
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
              <h3 className="font-semibold mb-4">Etiketler</h3>
              <div className="flex gap-2 mb-2">
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
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Farklı plan seçenekleri (Starter, Business, Enterprise) için varyantlar ekleyin
            </p>
            <Button onClick={() => { setEditingVariantId(null); setVariantForm(emptyVariant); setShowVariantModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Varyant Ekle
            </Button>
          </div>

          {product.variants.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz varyant eklenmemiş</p>
              <Button className="mt-4" onClick={() => setShowVariantModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Varyantı Ekle
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {product.variants.map((variant) => (
                <Card key={variant.id} className={`p-4 ${!variant.isActive ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{variant.name}</p>
                          {variant.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">Varsayılan</span>
                          )}
                          {!variant.isActive && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs">Pasif</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{Number(variant.price).toFixed(2)} {variant.currency}</p>
                        {variant.billingPeriod && (
                          <p className="text-xs text-muted-foreground">/{variant.billingPeriod === "monthly" ? "ay" : variant.billingPeriod === "annually" ? "yıl" : variant.billingPeriod}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditVariant(variant)}>
                          <Edit className="h-4 w-4" />
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
                  </div>
                  {variant.features && Object.keys(variant.features as object).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.features as Record<string, string>).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-muted rounded text-xs">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Görsel URL'si girin..."
              className="flex-1"
            />
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as typeof mediaType)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="image">Görsel</option>
              <option value="thumbnail">Küçük Resim</option>
              <option value="banner">Banner</option>
            </select>
            <Button onClick={handleAddMedia} disabled={!mediaUrl || addMedia.isPending}>
              {addMedia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Ekle
            </Button>
          </div>

          {product.media.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz görsel eklenmemiş</p>
            </Card>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {product.media.map((media) => (
                <Card key={media.id} className="overflow-hidden group relative">
                  <img src={media.url} alt={media.alt || ""} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!media.isPrimary && (
                      <Button size="sm" variant="secondary" onClick={() => setPrimaryMedia.mutate({ id: media.id, productId })}>
                        <Check className="h-3 w-3 mr-1" />
                        Ana
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteMedia.mutate({ id: media.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {media.isPrimary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">Ana Görsel</div>
                  )}
                  <div className="p-2 text-xs text-muted-foreground">{media.type}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">SEO Ayarları</h3>
          <p className="text-sm text-muted-foreground">SEO ayarları yakında eklenecek...</p>
        </Card>
      )}

      {/* Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {editingVariantId ? "Varyant Düzenle" : "Yeni Varyant"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowVariantModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {errors.variant && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {errors.variant}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Plan Adı</label>
                  <Input
                    value={variantForm.name}
                    onChange={(e) => setVariantForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Starter, Business..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">SKU</label>
                  <Input
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="WEB-STARTER-M"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fiyat</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="9.99"
                  />
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

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={variantForm.isDefault}
                    onChange={(e) => setVariantForm((p) => ({ ...p, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Varsayılan plan</span>
                </label>
                {editingVariantId && (
                  <label className="flex items-center gap-2">
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

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
                {editingVariantId ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

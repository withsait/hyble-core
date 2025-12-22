// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@hyble/ui";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { VariantEditor } from "./VariantEditor";
import { MediaGallery } from "./MediaGallery";
import { SEOMetaForm } from "./SEOMetaForm";
import { trpc } from "@/lib/trpc/client";

const productSchema = z.object({
  nameTr: z.string().min(2, "Türkçe ad en az 2 karakter olmalı"),
  nameEn: z.string().min(2, "İngilizce ad en az 2 karakter olmalı"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalı").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  type: z.enum(["DIGITAL", "SUBSCRIPTION", "BUNDLE", "SERVICE"]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  categoryId: z.string().optional().nullable(),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  shortDescTr: z.string().optional(),
  shortDescEn: z.string().optional(),
  basePrice: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.string().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean().optional(),
  demoUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const mode = productId ? "edit" : "create";
  const router = useRouter();

  // tRPC queries
  const { data: product, isLoading: productLoading } = trpc.pim.getProductById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const { data: categoriesData } = trpc.pim.listCategories.useQuery({});
  const categories = categoriesData || [];

  // tRPC mutations
  const createProduct = trpc.pim.createProduct.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/pim/products/${data.id}`);
    },
  });

  const updateProduct = trpc.pim.updateProduct.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "DIGITAL",
      status: "DRAFT",
      currency: "EUR",
      taxRate: "20",
      isFeatured: false,
    },
  });

  // Load product data for edit mode
  useEffect(() => {
    if (product) {
      reset({
        nameTr: product.nameTr,
        nameEn: product.nameEn,
        slug: product.slug,
        type: product.type as any,
        status: product.status as any,
        categoryId: product.categoryId || undefined,
        descriptionTr: product.descriptionTr || "",
        descriptionEn: product.descriptionEn || "",
        shortDescTr: product.shortDescTr || "",
        shortDescEn: product.shortDescEn || "",
        basePrice: product.basePrice?.toString() || "",
        currency: product.currency || "EUR",
        taxRate: product.taxRate?.toString() || "20",
        tags: product.tags?.join(", ") || "",
        isFeatured: product.isFeatured || false,
        demoUrl: product.demoUrl || "",
      });
    }
  }, [product, reset]);

  // Auto-generate slug from Turkish name
  const nameTr = watch("nameTr");
  useEffect(() => {
    if (mode === "create" && nameTr) {
      const slug = nameTr
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [nameTr, mode, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      nameTr: data.nameTr,
      nameEn: data.nameEn,
      slug: data.slug,
      type: data.type,
      categoryId: data.categoryId || undefined,
      descriptionTr: data.descriptionTr || undefined,
      descriptionEn: data.descriptionEn || undefined,
      shortDescTr: data.shortDescTr || undefined,
      shortDescEn: data.shortDescEn || undefined,
      basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
      currency: data.currency || "EUR",
      taxRate: data.taxRate ? parseFloat(data.taxRate) : 20,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      isFeatured: data.isFeatured || false,
      demoUrl: data.demoUrl || undefined,
    };

    if (mode === "create") {
      createProduct.mutate(payload as any);
    } else {
      updateProduct.mutate({
        id: productId!,
        ...payload,
        status: data.status,
      } as any);
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  if (mode === "edit" && productLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Yeni Ürün" : "Ürün Düzenle"}
          </h1>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isPending || !isDirty}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {mode === "create" ? "Oluştur" : "Kaydet"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
            Genel
          </button>
          {mode === "edit" && (
            <>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Varyantlar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Medya
              </button>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                SEO
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Form */}
      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Temel Bilgiler</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Türkçe Ad *</label>
                <Input {...register("nameTr")} placeholder="Ürün adı (TR)" />
                {errors.nameTr && <p className="text-xs text-destructive">{errors.nameTr.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">İngilizce Ad *</label>
                <Input {...register("nameEn")} placeholder="Product name (EN)" />
                {errors.nameEn && <p className="text-xs text-destructive">{errors.nameEn.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input {...register("slug")} placeholder="urun-adi" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kısa Açıklama (TR)</label>
                <Input {...register("shortDescTr")} placeholder="Kısa açıklama..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description (EN)</label>
                <Input {...register("shortDescEn")} placeholder="Short description..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detaylı Açıklama (TR)</label>
              <textarea
                {...register("descriptionTr")}
                placeholder="Detaylı açıklama..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Description (EN)</label>
              <textarea
                {...register("descriptionEn")}
                placeholder="Detailed description..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Fiyatlandırma</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Baz Fiyat</label>
                <Input {...register("basePrice")} type="number" step="0.01" placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Para Birimi</label>
                <select
                  {...register("currency")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">KDV Oranı (%)</label>
                <Input {...register("taxRate")} type="number" placeholder="20" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Type */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Durum</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Tipi *</label>
              <select
                {...register("type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DIGITAL">Dijital Ürün</option>
                <option value="SUBSCRIPTION">Abonelik</option>
                <option value="BUNDLE">Paket</option>
                <option value="SERVICE">Hizmet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <select
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DRAFT">Taslak</option>
                <option value="ACTIVE">Aktif</option>
                <option value="ARCHIVED">Arşivlenmiş</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isFeatured")}
                id="isFeatured"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isFeatured" className="text-sm">Öne Çıkar</label>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Kategori</h2>

            <div className="space-y-2">
              <select
                {...register("categoryId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Kategori Seçin</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameTr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Etiketler</h2>

            <div className="space-y-2">
              <Input
                {...register("tags")}
                placeholder="etiket1, etiket2, etiket3"
              />
              <p className="text-xs text-muted-foreground">Virgülle ayırarak yazın</p>
            </div>
          </div>

          {/* Demo URL */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Canlı Demo</h2>

            <div className="space-y-2">
              <Input
                {...register("demoUrl")}
                placeholder="https://demo.example.com"
                type="url"
              />
              {errors.demoUrl && <p className="text-xs text-destructive">{errors.demoUrl.message}</p>}
              <p className="text-xs text-muted-foreground">
                Ürünün canlı demo URL'si (örn: https://template-demo.hyble.co)
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Variant Editor - Only in edit mode */}
      {mode === "edit" && productId && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Varyantlar</h2>
          <VariantEditor productId={productId} />
        </div>
      )}

      {/* Media Gallery - Only in edit mode */}
      {mode === "edit" && productId && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Görseller</h2>
          <MediaGallery productId={productId} />
        </div>
      )}

      {/* SEO Meta Form - Only in edit mode */}
      {mode === "edit" && productId && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">SEO Ayarları</h2>
          <SEOMetaForm productId={productId} />
        </div>
      )}
    </div>
  );
}

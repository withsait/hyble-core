// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@hyble/ui";
import { Loader2, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const seoSchema = z.object({
  metaTitleTr: z.string().max(60, "Meta başlık 60 karakteri geçmemeli").optional(),
  metaTitleEn: z.string().max(60, "Meta title should not exceed 60 characters").optional(),
  metaDescTr: z.string().max(160, "Meta açıklama 160 karakteri geçmemeli").optional(),
  metaDescEn: z.string().max(160, "Meta description should not exceed 160 characters").optional(),
  slug: z.string().min(2, "Slug en az 2 karakter olmalı").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
});

type SEOFormData = z.infer<typeof seoSchema>;

interface SEOMetaFormProps {
  productId: string;
}

export function SEOMetaForm({ productId }: SEOMetaFormProps) {
  // tRPC queries
  const { data: product, isLoading } = trpc.pim.getProductById.useQuery({ id: productId });

  // tRPC mutations
  const updateMeta = trpc.pim.updateMeta.useMutation();
  const updateProduct = trpc.pim.updateProduct.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitleTr: "",
      metaTitleEn: "",
      metaDescTr: "",
      metaDescEn: "",
      slug: "",
    },
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setValue("metaTitleTr", product.meta?.metaTitleTr || "");
      setValue("metaTitleEn", product.meta?.metaTitleEn || "");
      setValue("metaDescTr", product.meta?.metaDescTr || "");
      setValue("metaDescEn", product.meta?.metaDescEn || "");
      setValue("slug", product.slug || "");
    }
  }, [product, setValue]);

  const metaTitleTr = watch("metaTitleTr") || "";
  const metaTitleEn = watch("metaTitleEn") || "";
  const metaDescTr = watch("metaDescTr") || "";
  const metaDescEn = watch("metaDescEn") || "";
  const slug = watch("slug") || "";

  const onSubmit = async (data: SEOFormData) => {
    // Update slug if changed
    if (data.slug !== product?.slug) {
      await updateProduct.mutateAsync({
        id: productId,
        slug: data.slug,
      });
    }

    // Update meta
    await updateMeta.mutateAsync({
      productId,
      metaTitleTr: data.metaTitleTr || undefined,
      metaTitleEn: data.metaTitleEn || undefined,
      metaDescTr: data.metaDescTr || undefined,
      metaDescEn: data.metaDescEn || undefined,
    });
  };

  const getCharacterStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 100) return "text-destructive";
    if (percentage > 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-muted-foreground";
  };

  const getCharacterIcon = (current: number, max: number) => {
    if (current > max) return <AlertCircle className="h-3 w-3 text-destructive" />;
    if (current > 0 && current <= max) return <CheckCircle2 className="h-3 w-3 text-green-600" />;
    return null;
  };

  const isPending = updateMeta.isPending || updateProduct.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Slug */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          URL Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">hyble.co/products/</span>
          <Input
            {...register("slug")}
            placeholder="urun-adi"
            className="flex-1"
          />
        </div>
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      {/* Turkish SEO */}
      <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <span className="text-lg">🇹🇷</span> Türkçe SEO
        </h3>

        {/* Meta Title TR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Meta Başlık</label>
            <div className="flex items-center gap-1">
              {getCharacterIcon(metaTitleTr.length, 60)}
              <span className={`text-xs ${getCharacterStatus(metaTitleTr.length, 60)}`}>
                {metaTitleTr.length}/60
              </span>
            </div>
          </div>
          <Input
            {...register("metaTitleTr")}
            placeholder="Ürün başlığı - arama sonuçlarında görünür"
            maxLength={70}
          />
          {errors.metaTitleTr && (
            <p className="text-xs text-destructive">{errors.metaTitleTr.message}</p>
          )}
        </div>

        {/* Meta Description TR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Meta Açıklama</label>
            <div className="flex items-center gap-1">
              {getCharacterIcon(metaDescTr.length, 160)}
              <span className={`text-xs ${getCharacterStatus(metaDescTr.length, 160)}`}>
                {metaDescTr.length}/160
              </span>
            </div>
          </div>
          <textarea
            {...register("metaDescTr")}
            placeholder="Ürünü kısaca tanımlayın - arama sonuçlarında başlığın altında görünür"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={170}
          />
          {errors.metaDescTr && (
            <p className="text-xs text-destructive">{errors.metaDescTr.message}</p>
          )}
        </div>

        {/* Preview TR */}
        {(metaTitleTr || metaDescTr) && (
          <div className="p-3 rounded border bg-background">
            <p className="text-xs text-muted-foreground mb-1">Google Önizleme</p>
            <div className="space-y-1">
              <p className="text-blue-600 dark:text-blue-400 text-base hover:underline cursor-pointer truncate">
                {metaTitleTr || product?.nameTr || "Sayfa Başlığı"}
              </p>
              <p className="text-green-700 dark:text-green-500 text-xs">
                hyble.co/products/{slug || "urun-slug"}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {metaDescTr || "Meta açıklama buraya gelecek..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* English SEO */}
      <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <span className="text-lg">🇬🇧</span> English SEO
        </h3>

        {/* Meta Title EN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Meta Title</label>
            <div className="flex items-center gap-1">
              {getCharacterIcon(metaTitleEn.length, 60)}
              <span className={`text-xs ${getCharacterStatus(metaTitleEn.length, 60)}`}>
                {metaTitleEn.length}/60
              </span>
            </div>
          </div>
          <Input
            {...register("metaTitleEn")}
            placeholder="Product title - shown in search results"
            maxLength={70}
          />
          {errors.metaTitleEn && (
            <p className="text-xs text-destructive">{errors.metaTitleEn.message}</p>
          )}
        </div>

        {/* Meta Description EN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Meta Description</label>
            <div className="flex items-center gap-1">
              {getCharacterIcon(metaDescEn.length, 160)}
              <span className={`text-xs ${getCharacterStatus(metaDescEn.length, 160)}`}>
                {metaDescEn.length}/160
              </span>
            </div>
          </div>
          <textarea
            {...register("metaDescEn")}
            placeholder="Briefly describe the product - shown below the title in search results"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={170}
          />
          {errors.metaDescEn && (
            <p className="text-xs text-destructive">{errors.metaDescEn.message}</p>
          )}
        </div>

        {/* Preview EN */}
        {(metaTitleEn || metaDescEn) && (
          <div className="p-3 rounded border bg-background">
            <p className="text-xs text-muted-foreground mb-1">Google Preview</p>
            <div className="space-y-1">
              <p className="text-blue-600 dark:text-blue-400 text-base hover:underline cursor-pointer truncate">
                {metaTitleEn || product?.nameEn || "Page Title"}
              </p>
              <p className="text-green-700 dark:text-green-500 text-xs">
                hyble.co/products/{slug || "product-slug"}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {metaDescEn || "Meta description will appear here..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          SEO Ayarlarını Kaydet
        </Button>
      </div>
    </form>
  );
}

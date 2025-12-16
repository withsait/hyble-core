"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button, Input } from "@hyble/ui";
import { X, Loader2 } from "lucide-react";

const categorySchema = z.object({
  nameTr: z.string().min(2, "Türkçe ad en az 2 karakter olmalı"),
  nameEn: z.string().min(2, "İngilizce ad en az 2 karakter olmalı"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalı").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  icon: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    nameTr: string;
    nameEn: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
    parentId?: string | null;
  } | null;
  parentId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CategoryForm({ category, parentId, onClose, onSuccess }: CategoryFormProps) {
  const utils = trpc.useUtils();
  const isEditMode = !!category;

  const { data: categories } = trpc.pim.listCategories.useQuery();

  const createCategory = trpc.pim.createCategory.useMutation({
    onSuccess: () => {
      utils.pim.listCategories.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const updateCategory = trpc.pim.updateCategory.useMutation({
    onSuccess: () => {
      utils.pim.listCategories.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameTr: category?.nameTr || "",
      nameEn: category?.nameEn || "",
      slug: category?.slug || "",
      icon: category?.icon || "",
      description: category?.description || "",
      parentId: category?.parentId || parentId || null,
    },
  });

  // Auto-generate slug from Turkish name
  const nameTr = watch("nameTr");
  useEffect(() => {
    if (!isEditMode && nameTr) {
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
  }, [nameTr, isEditMode, setValue]);

  const onSubmit = (data: CategoryFormData) => {
    if (isEditMode) {
      updateCategory.mutate({
        id: category.id,
        ...data,
        parentId: data.parentId || undefined,
      });
    } else {
      createCategory.mutate({
        ...data,
        parentId: data.parentId || undefined,
      });
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  // Filter out current category and its children for parent selection
  const availableParents = categories?.filter(c => {
    if (!category) return true;
    if (c.id === category.id) return false;
    // TODO: Also filter out children of current category
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Kategori Düzenle" : "Yeni Kategori"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Turkish Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Türkçe Ad *</label>
            <Input
              {...register("nameTr")}
              placeholder="Örn: Web Hosting"
            />
            {errors.nameTr && (
              <p className="text-xs text-destructive">{errors.nameTr.message}</p>
            )}
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">İngilizce Ad *</label>
            <Input
              {...register("nameEn")}
              placeholder="Örn: Web Hosting"
            />
            {errors.nameEn && (
              <p className="text-xs text-destructive">{errors.nameEn.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug *</label>
            <Input
              {...register("slug")}
              placeholder="Örn: web-hosting"
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Üst Kategori</label>
            <select
              {...register("parentId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Ana Kategori (Üst kategori yok)</option>
              {availableParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameTr}
                </option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium">İkon (Lucide icon adı)</label>
            <Input
              {...register("icon")}
              placeholder="Örn: server, cloud, database"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Açıklama</label>
            <textarea
              {...register("description")}
              placeholder="Kategori açıklaması..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

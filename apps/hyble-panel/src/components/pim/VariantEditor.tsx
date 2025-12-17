"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@hyble/ui";
import { Plus, Trash2, Edit, X, Loader2, Package } from "lucide-react";

const variantSchema = z.object({
  sku: z.string().min(2, "SKU en az 2 karakter olmalı"),
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  price: z.string().min(1, "Fiyat gerekli"),
  currency: z.string().optional(),
  billingPeriod: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface Variant {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod?: string | null;
  isDefault: boolean;
}

interface VariantEditorProps {
  productId: string;
}

export function VariantEditor({ productId }: VariantEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // TODO: Replace with tRPC query when pim router is ready
  const isLoading = false;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      currency: "EUR",
      isDefault: false,
    },
  });

  const onSubmit = async (data: VariantFormData) => {
    setIsPending(true);
    const payload: Variant = {
      id: editingId || Date.now().toString(),
      sku: data.sku,
      name: data.name,
      price: parseFloat(data.price),
      currency: data.currency || "EUR",
      isDefault: data.isDefault ?? false,
      billingPeriod: data.billingPeriod || undefined,
    };

    // TODO: Replace with tRPC mutations when pim router is ready
    await new Promise(resolve => setTimeout(resolve, 300));

    if (editingId) {
      setVariants(prev => prev.map(v => v.id === editingId ? payload : v));
      setEditingId(null);
    } else {
      setVariants(prev => [...prev, payload]);
      setIsAdding(false);
      reset();
    }
    setIsPending(false);
  };

  const handleEdit = (variant: Variant) => {
    setEditingId(variant.id);
    reset({
      sku: variant.sku,
      name: variant.name,
      price: variant.price.toString(),
      currency: variant.currency,
      billingPeriod: variant.billingPeriod || "",
      isDefault: variant.isDefault,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" varyantını silmek istediğinize emin misiniz?`)) {
      setIsDeleting(true);
      // TODO: Replace with tRPC mutation when pim router is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      setVariants(prev => prev.filter(v => v.id !== id));
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({
      sku: "",
      name: "",
      price: "",
      currency: "EUR",
      billingPeriod: "",
      isDefault: false,
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Variant List */}
      {variants.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">Fiyat</th>
                <th className="px-4 py-3 text-left">Dönem</th>
                <th className="px-4 py-3 text-left">Varsayılan</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{variant.sku}</td>
                  <td className="px-4 py-3 font-medium">{variant.name}</td>
                  <td className="px-4 py-3">
                    {Number(variant.price).toFixed(2)} {variant.currency}
                  </td>
                  <td className="px-4 py-3">
                    {variant.billingPeriod ? (
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                        {variant.billingPeriod}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {variant.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                        Varsayılan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(variant)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDelete(variant.id, variant.name)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-md">
          <Package className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Henüz varyant yok</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border p-4 space-y-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">
              {editingId ? "Varyant Düzenle" : "Yeni Varyant"}
            </h3>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">SKU *</label>
              <Input {...register("sku")} placeholder="VAR-001" className="h-9" />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Ad *</label>
              <Input {...register("name")} placeholder="Starter Plan" className="h-9" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Fiyat *</label>
              <Input {...register("price")} type="number" step="0.01" placeholder="9.99" className="h-9" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Dönem</label>
              <select
                {...register("billingPeriod")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">Tek Seferlik</option>
                <option value="monthly">Aylık</option>
                <option value="quarterly">3 Aylık</option>
                <option value="annually">Yıllık</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isDefault")}
                id="isDefault"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isDefault" className="text-sm">Varsayılan varyant</label>
            </div>

            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
              {editingId ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </form>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Varyant Ekle
        </Button>
      )}
    </div>
  );
}

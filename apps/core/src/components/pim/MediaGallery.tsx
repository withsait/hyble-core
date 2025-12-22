// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Input } from "@hyble/ui";
import { Upload, Trash2, Star, Loader2, ImageIcon, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

interface MediaGalleryProps {
  productId: string;
}

export function MediaGallery({ productId }: MediaGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // tRPC queries
  const { data: product, isLoading, refetch } = trpc.pim.getProductById.useQuery({ id: productId });
  const images = product?.media || [];

  // tRPC mutations
  const addMedia = trpc.pim.addMedia.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMedia = trpc.pim.deleteMedia.useMutation({
    onSuccess: () => refetch(),
  });

  const setPrimaryMedia = trpc.pim.setPrimaryMedia.useMutation({
    onSuccess: () => refetch(),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir görsel dosyası seçin");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalı");
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for upload
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        // In production, upload to storage service (S3, Cloudflare R2, etc.)
        // For now, we'll use the base64 directly
        addMedia.mutate({
          productId,
          type: "image",
          url: base64,
          alt: file.name,
          isPrimary: images.length === 0,
        });

        setUploading(false);
      };
      reader.onerror = () => {
        alert("Dosya okunamadı");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    const url = window.prompt("Görsel URL'si girin:");
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert("Geçersiz URL");
      return;
    }

    addMedia.mutate({
      productId,
      type: "image",
      url,
      alt: "Ürün görseli",
      isPrimary: images.length === 0,
    });
  };

  const handleRemove = async (imageId: string) => {
    if (window.confirm("Bu görseli silmek istediğinize emin misiniz?")) {
      deleteMedia.mutate({ id: imageId });
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setPrimaryMedia.mutate({ id: imageId, productId });
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
      {/* Upload Actions */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button variant="outline" size="sm" disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Yükleniyor..." : "Dosya Yükle"}
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={handleAddUrl} disabled={addMedia.isPending}>
          <ImageIcon className="h-4 w-4 mr-2" />
          URL ile Ekle
        </Button>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image: any) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                image.isPrimary
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              {/* Image */}
              <div className="aspect-square relative bg-muted">
                {image.url.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.alt || "Ürün görseli"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt || "Ürün görseli"}
                    fill
                    className="object-cover"
                  />
                )}

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                    Ana Görsel
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isPrimary && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSetPrimary(image.id)}
                    title="Ana görsel yap"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(image.id)}
                  disabled={deleteMedia.isPending}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
          <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Henüz görsel yok</p>
          <p className="text-xs mt-1">Dosya yükleyin veya URL ekleyin</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="max-w-4xl max-h-[90vh] relative">
            {previewUrl.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

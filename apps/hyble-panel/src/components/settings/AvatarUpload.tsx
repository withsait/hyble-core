"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<string>;
  fallbackInitials?: string;
}

export function AvatarUpload({ currentAvatar, onUpload, fallbackInitials = "HY" }: Props) {
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validasyon
    if (file.size > 2 * 1024 * 1024) {
      setError("Dosya boyutu 2MB'dan küçük olmalıdır.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Sadece JPG, PNG veya WebP formatları desteklenir.");
      return;
    }

    // Önizleme
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Yükleme
    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Yükleme başarısız oldu.");
      setPreview(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-slate-400">
            {fallbackInitials}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-medium transition-colors flex items-center text-sm"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Fotoğraf Yükle
          </button>
          {preview && preview !== currentAvatar && (
            <button
              type="button"
              onClick={() => setPreview(currentAvatar)}
              className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          JPG, PNG veya WebP. Max 2MB.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

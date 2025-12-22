"use client";

import { useState } from "react";
import { Star, Plus, X, Loader2, Check, AlertCircle } from "lucide-react";
import { Card } from "@hyble/ui";

interface WriteReviewFormProps {
  productId: string;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WriteReviewForm({
  productId,
  productName,
  onSuccess,
  onCancel,
}: WriteReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    }
  };

  const addCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Lütfen bir puan verin");
      return;
    }
    if (content.trim().length < 20) {
      setError("Yorum en az 20 karakter olmalıdır");
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement with tRPC when available
      console.log("Submitting review:", {
        productId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        pros,
        cons,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Yorumunuz Gönderildi!
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Yorumunuz incelendikten sonra yayınlanacaktır. Teşekkürler!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        &ldquo;{productName}&rdquo; için Yorum Yaz
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Puanınız *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
              {rating > 0 && (
                <>
                  {rating === 1 && "Çok Kötü"}
                  {rating === 2 && "Kötü"}
                  {rating === 3 && "Orta"}
                  {rating === 4 && "İyi"}
                  {rating === 5 && "Mükemmel"}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Başlık (Opsiyonel)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Yorumunuzu özetleyen kısa bir başlık"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Yorumunuz *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            minLength={20}
            maxLength={2000}
            placeholder="Ürün hakkındaki deneyiminizi detaylı bir şekilde paylaşın..."
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
          />
          <p className="mt-1 text-sm text-slate-400">
            {content.length}/2000 karakter (min. 20)
          </p>
        </div>

        {/* Pros */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Artıları (Opsiyonel)
          </label>
          <div className="space-y-2">
            {pros.map((pro, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <span className="flex-1 text-sm text-green-700 dark:text-green-400">
                  {pro}
                </span>
                <button
                  type="button"
                  onClick={() => removePro(i)}
                  className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {pros.length < 5 && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPro())}
                  placeholder="Bir artı ekleyin..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={addPro}
                  disabled={!newPro.trim()}
                  className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cons */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Eksileri (Opsiyonel)
          </label>
          <div className="space-y-2">
            {cons.map((con, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <span className="flex-1 text-sm text-red-700 dark:text-red-400">{con}</span>
                <button
                  type="button"
                  onClick={() => removeCon(i)}
                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {cons.length < 5 && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCon())}
                  placeholder="Bir eksi ekleyin..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={addCon}
                  disabled={!newCon.trim()}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Yorumu Gönder"
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

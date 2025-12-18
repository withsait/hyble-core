"use client";

import { useState } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ChevronDown,
  Filter,
  Check,
  User,
  MessageCircle,
} from "lucide-react";
import { Card } from "@hyble/ui";

interface ReviewAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface SellerResponse {
  content: string;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  pros: string[];
  cons: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  author: ReviewAuthor;
  sellerResponse: SellerResponse | null;
}

interface ProductRating {
  averageRating: number;
  totalReviews: number;
  distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

// Mock data
const mockRating: ProductRating = {
  averageRating: 4.5,
  totalReviews: 128,
  distribution: {
    five: 85,
    four: 28,
    three: 10,
    two: 3,
    one: 2,
  },
};

const mockReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    title: "Harika bir ürün!",
    content: "Bu ürünü aldıktan sonra işlerim çok kolaylaştı. Kesinlikle tavsiye ederim. Kullanımı çok basit ve özellikler tam ihtiyacım olan şeyler.",
    pros: ["Kolay kullanım", "Hızlı kurulum", "İyi dokümantasyon"],
    cons: [],
    isVerifiedPurchase: true,
    helpfulCount: 24,
    createdAt: "2025-01-15T10:30:00Z",
    author: { id: "u1", name: "Ahmet Yılmaz", image: null },
    sellerResponse: {
      content: "Güzel yorumunuz için teşekkür ederiz! Size yardımcı olabildiğimiz için mutluyuz.",
      createdAt: "2025-01-16T09:00:00Z",
    },
  },
  {
    id: "2",
    rating: 4,
    title: "Genel olarak memnunum",
    content: "Ürün beklediğim gibi çalışıyor. Birkaç küçük eksik var ama genel olarak işimi görüyor.",
    pros: ["Uygun fiyat", "İyi destek"],
    cons: ["Bazı özellikler eksik"],
    isVerifiedPurchase: true,
    helpfulCount: 12,
    createdAt: "2025-01-10T14:20:00Z",
    author: { id: "u2", name: "Elif Demir", image: null },
    sellerResponse: null,
  },
  {
    id: "3",
    rating: 5,
    title: "Mükemmel!",
    content: "Tam aradığım ürün. Herkese tavsiye ederim.",
    pros: ["Kaliteli", "Profesyonel"],
    cons: [],
    isVerifiedPurchase: false,
    helpfulCount: 8,
    createdAt: "2025-01-05T08:45:00Z",
    author: { id: "u3", name: null, image: null },
    sellerResponse: null,
  },
];

export function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use mock data
  const rating = mockRating;
  const reviews = mockReviews;

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    console.log("Vote:", reviewId, isHelpful);
    // TODO: Implement with tRPC when available
  };

  const handleReport = async (reviewId: string) => {
    alert("Rapor gönderildi. Teşekkürler!");
    // TODO: Implement with tRPC when available
  };

  const resetFilters = () => {
    setFilterRating(null);
    setSortBy("recent");
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Müşteri Yorumları
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <Filter className="w-4 h-4" />
            Filtrele
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Rating Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  {rating.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(rating.averageRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {rating.totalReviews} değerlendirme
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[
                  { stars: 5, count: rating.distribution.five },
                  { stars: 4, count: rating.distribution.four },
                  { stars: 3, count: rating.distribution.three },
                  { stars: 2, count: rating.distribution.two },
                  { stars: 1, count: rating.distribution.one },
                ].map(({ stars, count }) => {
                  const percentage = rating.totalReviews > 0
                    ? (count / rating.totalReviews) * 100
                    : 0;
                  return (
                    <button
                      key={stars}
                      onClick={() => {
                        setFilterRating(filterRating === stars ? null : stars);
                      }}
                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${
                        filterRating === stars
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-6">
                        {stars}
                      </span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 w-8 text-right">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filterRating && (
                <button
                  onClick={resetFilters}
                  className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Filtreyi Temizle
                </button>
              )}
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            {/* Filters */}
            {showFilters && (
              <Card className="p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Sırala:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                      }}
                      className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recent">En Yeni</option>
                      <option value="helpful">En Faydalı</option>
                      <option value="highest">En Yüksek Puan</option>
                      <option value="lowest">En Düşük Puan</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onVote={handleVote}
                    onReport={handleReport}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Henüz yorum yok
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Bu ürün için henüz yorum yapılmamış. İlk yorumu siz yapın!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: Review;
  onVote: (reviewId: string, isHelpful: boolean) => void;
  onReport: (reviewId: string) => void;
}

function ReviewCard({ review, onVote, onReport }: ReviewCardProps) {
  const [voted, setVoted] = useState<"helpful" | "not_helpful" | null>(null);

  const handleVote = (isHelpful: boolean) => {
    if (voted) return;
    setVoted(isHelpful ? "helpful" : "not_helpful");
    onVote(review.id, isHelpful);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
            {review.author.image ? (
              <img
                src={review.author.image}
                alt={review.author.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {review.author.name || "Anonim Kullanıcı"}
              </span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <Check className="w-3 h-3" />
                  Doğrulanmış Satın Alma
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{new Date(review.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300 dark:text-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title & Content */}
      {review.title && (
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
          {review.title}
        </h4>
      )}
      <p className="text-slate-600 dark:text-slate-400 mb-4">{review.content}</p>

      {/* Pros & Cons */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {review.pros.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                Artıları
              </h5>
              <ul className="space-y-1">
                {review.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                Eksileri
              </h5>
              <ul className="space-y-1">
                {review.cons.map((con, i) => (
                  <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Satıcı Yanıtı
            </span>
            <span className="text-xs text-blue-500 dark:text-blue-400">
              {new Date(review.sellerResponse.createdAt).toLocaleDateString("tr-TR")}
            </span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            {review.sellerResponse.content}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Bu yorum faydalı mıydı?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                voted === "helpful"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{review.helpfulCount}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                voted === "not_helpful"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => onReport(review.id)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Flag className="w-4 h-4" />
          Raporla
        </button>
      </div>
    </Card>
  );
}

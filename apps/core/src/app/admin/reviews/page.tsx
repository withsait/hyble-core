"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Flag,
  Trash2,
  MessageCircle,
  ThumbsUp,
  Download,
  Loader2,
  AlertTriangle,
  User,
  Reply,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  reports: number;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PENDING: { label: "Beklemede", color: "bg-amber-100 text-amber-700", icon: Clock },
  APPROVED: { label: "Onaylı", color: "bg-green-100 text-green-700", icon: CheckCircle },
  REJECTED: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
  FLAGGED: { label: "Raporlandı", color: "bg-orange-100 text-orange-700", icon: Flag },
};

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [replyModal, setReplyModal] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // tRPC queries & mutations
  const { data, isLoading: loading, refetch } = trpc.review.adminList.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
  });

  const approveMutation = trpc.review.approve.useMutation();
  const rejectMutation = trpc.review.reject.useMutation();
  const deleteMutation = trpc.review.delete.useMutation();
  const replyMutation = trpc.review.adminReply.useMutation();

  const reviews: Review[] = data?.reviews || [];

  const filteredReviews = reviews.filter((review) => {
    if (search && !review.content.toLowerCase().includes(search.toLowerCase()) &&
        !review.product.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && review.status !== statusFilter) {
      return false;
    }
    if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }
    return true;
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await approveMutation.mutateAsync({ reviewId });
      refetch();
      setOpenMenu(null);
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await rejectMutation.mutateAsync({ reviewId });
      refetch();
      setOpenMenu(null);
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteMutation.mutateAsync({ reviewId });
      refetch();
      setOpenMenu(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleReply = async () => {
    if (!replyModal || !replyContent.trim()) return;
    try {
      setSubmitting(true);
      await replyMutation.mutateAsync({
        reviewId: replyModal,
        content: replyContent.trim(),
      });
      setReplyModal(null);
      setReplyContent("");
      refetch();
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Yorum Moderasyonu
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Ürün yorumlarını inceleyin ve onaylayın
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <Download className="w-4 h-4" />
          Rapor İndir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reviews.filter(r => r.status === "PENDING").length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Beklemede
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reviews.filter(r => r.reports > 0).length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Raporlandı
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reviews.filter(r => r.status === "APPROVED").length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Onaylı
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : "—"}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Ortalama Puan
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reviews.length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Toplam Yorum
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Yorum veya ürün ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="APPROVED">Onaylı</option>
            <option value="REJECTED">Reddedildi</option>
            <option value="FLAGGED">Raporlandı</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          >
            <option value="all">Tüm Puanlar</option>
            <option value="5">5 Yıldız</option>
            <option value="4">4 Yıldız</option>
            <option value="3">3 Yıldız</option>
            <option value="2">2 Yıldız</option>
            <option value="1">1 Yıldız</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const statusInfo = statusLabels[review.status] || statusLabels.PENDING!;
            const StatusIcon = statusInfo!.icon;
            return (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {review.author.name || "Anonim"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Doğrulanmış
                          </span>
                        )}
                        {review.reports > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            {review.reports} rapor
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span>{review.author.email}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === review.id ? null : review.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      {openMenu === review.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                          <Link
                            href={`/admin/reviews/${review.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                            Detaylar
                          </Link>
                          <button
                            onClick={() => {
                              setReplyModal(review.id);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Reply className="w-4 h-4" />
                            Yanıtla
                          </button>
                          {review.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Onayla
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="w-4 h-4" />
                                Reddet
                              </button>
                            </>
                          )}
                          <hr className="my-1 border-slate-200 dark:border-slate-700" />
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Link
                    href={`/store/${review.product.slug}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {review.product.name}
                  </Link>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                )}
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {review.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.helpfulCount} faydalı buldu
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-16 text-center">
            <Star className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Yorum Bulunamadı
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Arama kriterlerinize uygun yorum yok.
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Yoruma Yanıt Ver
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Bu yanıt mağaza sahibi olarak görünecektir.
            </p>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              placeholder="Yanıtınızı yazın..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim() || submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Yanıtla
              </button>
              <button
                onClick={() => {
                  setReplyModal(null);
                  setReplyContent("");
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

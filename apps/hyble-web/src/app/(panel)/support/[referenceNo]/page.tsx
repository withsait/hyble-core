// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, Loader2, Send, Clock, CheckCircle, AlertTriangle, XCircle,
  MessageSquare, User, Shield, Paperclip, Star, RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "OPEN" | "AWAITING_REPLY" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "Açık", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  AWAITING_REPLY: { label: "Yanıt Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  IN_PROGRESS: { label: "İşleniyor", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: RefreshCw },
  ON_HOLD: { label: "Beklemede", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CLOSED: { label: "Kapatıldı", color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400", icon: XCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "text-slate-500" },
  NORMAL: { label: "Normal", color: "text-blue-500" },
  HIGH: { label: "Yüksek", color: "text-orange-500" },
  URGENT: { label: "Acil", color: "text-red-500" },
};

const categoryLabels: Record<string, string> = {
  BILLING: "Faturalama",
  TECHNICAL: "Teknik Destek",
  ACCOUNT: "Hesap",
  SALES: "Satış",
  FEEDBACK: "Geri Bildirim",
  BUG_REPORT: "Hata Bildirimi",
  FEATURE_REQUEST: "Özellik Talebi",
  OTHER: "Diğer",
};

export default function SupportTicketPage() {
  const params = useParams();
  const router = useRouter();
  const referenceNo = params.referenceNo as string;
  const [newMessage, setNewMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const { data: ticket, isLoading, refetch } = trpc.support.getByRef.useQuery({ referenceNo });

  const addMessage = trpc.support.addMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetch();
    },
  });

  const closeTicket = trpc.support.close.useMutation({
    onSuccess: () => refetch(),
  });

  const reopenTicket = trpc.support.reopen.useMutation({
    onSuccess: () => refetch(),
  });

  const rateTicket = trpc.support.rate.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;
    addMessage.mutate({ ticketId: ticket.id, message: newMessage });
  };

  const handleClose = () => {
    if (ticket && confirm("Destek talebini kapatmak istediğinizden emin misiniz?")) {
      closeTicket.mutate({ ticketId: ticket.id });
    }
  };

  const handleReopen = () => {
    if (ticket) {
      reopenTicket.mutate({ ticketId: ticket.id });
    }
  };

  const handleRate = () => {
    if (ticket && rating > 0) {
      rateTicket.mutate({ ticketId: ticket.id, rating, comment: ratingComment || undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Talep bulunamadı</h2>
        <p className="text-slate-500 mt-2">Bu referans numarasına ait destek talebi bulunamadı.</p>
        <Link href="/support" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
          ← Destek taleplerine dön
        </Link>
      </div>
    );
  }

  const status = statusConfig[ticket.status as TicketStatus];
  const priority = priorityConfig[ticket.priority as TicketPriority];
  const StatusIcon = status.icon;
  const canReply = ticket.status !== "CLOSED";
  const canRate = (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && !ticket.rating;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/support"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-1"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {ticket.referenceNo}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            <span className={`text-xs font-medium ${priority.color}`}>
              {priority.label} Öncelik
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mt-2">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{categoryLabels[ticket.category] || ticket.category}</span>
            <span>•</span>
            <span>Oluşturulma: {format(new Date(ticket.createdAt), "d MMM yyyy HH:mm", { locale: tr })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {ticket.status === "CLOSED" ? (
            <button
              onClick={handleReopen}
              disabled={reopenTicket.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Yeniden Aç
            </button>
          ) : (
            <button
              onClick={handleClose}
              disabled={closeTicket.isPending}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Talebi Kapat
            </button>
          )}
        </div>
      </div>

      {/* Rating Card (if resolved and not rated) */}
      {canRate && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
          <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
            Destek Talebinizi Değerlendirin
          </h3>
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Yorum ekleyin (opsiyonel)..."
            className="w-full px-4 py-3 border border-green-200 dark:border-green-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
            rows={2}
          />
          <button
            onClick={handleRate}
            disabled={rating === 0 || rateTicket.isPending}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {rateTicket.isPending ? "Gönderiliyor..." : "Değerlendir"}
          </button>
        </div>
      )}

      {/* Show rating if already rated */}
      {ticket.rating && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Değerlendirmeniz:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= ticket.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          {ticket.ratingComment && (
            <p className="text-sm text-slate-500 mt-1">{ticket.ratingComment}</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mesajlar ({ticket.messages?.length || 0})
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
          {ticket.messages?.map((message: any) => {
            const isAdmin = message.authorType === "admin";
            return (
              <div
                key={message.id}
                className={`p-6 ${isAdmin ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAdmin
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-slate-100 dark:bg-slate-700"
                  }`}>
                    {isAdmin ? (
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {message.authorName || (isAdmin ? "Destek Ekibi" : "Siz")}
                      </span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                          Destek
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {format(new Date(message.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </span>
                    </div>
                    <div className="mt-2 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment: any) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            <Paperclip className="h-3 w-3" />
                            {attachment.name || "Ek"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Form */}
        {canReply && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              {addMessage.error && (
                <p className="text-sm text-red-500 mt-2">{addMessage.error.message}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500">
                  Destek ekibimiz en kısa sürede yanıt verecektir.
                </p>
                <button
                  type="submit"
                  disabled={addMessage.isPending || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {addMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {!canReply && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 text-center text-slate-500">
            Bu talep kapatılmış. Yeniden açmak için yukarıdaki "Yeniden Aç" butonunu kullanabilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}

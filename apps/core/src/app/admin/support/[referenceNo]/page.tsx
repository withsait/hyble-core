// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Paperclip,
  MoreVertical,
  Flag,
  UserPlus,
  RefreshCw,
  Eye,
  Lock,
  Mail,
  Calendar,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "OPEN" | "AWAITING_REPLY" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
type TicketCategory = "BILLING" | "TECHNICAL" | "ACCOUNT" | "SALES" | "FEEDBACK" | "BUG_REPORT" | "FEATURE_REQUEST" | "OTHER";

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "Açık", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
  AWAITING_REPLY: { label: "Yanıt Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  IN_PROGRESS: { label: "İşleniyor", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
  ON_HOLD: { label: "Beklemede", color: "bg-orange-100 text-orange-700", icon: Clock },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CLOSED: { label: "Kapalı", color: "bg-slate-100 text-slate-600", icon: XCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "bg-slate-100 text-slate-600" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "Yüksek", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "Acil", color: "bg-red-100 text-red-700" },
};

const categoryConfig: Record<TicketCategory, { label: string }> = {
  BILLING: { label: "Faturalama" },
  TECHNICAL: { label: "Teknik" },
  ACCOUNT: { label: "Hesap" },
  SALES: { label: "Satış" },
  FEEDBACK: { label: "Geri Bildirim" },
  BUG_REPORT: { label: "Hata Bildirimi" },
  FEATURE_REQUEST: { label: "Özellik Talebi" },
  OTHER: { label: "Diğer" },
};

export default function AdminSupportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const referenceNo = params.referenceNo as string;
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const { data, isLoading, refetch } = trpc.support.adminGetByRef.useQuery({ referenceNo });

  // Mutations
  const addMessage = trpc.support.adminReply.useMutation({
    onSuccess: () => {
      setReplyMessage("");
      setIsInternalNote(false);
      refetch();
    },
  });

  const updateStatus = trpc.support.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const updatePriority = trpc.support.updatePriority.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.ticket?.messages]);

  const handleSendReply = () => {
    if (!replyMessage.trim() || !data?.ticket) return;
    addMessage.mutate({
      ticketId: data.ticket.id,
      content: replyMessage,
      isInternal: isInternalNote,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.ticket) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Destek talebi bulunamadı</h2>
        <Link href="/admin/support" className="text-primary hover:underline mt-2 inline-block">
          ← Destek taleplerine dön
        </Link>
      </div>
    );
  }

  const { ticket, user } = data;
  const statusInfo = statusConfig[ticket.status as TicketStatus];
  const priorityInfo = priorityConfig[ticket.priority as TicketPriority];
  const categoryInfo = categoryConfig[ticket.category as TicketCategory];
  const StatusIcon = statusInfo?.icon || MessageSquare;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/admin/support"
          className="p-2 rounded-lg hover:bg-muted transition-colors mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <span className="text-sm text-muted-foreground font-mono">#{ticket.referenceNo}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusInfo?.color || ""}`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo?.label || ticket.status}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${priorityInfo?.color || ""}`}>
              {priorityInfo?.label || ticket.priority}
            </span>
            <span className="text-xs px-2 py-1 bg-muted rounded">
              {categoryInfo?.label || ticket.category}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {/* Original ticket */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  {user?.image ? (
                    <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user?.name || user?.email || "Kullanıcı"}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(ticket.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </span>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{ticket.description}</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {ticket.messages?.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.isInternal
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : message.isAdmin
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      message.isAdmin ? "bg-blue-100" : "bg-slate-100"
                    }`}>
                      {message.isAdmin ? (
                        <Building2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {message.isAdmin ? "Destek Ekibi" : (user?.name || "Kullanıcı")}
                        </span>
                        {message.isInternal && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded">
                            <Lock className="h-3 w-3 inline mr-1" />
                            Dahili Not
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                        </span>
                      </div>
                      <div className="mt-2 text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </Card>

          {/* Reply Form */}
          {ticket.status !== "CLOSED" && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Dahili not (kullanıcı göremez)
                    </span>
                  </label>
                </div>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={isInternalNote ? "Dahili not yazın..." : "Yanıtınızı yazın..."}
                  className="w-full px-3 py-2 border rounded-lg bg-background min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" disabled>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Dosya Ekle
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || addMessage.isPending}
                  >
                    {addMessage.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isInternalNote ? "Not Ekle" : "Yanıt Gönder"}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Kullanıcı Bilgileri</h3>
            <div className="flex items-center gap-3 mb-4">
              {user?.image ? (
                <img src={user.image} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{user?.name || "İsimsiz"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Kayıt: {user?.createdAt ? format(new Date(user.createdAt), "d MMM yyyy", { locale: tr }) : "-"}</span>
              </div>
            </div>
            <Link
              href={`/admin/users/${user?.id}`}
              className="block mt-4 text-center text-sm text-primary hover:underline"
            >
              Kullanıcı Profilini Görüntüle →
            </Link>
          </Card>

          {/* Ticket Actions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Talep Yönetimi</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Durum</label>
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus.mutate({ ticketId: ticket.id, status: e.target.value as TicketStatus })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  disabled={updateStatus.isPending}
                >
                  <option value="OPEN">Açık</option>
                  <option value="AWAITING_REPLY">Yanıt Bekliyor</option>
                  <option value="IN_PROGRESS">İşleniyor</option>
                  <option value="ON_HOLD">Beklemede</option>
                  <option value="RESOLVED">Çözüldü</option>
                  <option value="CLOSED">Kapalı</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Öncelik</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => updatePriority.mutate({ ticketId: ticket.id, priority: e.target.value as TicketPriority })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                  disabled={updatePriority.isPending}
                >
                  <option value="LOW">Düşük</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="URGENT">Acil</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Ticket Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Talep Detayları</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Referans No</dt>
                <dd className="font-mono">{ticket.referenceNo}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kategori</dt>
                <dd>{categoryInfo?.label || ticket.category}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Oluşturulma</dt>
                <dd>{format(new Date(ticket.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}</dd>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <dt className="text-muted-foreground">Çözüm Tarihi</dt>
                  <dd>{format(new Date(ticket.resolvedAt), "d MMMM yyyy HH:mm", { locale: tr })}</dd>
                </div>
              )}
              {ticket.closedAt && (
                <div>
                  <dt className="text-muted-foreground">Kapanış Tarihi</dt>
                  <dd>{format(new Date(ticket.closedAt), "d MMMM yyyy HH:mm", { locale: tr })}</dd>
                </div>
              )}
              {ticket.rating && (
                <div>
                  <dt className="text-muted-foreground">Değerlendirme</dt>
                  <dd className="flex items-center gap-1">
                    {"⭐".repeat(ticket.rating)}
                    <span className="text-muted-foreground">({ticket.rating}/5)</span>
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

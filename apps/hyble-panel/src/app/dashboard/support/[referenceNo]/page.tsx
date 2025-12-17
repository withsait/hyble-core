"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button } from "@hyble/ui";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  User,
  Tag,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TicketConversation } from "@/components/support/TicketConversation";

type TicketStatus = "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

const statusConfig: Record<TicketStatus, { icon: React.ReactNode; label: string; color: string }> = {
  NEW: { icon: <AlertCircle className="h-4 w-4" />, label: "Yeni", color: "bg-yellow-100 text-yellow-700" },
  OPEN: { icon: <MessageSquare className="h-4 w-4" />, label: "Açık", color: "bg-blue-100 text-blue-700" },
  PENDING: { icon: <Clock className="h-4 w-4" />, label: "Beklemede", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { icon: <CheckCircle className="h-4 w-4" />, label: "Çözüldü", color: "bg-green-100 text-green-700" },
  CLOSED: { icon: <XCircle className="h-4 w-4" />, label: "Kapatıldı", color: "bg-slate-100 text-slate-600" },
};

export default function TicketDetailPage() {
  const params = useParams();
  const referenceNo = params.referenceNo as string;

  const { data: ticket, isLoading } = trpc.support.tickets.getByReference.useQuery({ referenceNo });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p>Talep bulunamadı</p>
        <Link href="/dashboard/support" className="text-primary hover:underline">
          Taleplere dön
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[ticket.status as TicketStatus];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere Dön
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-muted-foreground">
                {ticket.referenceNo}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
          </div>

          {ticket.status === "RESOLVED" && (
            <Button variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Çözüldü Olarak Onayla
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Conversation */}
        <div className="lg:col-span-2">
          <TicketConversation ticketId={ticket.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Detaylar</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Kategori:</dt>
                <dd className="font-medium">{ticket.category?.nameTr}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">Oluşturulma:</dt>
                <dd className="font-medium">
                  {format(new Date(ticket.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                </dd>
              </div>
              {ticket.assignedAgent && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <dt className="text-muted-foreground">Atanan:</dt>
                  <dd className="font-medium">{ticket.assignedAgent.user?.name || "Destek Ekibi"}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* SLA Info */}
          {ticket.status !== "CLOSED" && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">SLA Bilgileri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İlk Yanıt</span>
                  <span className={ticket.slaFirstResponseAt ? "text-green-600" : "text-yellow-600"}>
                    {ticket.slaFirstResponseAt ? "Yanıtlandı" : "Bekleniyor"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hedef Süre</span>
                  <span className="font-medium">24 saat</span>
                </div>
              </div>
            </Card>
          )}

          {/* Status History */}
          {ticket.statusHistory && ticket.statusHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Durum Geçmişi</h3>
              <div className="space-y-3">
                {ticket.statusHistory.slice(0, 5).map((history: any) => (
                  <div key={history.id} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">
                      {statusConfig[history.newStatus as TicketStatus]?.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(history.createdAt), "d MMM HH:mm", { locale: tr })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

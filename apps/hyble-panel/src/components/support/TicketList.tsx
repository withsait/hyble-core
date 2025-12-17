"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import {
  Ticket,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

interface TicketItem {
  id: string;
  referenceNo: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: { nameTr: string };
  createdAt: Date;
  updatedAt: Date;
  _count?: { messages: number };
}

// Mock data - will be replaced with tRPC query when support router is implemented
const mockTickets: TicketItem[] = [
  {
    id: "1",
    referenceNo: "TKT-2024-001",
    subject: "Sunucu erişim sorunu",
    status: "OPEN",
    priority: "HIGH",
    category: { nameTr: "Teknik Destek" },
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-16"),
    _count: { messages: 3 },
  },
  {
    id: "2",
    referenceNo: "TKT-2024-002",
    subject: "Fatura sorgulama",
    status: "RESOLVED",
    priority: "NORMAL",
    category: { nameTr: "Fatura & Ödeme" },
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-14"),
    _count: { messages: 5 },
  },
];

const statusConfig: Record<TicketStatus, { icon: React.ReactNode; label: string; color: string }> = {
  NEW: { icon: <AlertCircle className="h-4 w-4" />, label: "Yeni", color: "bg-yellow-100 text-yellow-700" },
  OPEN: { icon: <MessageSquare className="h-4 w-4" />, label: "Açık", color: "bg-blue-100 text-blue-700" },
  PENDING: { icon: <Clock className="h-4 w-4" />, label: "Beklemede", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { icon: <CheckCircle className="h-4 w-4" />, label: "Çözüldü", color: "bg-green-100 text-green-700" },
  CLOSED: { icon: <XCircle className="h-4 w-4" />, label: "Kapatıldı", color: "bg-slate-100 text-slate-600" },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "text-slate-500" },
  NORMAL: { label: "Normal", color: "text-blue-500" },
  HIGH: { label: "Yüksek", color: "text-orange-500" },
  CRITICAL: { label: "Kritik", color: "text-red-500" },
};

function TicketSkeleton() {
  return (
    <div className="p-4 border-b animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-5 w-64 bg-muted rounded" />
        </div>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function TicketList() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // TODO: Replace with tRPC query when support router is ready
  // const { data, isLoading, error } = trpc.support.tickets.list.useQuery({
  //   status: statusFilter === "ALL" ? undefined : statusFilter,
  // });
  const isLoading = false;
  const error = null;

  const tickets = statusFilter === "ALL"
    ? mockTickets
    : mockTickets.filter(t => t.status === statusFilter);

  const filteredTickets = tickets.filter((ticket: TicketItem) =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Card className="p-6 border-destructive bg-destructive/10">
        <p className="text-destructive text-sm">
          Destek talepleri yüklenemedi: {error.message}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Destek Taleplerim
          </h2>
          <p className="text-sm text-muted-foreground">
            Toplam {tickets.length} talep
          </p>
        </div>
        <Link href="/dashboard/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Talep
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Talep ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ALL")}
            className="flex-shrink-0"
          >
            Tümü
          </Button>
          {(Object.keys(statusConfig) as TicketStatus[]).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="flex-shrink-0"
            >
              {statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <Card className="divide-y">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <TicketSkeleton key={i} />)
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">Henüz talep yok</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Sorularınız için yeni bir destek talebi oluşturun
            </p>
            <Link href="/dashboard/support/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Talep Oluştur
              </Button>
            </Link>
          </div>
        ) : (
          filteredTickets.map((ticket: TicketItem) => {
            const statusInfo = statusConfig[ticket.status];
            const priorityInfo = priorityConfig[ticket.priority];

            return (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.referenceNo}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {ticket.referenceNo}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                    <span className={`text-xs font-medium ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                  <h4 className="font-medium truncate">{ticket.subject}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{ticket.category?.nameTr}</span>
                    <span>•</span>
                    <span>{format(new Date(ticket.createdAt), "d MMM yyyy HH:mm", { locale: tr })}</span>
                    {ticket._count?.messages && ticket._count.messages > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket._count.messages} mesaj
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </Link>
            );
          })
        )}
      </Card>
    </div>
  );
}

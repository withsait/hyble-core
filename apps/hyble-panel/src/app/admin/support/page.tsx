"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Ticket,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Loader2,
  Users,
  BarChart,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  NEW: { label: "Yeni", color: "bg-yellow-100 text-yellow-700" },
  OPEN: { label: "Açık", color: "bg-blue-100 text-blue-700" },
  PENDING: { label: "Beklemede", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Kapatıldı", color: "bg-slate-100 text-slate-600" },
};

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock stats
  const stats = {
    total: 156,
    open: 23,
    pending: 12,
    avgResponseTime: "4.2 saat",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Ticket className="h-7 w-7 text-primary" />
            Destek Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Müşteri taleplerini yönetin ve yanıtlayın
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Agentler
          </Button>
          <Button variant="outline">
            <BarChart className="h-4 w-4 mr-2" />
            Raporlar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Talep</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border-blue-200">
          <p className="text-sm text-muted-foreground">Açık</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.open}</p>
        </Card>
        <Card className="p-4 border-orange-200">
          <p className="text-sm text-muted-foreground">Beklemede</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ort. Yanıt</p>
          <p className="text-2xl font-bold mt-1">{stats.avgResponseTime}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Talep ara (Referans no, konu, müşteri...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ALL")}
          >
            Tümü
          </Button>
          {(Object.keys(statusConfig) as TicketStatus[]).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Ticket Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-semibold">Talep</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Müşteri</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Agent</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample rows */}
              {[
                { id: "TKT-2024-00156", subject: "Sunucu erişim sorunu", customer: "John Doe", category: "Teknik", status: "OPEN" as TicketStatus, agent: "Ahmet", date: new Date() },
                { id: "TKT-2024-00155", subject: "Fatura sorgusu", customer: "Jane Smith", category: "Fatura", status: "PENDING" as TicketStatus, agent: null, date: new Date() },
                { id: "TKT-2024-00154", subject: "Domain transfer", customer: "Bob Wilson", category: "Genel", status: "RESOLVED" as TicketStatus, agent: "Mehmet", date: new Date() },
              ].map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-muted-foreground">{ticket.id}</p>
                    <p className="font-medium">{ticket.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{ticket.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status].color}`}>
                      {statusConfig[ticket.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {ticket.agent || <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(ticket.date, "d MMM HH:mm", { locale: tr })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

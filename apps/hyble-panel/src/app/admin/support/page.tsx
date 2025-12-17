"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Ticket,
  Search,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Loader2,
  Users,
  BarChart,
  RefreshCw,
  AlertTriangle,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TicketStatus = "OPEN" | "AWAITING_REPLY" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
type TicketCategory = "BILLING" | "TECHNICAL" | "ACCOUNT" | "SALES" | "FEEDBACK" | "BUG_REPORT" | "FEATURE_REQUEST" | "OTHER";

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  OPEN: { label: "Açık", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  AWAITING_REPLY: { label: "Yanıt Bekliyor", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  IN_PROGRESS: { label: "İşlemde", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ON_HOLD: { label: "Beklemede", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CLOSED: { label: "Kapatıldı", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "bg-slate-100 text-slate-600" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "Yüksek", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "Acil", color: "bg-red-100 text-red-700" },
};

const categoryConfig: Record<TicketCategory, { label: string }> = {
  BILLING: { label: "Fatura" },
  TECHNICAL: { label: "Teknik" },
  ACCOUNT: { label: "Hesap" },
  SALES: { label: "Satış" },
  FEEDBACK: { label: "Geri Bildirim" },
  BUG_REPORT: { label: "Hata Bildirimi" },
  FEATURE_REQUEST: { label: "Özellik Talebi" },
  OTHER: { label: "Diğer" },
};

interface TicketItem {
  id: string;
  referenceNo: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
  _count?: {
    messages?: number;
  };
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  // tRPC queries
  const { data: statsData, isLoading: statsLoading } = trpc.support.stats.useQuery();
  const { data: ticketsData, isLoading: ticketsLoading, refetch } = trpc.support.adminList.useQuery({
    limit: 50,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
    category: categoryFilter !== "ALL" ? categoryFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const isLoading = statsLoading || ticketsLoading;
  const tickets = (ticketsData?.tickets ?? []) as TicketItem[];

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
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Talep</p>
          <p className="text-2xl font-bold mt-1">{statsData?.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground">Açık</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{statsData?.open ?? 0}</p>
        </Card>
        <Card className="p-4 border-purple-200 dark:border-purple-800">
          <p className="text-sm text-muted-foreground">İşlemde</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">{statsData?.inProgress ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground">Çözüldü</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{statsData?.resolved ?? 0}</p>
        </Card>
        <Card className="p-4 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Ort. Puan</p>
              <p className="text-2xl font-bold text-amber-600">
                {statsData?.avgRating ? statsData.avgRating.toFixed(1) : "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Stats */}
      {statsData?.byCategory && Object.keys(statsData.byCategory).length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Kategoriye Göre</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statsData.byCategory).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
              >
                <span>{categoryConfig[category as TicketCategory]?.label || category}</span>
                <span className="font-semibold">{String(count)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Referans no veya konu ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Öncelikler</option>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ALL")}
        >
          Tümü
        </Button>
        <Button
          variant={statusFilter === "OPEN" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("OPEN")}
        >
          Açık
        </Button>
        <Button
          variant={statusFilter === "AWAITING_REPLY" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("AWAITING_REPLY")}
        >
          Yanıt Bekliyor
        </Button>
        <Button
          variant={statusFilter === "IN_PROGRESS" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("IN_PROGRESS")}
        >
          İşlemde
        </Button>
        <Button
          variant={priorityFilter === "URGENT" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setStatusFilter("ALL");
            setPriorityFilter(priorityFilter === "URGENT" ? "ALL" : "URGENT");
          }}
          className={priorityFilter === "URGENT" ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-600"}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Acil
        </Button>
      </div>

      {/* Ticket Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-semibold">Talep</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Öncelik</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Mesaj</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Tarih</th>
                <th className="text-left px-4 py-3 text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {ticketsLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">Destek talebi bulunamadı</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/admin/support/${ticket.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-muted-foreground">{ticket.referenceNo}</p>
                      <p className="font-medium line-clamp-1">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {categoryConfig[ticket.category as TicketCategory]?.label || ticket.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityConfig[ticket.priority as TicketPriority]?.color || "bg-slate-100"}`}>
                        {ticket.priority === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {priorityConfig[ticket.priority as TicketPriority]?.label || ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status as TicketStatus]?.color || "bg-slate-100"}`}>
                        {statusConfig[ticket.status as TicketStatus]?.label || ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {ticket._count?.messages ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(ticket.createdAt), "d MMM HH:mm", { locale: tr })}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

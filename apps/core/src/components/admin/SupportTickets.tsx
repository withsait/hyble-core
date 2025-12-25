"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Send,
  Paperclip,
  Tag,
  MoreVertical,
} from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  userId: string;
  user: { name: string | null; email: string };
  assignedTo: { name: string | null; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  isStaff: boolean;
  createdAt: Date;
  user: { name: string | null; email: string };
}

const statusConfig = {
  OPEN: { color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", icon: AlertCircle, label: "Açık" },
  IN_PROGRESS: { color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock, label: "İşlemde" },
  WAITING: { color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", icon: Clock, label: "Beklemede" },
  RESOLVED: { color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Çözüldü" },
  CLOSED: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: XCircle, label: "Kapalı" },
};

const priorityConfig = {
  LOW: { color: "text-slate-500", label: "Düşük" },
  MEDIUM: { color: "text-blue-500", label: "Orta" },
  HIGH: { color: "text-amber-500", label: "Yüksek" },
  URGENT: { color: "text-red-500", label: "Acil" },
};

export function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [page, searchQuery, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      };
      const response = await fetch(`/api/trpc/support.listTickets?input=${encodeURIComponent(JSON.stringify({ json: params }))}`);
      const data = await response.json();
      if (data.result?.data) {
        setTickets(data.result.data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket["status"]) => {
    try {
      await fetch("/api/trpc/support.updateTicketStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { ticketId, status } }),
      });
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const assignTicket = async (ticketId: string, userId: string) => {
    try {
      await fetch("/api/trpc/support.assignTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { ticketId, assigneeId: userId } }),
      });
      fetchTickets();
    } catch (error) {
      console.error("Failed to assign ticket:", error);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    setSending(true);
    try {
      await fetch("/api/trpc/support.replyToTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            ticketId: selectedTicket.id,
            content: replyContent,
            isStaff: true,
          },
        }),
      });
      setReplyContent("");
      // Refresh ticket details
      const response = await fetch(`/api/trpc/support.getTicket?input=${encodeURIComponent(JSON.stringify({ json: { ticketId: selectedTicket.id } }))}`);
      const data = await response.json();
      if (data.result?.data) {
        setSelectedTicket(data.result.data);
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden">
      {/* Ticket List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Destek Talepleri</h3>
            </div>
            <button
              onClick={fetchTickets}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ticket ara..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
            >
              <option value="">Tüm Durumlar</option>
              <option value="OPEN">Açık</option>
              <option value="IN_PROGRESS">İşlemde</option>
              <option value="WAITING">Beklemede</option>
              <option value="RESOLVED">Çözüldü</option>
              <option value="CLOSED">Kapalı</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
              <option value="URGENT">Acil</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Yükleniyor...</div>
          ) : tickets.length === 0 ? (
            <div className="p-4 text-center text-slate-500">Ticket bulunamadı</div>
          ) : (
            tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status];
              const priorityInfo = priorityConfig[ticket.priority];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-[#0d0d14]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">#{ticket.ticketNumber}</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {ticket.user.name || ticket.user.email}
                    </p>
                    <span className={`text-xs font-medium ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-500">Sayfa {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ticket Detail */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-slate-400">#{selectedTicket.ticketNumber}</span>
                    <span className={`text-sm font-medium ${priorityConfig[selectedTicket.priority].color}`}>
                      {priorityConfig[selectedTicket.priority].label}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as Ticket["status"])}
                    className={`px-3 py-1.5 text-sm rounded-lg border-0 ${statusConfig[selectedTicket.status].color}`}
                  >
                    <option value="OPEN">Açık</option>
                    <option value="IN_PROGRESS">İşlemde</option>
                    <option value="WAITING">Beklemede</option>
                    <option value="RESOLVED">Çözüldü</option>
                    <option value="CLOSED">Kapalı</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedTicket.user.name || selectedTicket.user.email}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {selectedTicket.category}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedTicket.createdAt).toLocaleString("tr-TR")}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isStaff ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.isStaff
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-[#1a1a24] text-slate-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isStaff ? "text-blue-200" : "text-slate-400"}`}>
                      {message.user.name || message.user.email} - {new Date(message.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm resize-none"
                  />
                  <button className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-slate-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={sendReply}
                  disabled={!replyContent.trim() || sending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl flex items-center gap-2 self-end"
                >
                  <Send className="w-4 h-4" />
                  Gönder
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Görüntülemek için bir ticket seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

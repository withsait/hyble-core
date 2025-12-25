"use client";

import { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Paperclip,
  Send,
  User,
  HelpCircle,
  Book,
  FileText,
  Video,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Filter,
  ArrowLeft,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: "user" | "support";
    senderName: string;
    senderAvatar?: string;
    content: string;
    attachments?: string[];
    createdAt: string;
  }[];
}

// Mock data
const tickets: Ticket[] = [
  {
    id: "TKT-456",
    subject: "Unable to connect custom domain",
    category: "Technical",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-01-14T10:30:00",
    updatedAt: "2024-01-14T14:20:00",
    messages: [
      {
        id: "msg_1",
        sender: "user",
        senderName: "John Doe",
        content:
          "I'm trying to connect my custom domain mydomain.com to my Hyble website but I keep getting an error saying DNS records are not configured correctly.",
        createdAt: "2024-01-14T10:30:00",
      },
      {
        id: "msg_2",
        sender: "support",
        senderName: "Sarah (Support)",
        content:
          "Hi John! Thank you for reaching out. I'd be happy to help you with your domain configuration. Could you please share a screenshot of your current DNS settings?",
        createdAt: "2024-01-14T11:15:00",
      },
      {
        id: "msg_3",
        sender: "user",
        senderName: "John Doe",
        content: "Here are my current DNS settings. I've added the A record pointing to your IP.",
        attachments: ["dns_screenshot.png"],
        createdAt: "2024-01-14T12:00:00",
      },
      {
        id: "msg_4",
        sender: "support",
        senderName: "Sarah (Support)",
        content:
          "I see the issue! You need to add a CNAME record for www pointing to cname.hyble.co. DNS propagation can take up to 48 hours, but usually completes within a few hours. I'll monitor this and update you once it's live.",
        createdAt: "2024-01-14T14:20:00",
      },
    ],
  },
  {
    id: "TKT-455",
    subject: "Billing question about subscription",
    category: "Billing",
    priority: "medium",
    status: "resolved",
    createdAt: "2024-01-13T09:00:00",
    updatedAt: "2024-01-13T15:30:00",
    messages: [
      {
        id: "msg_1",
        sender: "user",
        senderName: "John Doe",
        content: "Can I upgrade my subscription mid-cycle?",
        createdAt: "2024-01-13T09:00:00",
      },
      {
        id: "msg_2",
        sender: "support",
        senderName: "Mike (Support)",
        content:
          "Yes! When you upgrade, you'll only be charged the prorated difference for the remaining days in your billing cycle.",
        createdAt: "2024-01-13T15:30:00",
      },
    ],
  },
];

const helpArticles = [
  {
    id: 1,
    title: "Getting Started with Hyble",
    category: "Getting Started",
    views: 1250,
    icon: Book,
  },
  {
    id: 2,
    title: "Connecting Your Custom Domain",
    category: "Domains",
    views: 890,
    icon: FileText,
  },
  {
    id: 3,
    title: "Understanding Your Billing",
    category: "Billing",
    views: 756,
    icon: FileText,
  },
  {
    id: 4,
    title: "Website Builder Tutorial",
    category: "Website",
    views: 2100,
    icon: Video,
  },
];

export function SupportCenter() {
  const [activeTab, setActiveTab] = useState<"tickets" | "help" | "new">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  // New ticket form
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
            <AlertCircle size={12} />
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
            <Clock size={12} />
            In Progress
          </span>
        );
      case "waiting":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
            <Clock size={12} />
            Waiting
          </span>
        );
      case "resolved":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
            <CheckCircle size={12} />
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
            <XCircle size={12} />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitTicket = () => {
    console.log("Submitting ticket:", newTicketData);
    setNewTicketData({
      subject: "",
      category: "",
      priority: "medium",
      message: "",
    });
    setActiveTab("tickets");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get help and manage your support tickets
          </p>
        </div>
        <button
          onClick={() => setActiveTab("new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "tickets", label: "My Tickets", icon: Ticket },
          { id: "help", label: "Help Center", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedTicket(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets Tab */}
      {activeTab === "tickets" && !selectedTicket && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Ticket className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{ticket.id}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.category} • Updated {formatDate(ticket.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(ticket.status)}
                    <div className="flex items-center gap-1 text-gray-500">
                      <MessageSquare size={14} />
                      <span className="text-sm">{ticket.messages.length}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail */}
      {activeTab === "tickets" && selectedTicket && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to tickets
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Ticket header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">{selectedTicket.id}</span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTicket.subject}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedTicket.category} • Created {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "" : "flex-row-reverse"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      message.sender === "user" ? "" : "text-right"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          {message.attachments.map((attachment, i) => (
                            <a
                              key={i}
                              href="#"
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <Paperclip size={12} />
                              {attachment}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply form */}
            {selectedTicket.status !== "closed" && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Paperclip size={16} />
                    Attach file
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send size={16} />
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Resolved feedback */}
            {selectedTicket.status === "resolved" && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  This ticket has been resolved. Was this helpful?
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50">
                    <ThumbsUp size={14} />
                    Yes
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    <ThumbsDown size={14} />
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Center Tab */}
      {activeTab === "help" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
            />
          </div>

          {/* Popular articles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Articles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {helpArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/help/${article.id}`}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <article.icon className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {article.category} • {article.views.toLocaleString()} views
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Getting Started", count: 12 },
                { name: "Account & Billing", count: 8 },
                { name: "Website Builder", count: 15 },
                { name: "Domains & DNS", count: 6 },
                { name: "Hosting", count: 10 },
                { name: "E-commerce", count: 9 },
                { name: "Security", count: 7 },
                { name: "API & Integrations", count: 5 },
              ].map((category, i) => (
                <a
                  key={i}
                  href={`/help/category/${category.name.toLowerCase().replace(/ & /g, "-")}`}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </p>
                  <p className="text-sm text-gray-500">{category.count} articles</p>
                </a>
              ))}
            </div>
          </div>

          {/* Contact support */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Can't find what you're looking for?
                </h2>
                <p className="opacity-90">
                  Our support team is here to help you 24/7
                </p>
              </div>
              <button
                onClick={() => setActiveTab("new")}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Form */}
      {activeTab === "new" && (
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Create New Support Ticket
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newTicketData.subject}
                  onChange={(e) =>
                    setNewTicketData({ ...newTicketData, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="sales">Sales</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={newTicketData.message}
                  onChange={(e) =>
                    setNewTicketData({ ...newTicketData, message: e.target.value })
                  }
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attachments (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Paperclip className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop files here or{" "}
                    <button className="text-blue-600 dark:text-blue-400 hover:underline">
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max file size: 10MB. Supported: jpg, png, pdf, zip
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setActiveTab("tickets")}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTicket}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send size={16} />
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportCenter;

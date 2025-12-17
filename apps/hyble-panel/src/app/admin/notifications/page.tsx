// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Bell,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Send,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  Users,
  Megaphone,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Tab = "send" | "broadcast" | "stats";
type NotificationType = "SYSTEM" | "SECURITY" | "BILLING" | "ORDER" | "SUBSCRIPTION" | "SUPPORT" | "MARKETING" | "ANNOUNCEMENT";
type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const typeConfig: Record<NotificationType, { label: string; icon: typeof Bell; color: string }> = {
  SYSTEM: { label: "Sistem", icon: Bell, color: "bg-slate-100 text-slate-700" },
  SECURITY: { label: "Güvenlik", icon: ShieldAlert, color: "bg-red-100 text-red-700" },
  BILLING: { label: "Faturalama", icon: CreditCard, color: "bg-green-100 text-green-700" },
  ORDER: { label: "Sipariş", icon: Package, color: "bg-blue-100 text-blue-700" },
  SUBSCRIPTION: { label: "Abonelik", icon: Bell, color: "bg-purple-100 text-purple-700" },
  SUPPORT: { label: "Destek", icon: MessageSquare, color: "bg-yellow-100 text-yellow-700" },
  MARKETING: { label: "Pazarlama", icon: Megaphone, color: "bg-pink-100 text-pink-700" },
  ANNOUNCEMENT: { label: "Duyuru", icon: Megaphone, color: "bg-orange-100 text-orange-700" },
};

const priorityConfig: Record<NotificationPriority, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "text-slate-500" },
  NORMAL: { label: "Normal", color: "text-blue-500" },
  HIGH: { label: "Yüksek", color: "text-orange-500" },
  URGENT: { label: "Acil", color: "text-red-500" },
};

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("send");
  const [searchUserId, setSearchUserId] = useState("");

  // Send notification form
  const [sendForm, setSendForm] = useState({
    userId: "",
    type: "SYSTEM" as NotificationType,
    priority: "NORMAL" as NotificationPriority,
    title: "",
    message: "",
    actionUrl: "",
    actionLabel: "",
  });

  // Broadcast form
  const [broadcastForm, setBroadcastForm] = useState({
    type: "ANNOUNCEMENT" as "SYSTEM" | "ANNOUNCEMENT" | "MARKETING",
    priority: "NORMAL" as NotificationPriority,
    title: "",
    message: "",
    actionUrl: "",
    actionLabel: "",
  });

  const tabs = [
    { id: "send" as Tab, label: "Bildirim Gönder", icon: <Send className="h-4 w-4" /> },
    { id: "broadcast" as Tab, label: "Toplu Bildirim", icon: <Megaphone className="h-4 w-4" /> },
    { id: "stats" as Tab, label: "İstatistikler", icon: <Bell className="h-4 w-4" /> },
  ];

  // tRPC queries and mutations
  const { data: stats, isLoading: statsLoading } = trpc.notification.stats.useQuery();

  const sendNotification = trpc.notification.send.useMutation({
    onSuccess: () => {
      alert("Bildirim başarıyla gönderildi!");
      setSendForm({
        userId: "",
        type: "SYSTEM",
        priority: "NORMAL",
        title: "",
        message: "",
        actionUrl: "",
        actionLabel: "",
      });
    },
    onError: (error) => {
      alert("Hata: " + error.message);
    },
  });

  const broadcastNotification = trpc.notification.broadcast.useMutation({
    onSuccess: (data) => {
      alert(`${data.created} kullanıcıya bildirim gönderildi!`);
      setBroadcastForm({
        type: "ANNOUNCEMENT",
        priority: "NORMAL",
        title: "",
        message: "",
        actionUrl: "",
        actionLabel: "",
      });
    },
    onError: (error) => {
      alert("Hata: " + error.message);
    },
  });

  const handleSendNotification = () => {
    if (!sendForm.userId || !sendForm.title || !sendForm.message) {
      alert("Kullanıcı ID, başlık ve mesaj zorunludur.");
      return;
    }

    sendNotification.mutate({
      userId: sendForm.userId,
      type: sendForm.type,
      priority: sendForm.priority,
      title: sendForm.title,
      message: sendForm.message,
      actionUrl: sendForm.actionUrl || undefined,
      actionLabel: sendForm.actionLabel || undefined,
    });
  };

  const handleBroadcast = () => {
    if (!broadcastForm.title || !broadcastForm.message) {
      alert("Başlık ve mesaj zorunludur.");
      return;
    }

    if (!confirm("Tüm aktif kullanıcılara bildirim göndermek istediğinizden emin misiniz?")) {
      return;
    }

    broadcastNotification.mutate({
      type: broadcastForm.type,
      priority: broadcastForm.priority,
      title: broadcastForm.title,
      message: broadcastForm.message,
      actionUrl: broadcastForm.actionUrl || undefined,
      actionLabel: broadcastForm.actionLabel || undefined,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            Bildirim Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Kullanıcılara bildirim gönderin ve istatistikleri görün
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-3 bg-muted rounded w-20 mb-2" />
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Toplam Bildirim</p>
              <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
            </Card>
            <Card className="p-4 border-yellow-200">
              <p className="text-sm text-muted-foreground">Okunmamış</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats?.unread || 0}</p>
            </Card>
            <Card className="p-4 border-blue-200">
              <p className="text-sm text-muted-foreground">Sistem</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats?.byType?.SYSTEM || 0}</p>
            </Card>
            <Card className="p-4 border-green-200">
              <p className="text-sm text-muted-foreground">Duyuru</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats?.byType?.ANNOUNCEMENT || 0}</p>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Send Single Notification Tab */}
      {activeTab === "send" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" />
            Tek Kullanıcıya Bildirim Gönder
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kullanıcı ID *</label>
              <Input
                placeholder="cuid..."
                value={sendForm.userId}
                onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tip</label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value as NotificationType })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Öncelik</label>
              <select
                value={sendForm.priority}
                onChange={(e) => setSendForm({ ...sendForm, priority: e.target.value as NotificationPriority })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlık *</label>
              <Input
                placeholder="Bildirim başlığı"
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Mesaj *</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg bg-background min-h-[100px]"
                placeholder="Bildirim içeriği..."
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksiyon URL (isteğe bağlı)</label>
              <Input
                placeholder="/billing veya https://..."
                value={sendForm.actionUrl}
                onChange={(e) => setSendForm({ ...sendForm, actionUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksiyon Butonu Metni</label>
              <Input
                placeholder="Detayları Gör"
                value={sendForm.actionLabel}
                onChange={(e) => setSendForm({ ...sendForm, actionLabel: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSendNotification}
              disabled={sendNotification.isPending}
            >
              {sendNotification.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Bildirim Gönder
            </Button>
          </div>
        </Card>
      )}

      {/* Broadcast Tab */}
      {activeTab === "broadcast" && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Tüm Kullanıcılara Bildirim Gönder</h3>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Dikkat!</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Bu işlem tüm aktif kullanıcılara bildirim gönderecektir. Lütfen içeriği dikkatlice kontrol edin.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tip</label>
              <select
                value={broadcastForm.type}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as "SYSTEM" | "ANNOUNCEMENT" | "MARKETING" })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="SYSTEM">Sistem</option>
                <option value="ANNOUNCEMENT">Duyuru</option>
                <option value="MARKETING">Pazarlama</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Öncelik</label>
              <select
                value={broadcastForm.priority}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as NotificationPriority })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Başlık *</label>
              <Input
                placeholder="Duyuru başlığı"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Mesaj *</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg bg-background min-h-[120px]"
                placeholder="Duyuru içeriği..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksiyon URL (isteğe bağlı)</label>
              <Input
                placeholder="/announcements/1 veya https://..."
                value={broadcastForm.actionUrl}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, actionUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksiyon Butonu Metni</label>
              <Input
                placeholder="Daha Fazla Bilgi"
                value={broadcastForm.actionLabel}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, actionLabel: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleBroadcast}
              disabled={broadcastNotification.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {broadcastNotification.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Megaphone className="h-4 w-4 mr-2" />
              )}
              Toplu Bildirim Gönder
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Bildirim Türlerine Göre Dağılım</h3>
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(typeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = stats?.byType?.[key] || 0;
                  return (
                    <div key={key} className={`p-4 rounded-lg ${config.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Bildirim Özeti</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span>Toplam Bildirim</span>
                </div>
                <span className="font-bold">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-yellow-500" />
                  <span>Okunmamış Bildirim</span>
                </div>
                <span className="font-bold text-yellow-600">{stats?.unread || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Okunan Bildirim</span>
                </div>
                <span className="font-bold text-green-600">{(stats?.total || 0) - (stats?.unread || 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

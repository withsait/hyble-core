"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Bell,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Edit,
  Trash2,
  Copy,
  Send,
  CheckCircle,
  XCircle,
  Search,
  Eye,
} from "lucide-react";

type Tab = "templates" | "webhooks" | "logs";
type Channel = "EMAIL" | "PUSH" | "SMS" | "IN_APP";

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channels: Channel[];
  subject?: string;
  body: string;
  active: boolean;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggeredAt?: Date;
  successRate: number;
}

const channelIcons: Record<Channel, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  PUSH: <Bell className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
  IN_APP: <MessageSquare className="h-4 w-4" />,
};

const channelLabels: Record<Channel, string> = {
  EMAIL: "Email",
  PUSH: "Push",
  SMS: "SMS",
  IN_APP: "Uygulama İçi",
};

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "templates" as Tab, label: "Şablonlar", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "webhooks" as Tab, label: "Webhooks", icon: <Webhook className="h-4 w-4" /> },
    { id: "logs" as Tab, label: "Loglar", icon: <Bell className="h-4 w-4" /> },
  ];

  // Mock templates
  const templates: NotificationTemplate[] = [
    {
      id: "1",
      name: "Hoş Geldin",
      type: "WELCOME",
      channels: ["EMAIL", "IN_APP"],
      subject: "Hyble'a Hoş Geldiniz!",
      body: "Merhaba {{name}}, Hyble ailesine katıldığınız için teşekkürler...",
      active: true,
    },
    {
      id: "2",
      name: "Fatura Oluşturuldu",
      type: "INVOICE_CREATED",
      channels: ["EMAIL", "IN_APP", "PUSH"],
      subject: "Yeni Faturanız Hazır",
      body: "{{invoice_number}} numaralı faturanız oluşturuldu. Tutar: €{{amount}}",
      active: true,
    },
    {
      id: "3",
      name: "Ödeme Başarılı",
      type: "PAYMENT_SUCCESS",
      channels: ["EMAIL", "IN_APP"],
      subject: "Ödemeniz Alındı",
      body: "€{{amount}} tutarındaki ödemeniz başarıyla alındı.",
      active: true,
    },
    {
      id: "4",
      name: "Ticket Yanıtı",
      type: "TICKET_REPLY",
      channels: ["EMAIL", "IN_APP", "PUSH"],
      subject: "Destek Talebinize Yanıt",
      body: "{{ticket_reference}} numaralı destek talebinize yanıt verildi.",
      active: true,
    },
    {
      id: "5",
      name: "2FA Kodu",
      type: "TWO_FACTOR",
      channels: ["EMAIL", "SMS"],
      subject: "Doğrulama Kodunuz",
      body: "Doğrulama kodunuz: {{code}}",
      active: true,
    },
  ];

  // Mock webhooks
  const webhooks: WebhookEndpoint[] = [
    {
      id: "1",
      name: "Slack Bildirimleri",
      url: "https://hooks.slack.com/services/xxx",
      events: ["invoice.paid", "ticket.created"],
      active: true,
      lastTriggeredAt: new Date(),
      successRate: 98.5,
    },
    {
      id: "2",
      name: "CRM Entegrasyonu",
      url: "https://api.crm.example.com/webhooks",
      events: ["user.created", "subscription.changed"],
      active: true,
      lastTriggeredAt: new Date("2024-12-15"),
      successRate: 100,
    },
    {
      id: "3",
      name: "Analytics",
      url: "https://analytics.example.com/events",
      events: ["*"],
      active: false,
      successRate: 0,
    },
  ];

  // Mock logs
  const logs = [
    { id: "1", template: "Fatura Oluşturuldu", channel: "EMAIL", recipient: "john@example.com", status: "DELIVERED", sentAt: new Date() },
    { id: "2", template: "Ticket Yanıtı", channel: "PUSH", recipient: "user_123", status: "SENT", sentAt: new Date() },
    { id: "3", template: "2FA Kodu", channel: "SMS", recipient: "+90532xxx", status: "FAILED", sentAt: new Date() },
  ];

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Bildirim şablonları ve webhook yapılandırması
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "templates" && (
            <Button onClick={() => setShowAddTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Şablon Ekle
            </Button>
          )}
          {activeTab === "webhooks" && (
            <Button onClick={() => setShowAddWebhook(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Webhook Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Şablon</p>
          <p className="text-2xl font-bold mt-1">{templates.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Aktif Webhook</p>
          <p className="text-2xl font-bold mt-1">{webhooks.filter((w) => w.active).length}</p>
        </Card>
        <Card className="p-4 border-green-200">
          <p className="text-sm text-muted-foreground">Bugün Gönderilen</p>
          <p className="text-2xl font-bold mt-1 text-green-600">1,234</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Başarı Oranı</p>
          <p className="text-2xl font-bold mt-1">98.5%</p>
        </Card>
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

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Şablon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {template.type}
                      </span>
                      {template.active ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Pasif
                        </span>
                      )}
                    </div>
                    {template.subject && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Konu:</strong> {template.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.body}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {template.channels.map((channel) => (
                        <span
                          key={channel}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                        >
                          {channelIcons[channel]}
                          {channelLabels[channel]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Webhook className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">{webhook.name}</h4>
                    {webhook.active ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Pasif
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground mb-2">
                    {webhook.url}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Başarı Oranı: {webhook.successRate}%</span>
                    {webhook.lastTriggeredAt && (
                      <span>
                        Son Tetikleme: {webhook.lastTriggeredAt.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Şablon</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Kanal</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Alıcı</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{log.template}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        {channelIcons[log.channel as Channel]}
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{log.recipient}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        log.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                        log.status === "SENT" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {log.status === "DELIVERED" ? <CheckCircle className="h-3 w-3" /> :
                         log.status === "SENT" ? <Send className="h-3 w-3" /> :
                         <XCircle className="h-3 w-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {log.sentAt.toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Template Modal */}
      {showAddTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h3 className="font-semibold mb-4">Yeni Bildirim Şablonu</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Şablon Adı</Label>
                <Input placeholder="Hoş Geldin Emaili" />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Input placeholder="WELCOME" />
              </div>
              <div className="space-y-2">
                <Label>Kanallar</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(channelLabels) as Channel[]).map((channel) => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{channelLabels[channel]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Konu (Email için)</Label>
                <Input placeholder="Hyble'a Hoş Geldiniz!" />
              </div>
              <div className="space-y-2">
                <Label>İçerik</Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                  placeholder="Merhaba {{name}}, ..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddTemplate(false)}>
                İptal
              </Button>
              <Button>Oluştur</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Webhook Modal */}
      {showAddWebhook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h3 className="font-semibold mb-4">Yeni Webhook</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>İsim</Label>
                <Input placeholder="Slack Bildirimleri" />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input placeholder="https://hooks.example.com/webhook" />
              </div>
              <div className="space-y-2">
                <Label>Eventler</Label>
                <Input placeholder="invoice.paid, ticket.created (virgülle ayırın)" />
              </div>
              <div className="space-y-2">
                <Label>Secret (isteğe bağlı)</Label>
                <Input type="password" placeholder="whsec_..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddWebhook(false)}>
                İptal
              </Button>
              <Button>Oluştur</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Bot,
  Plus,
  MessageSquare,
  BookOpen,
  BarChart,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react";

type Tab = "knowledge" | "conversations" | "analytics";

export default function AdminHylaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("knowledge");
  const [showAddKB, setShowAddKB] = useState(false);

  const tabs = [
    { id: "knowledge" as Tab, label: "Bilgi Bankası", icon: <BookOpen className="h-4 w-4" /> },
    { id: "conversations" as Tab, label: "Sohbetler", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "analytics" as Tab, label: "Analitik", icon: <BarChart className="h-4 w-4" /> },
  ];

  // Mock KB entries
  const kbEntries = [
    { id: "1", question: "Fiyatlar nedir?", answer: "Hyble'da Free, Starter ve Business planları mevcuttur...", tags: ["fiyat", "plan"], viewCount: 156 },
    { id: "2", question: "Nasıl kurulum yapılır?", answer: "Dashboard'dan Yeni Site butonuna tıklayarak...", tags: ["kurulum", "başlangıç"], viewCount: 234 },
    { id: "3", question: "Domain nasıl eklenir?", answer: "Site ayarlarından Domains sekmesine giderek...", tags: ["domain", "dns"], viewCount: 89 },
  ];

  // Mock conversations
  const conversations = [
    { id: "1", user: "john@example.com", messages: 5, intent: "SUPPORT", status: "ACTIVE", createdAt: new Date() },
    { id: "2", user: "guest_12345", messages: 3, intent: "SALES", status: "HANDOFF", createdAt: new Date() },
    { id: "3", user: "jane@example.com", messages: 8, intent: "BILLING", status: "CLOSED", createdAt: new Date() },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bot className="h-7 w-7 text-primary" />
            Hyla AI Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            AI asistanı ve bilgi bankasını yönetin
          </p>
        </div>
        <Button onClick={() => setShowAddKB(true)}>
          <Plus className="h-4 w-4 mr-2" />
          KB Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Sohbet</p>
          <p className="text-2xl font-bold mt-1">1,234</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">KB Makalesi</p>
          <p className="text-2xl font-bold mt-1">{kbEntries.length}</p>
        </Card>
        <Card className="p-4 border-green-200">
          <p className="text-sm text-muted-foreground">Pozitif Geri Bildirim</p>
          <p className="text-2xl font-bold mt-1 text-green-600">87%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Handoff Oranı</p>
          <p className="text-2xl font-bold mt-1">12%</p>
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

      {/* Knowledge Base Tab */}
      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="KB ara..." className="pl-10" />
            </div>
          </div>

          {kbEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{entry.question}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {entry.answer}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {entry.viewCount} görüntülenme
                    </span>
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

      {/* Conversations Tab */}
      {activeTab === "conversations" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Niyet</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Mesaj</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv) => (
                  <tr key={conv.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">{conv.user}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{conv.intent}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{conv.messages}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        conv.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        conv.status === "HANDOFF" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {conv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Geri Bildirim Dağılımı</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>Pozitif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "87%" }} />
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>Negatif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "13%" }} />
                  </div>
                  <span className="text-sm font-medium">13%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Niyet Dağılımı</h3>
            <div className="space-y-3">
              {[
                { label: "Destek", value: 45, color: "bg-blue-500" },
                { label: "Satış", value: 25, color: "bg-green-500" },
                { label: "Fatura", value: 20, color: "bg-purple-500" },
                { label: "Genel", value: 10, color: "bg-slate-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Add KB Modal */}
      {showAddKB && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h3 className="font-semibold mb-4">Yeni Bilgi Bankası Kaydı</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Soru</Label>
                <Input placeholder="Kullanıcıların sorabileceği soru" />
              </div>
              <div className="space-y-2">
                <Label>Cevap</Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[150px]"
                  placeholder="Detaylı cevap (Markdown destekli)"
                />
              </div>
              <div className="space-y-2">
                <Label>Etiketler</Label>
                <Input placeholder="fiyat, plan, kurulum (virgülle ayırın)" />
              </div>
              <div className="space-y-2">
                <Label>Dil</Label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddKB(false)}>
                İptal
              </Button>
              <Button>Ekle</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

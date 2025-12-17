"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  Cloud,
  Server,
  Users,
  Activity,
  Search,
  Filter,
  Eye,
  Pause,
  Play,
  Trash2,
  Settings,
  HardDrive,
  Wifi,
} from "lucide-react";

type Tab = "sites" | "plans" | "usage";

export default function AdminCloudPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sites");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "sites" as Tab, label: "Tüm Siteler", icon: <Server className="h-4 w-4" /> },
    { id: "plans" as Tab, label: "Planlar", icon: <Cloud className="h-4 w-4" /> },
    { id: "usage" as Tab, label: "Kaynak Kullanımı", icon: <Activity className="h-4 w-4" /> },
  ];

  // Mock sites
  const sites = [
    { id: "1", name: "portfolio-site", user: "john@example.com", plan: "Free", status: "ACTIVE", bandwidth: "2.3GB", storage: "45MB" },
    { id: "2", name: "e-commerce-app", user: "jane@example.com", plan: "Starter", status: "ACTIVE", bandwidth: "15.8GB", storage: "230MB" },
    { id: "3", name: "blog-site", user: "bob@example.com", plan: "Free", status: "SUSPENDED", bandwidth: "12.1GB", storage: "89MB" },
  ];

  // Mock plans
  const plans = [
    { id: "free", name: "Free", price: 0, sites: 1, bandwidth: "10GB", storage: "100MB", users: 156 },
    { id: "starter", name: "Starter", price: 5, sites: 3, bandwidth: "50GB", storage: "1GB", users: 45 },
    { id: "business", name: "Business", price: 15, sites: 10, bandwidth: "200GB", storage: "5GB", users: 12 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Cloud className="h-7 w-7 text-primary" />
            Cloud Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Hosting sitelerini ve planları yönetin
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Ayarlar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Site</p>
          <p className="text-2xl font-bold mt-1">213</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Aktif Deployment</p>
          <p className="text-2xl font-bold mt-1">198</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Bandwidth (Bu Ay)</p>
          </div>
          <p className="text-2xl font-bold mt-1">1.2 TB</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Toplam Storage</p>
          </div>
          <p className="text-2xl font-bold mt-1">45 GB</p>
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

      {/* Sites Tab */}
      {activeTab === "sites" && (
        <>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Site veya kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Site</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Plan</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Bandwidth</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Storage</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.name}.hyble.net</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{site.user}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-muted px-2 py-1 rounded">{site.plan}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{site.bandwidth}</td>
                      <td className="px-4 py-3 text-sm">{site.storage}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          site.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {site.status === "ACTIVE" ? "Aktif" : "Askıda"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            {site.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <span className="text-2xl font-bold">
                  €{plan.price}<span className="text-sm font-normal text-muted-foreground">/ay</span>
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Site</span>
                  <span className="font-medium">{plan.sites}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bandwidth</span>
                  <span className="font-medium">{plan.bandwidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">{plan.storage}</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="text-muted-foreground">Kullanıcı Sayısı</span>
                  <span className="font-bold text-primary">{plan.users}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Düzenle
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Kaynak Kullanım Grafiği</h3>
          <p className="text-muted-foreground text-sm">
            Günlük bandwidth ve storage kullanım verileri
          </p>
          <div className="h-64 bg-muted/30 rounded-lg mt-4 flex items-center justify-center">
            <p className="text-muted-foreground">Grafik alanı (Recharts ile)</p>
          </div>
        </Card>
      )}
    </div>
  );
}

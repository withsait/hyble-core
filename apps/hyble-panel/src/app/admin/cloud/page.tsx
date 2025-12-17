// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Construction,
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

  // Mock stats for demo
  const stats = {
    totalSites: 0,
    activeDeployments: 0,
    bandwidth: "0 GB",
    storage: "0 GB",
  };

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
        <Button disabled>
          <Settings className="h-4 w-4 mr-2" />
          Ayarlar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Site</p>
          <p className="text-2xl font-bold mt-1">{stats.totalSites}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Aktif Deployment</p>
          <p className="text-2xl font-bold mt-1">{stats.activeDeployments}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Bandwidth (Bu Ay)</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.bandwidth}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Toplam Storage</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.storage}</p>
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

      {/* Construction Notice */}
      <Card className="p-12">
        <div className="text-center">
          <Construction className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Yapım Aşamasında</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cloud hosting modülü şu anda geliştirme aşamasındadır.
            Site oluşturma, deployment yönetimi ve kaynak izleme özellikleri yakında eklenecektir.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium mb-2">Planlanan Özellikler:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Statik site hosting</li>
              <li>• Git entegrasyonu (GitHub, GitLab)</li>
              <li>• Otomatik SSL sertifikası</li>
              <li>• Custom domain desteği</li>
              <li>• Build & deploy pipeline</li>
              <li>• Bandwidth ve storage izleme</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

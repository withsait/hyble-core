// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  Activity,
  Plus,
  Server,
  Globe,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Construction,
} from "lucide-react";

type Tab = "monitors" | "alerts" | "rules";
type MonitorType = "HTTP" | "TCP" | "DOCKER" | "POSTGRES";
type MonitorStatus = "UP" | "DOWN" | "DEGRADED";

const typeIcons: Record<MonitorType, React.ReactNode> = {
  HTTP: <Globe className="h-4 w-4" />,
  TCP: <Wifi className="h-4 w-4" />,
  DOCKER: <Server className="h-4 w-4" />,
  POSTGRES: <Database className="h-4 w-4" />,
};

const statusColors: Record<MonitorStatus, string> = {
  UP: "bg-green-500",
  DOWN: "bg-red-500",
  DEGRADED: "bg-yellow-500",
};

export default function AdminWatchPage() {
  const [activeTab, setActiveTab] = useState<Tab>("monitors");

  const tabs = [
    { id: "monitors" as Tab, label: "Monitörler", icon: <Activity className="h-4 w-4" /> },
    { id: "alerts" as Tab, label: "Alarmlar", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "rules" as Tab, label: "Kurallar", icon: <Server className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="h-7 w-7 text-primary" />
            Monitoring (Watch)
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistem sağlığını izleyin ve alarmları yönetin
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Monitör Ekle
        </Button>
      </div>

      {/* Stats - Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Çalışıyor</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Çalışmıyor</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Aktif Alarm</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Ort. Latency</p>
              <p className="text-2xl font-bold">--ms</p>
            </div>
          </div>
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
            Monitoring modülü şu anda geliştirme aşamasındadır.
            Uptime monitoring, health checks ve alerting özellikleri yakında eklenecektir.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium mb-2">Planlanan Özellikler:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• HTTP endpoint monitoring</li>
              <li>• TCP port checks</li>
              <li>• PostgreSQL health checks</li>
              <li>• Docker container monitoring</li>
              <li>• Latency tracking</li>
              <li>• Alert rules & notifications</li>
              <li>• Status page entegrasyonu</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

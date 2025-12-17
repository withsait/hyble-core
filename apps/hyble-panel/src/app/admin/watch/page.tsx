"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);
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
  Play,
  Pause,
  RefreshCw,
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
  const [showAddMonitor, setShowAddMonitor] = useState(false);

  const tabs = [
    { id: "monitors" as Tab, label: "Monitörler", icon: <Activity className="h-4 w-4" /> },
    { id: "alerts" as Tab, label: "Alarmlar", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "rules" as Tab, label: "Kurallar", icon: <Server className="h-4 w-4" /> },
  ];

  // Mock monitors
  const monitors = [
    { id: "1", name: "API Health", type: "HTTP" as MonitorType, target: "https://api.hyble.co/health", status: "UP" as MonitorStatus, latency: 45, interval: 60 },
    { id: "2", name: "Dashboard", type: "HTTP" as MonitorType, target: "https://panel.hyble.co", status: "UP" as MonitorStatus, latency: 120, interval: 60 },
    { id: "3", name: "PostgreSQL", type: "POSTGRES" as MonitorType, target: "localhost:5432", status: "UP" as MonitorStatus, latency: 5, interval: 30 },
    { id: "4", name: "Redis", type: "TCP" as MonitorType, target: "localhost:6379", status: "UP" as MonitorStatus, latency: 2, interval: 30 },
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
        <Button onClick={() => setShowAddMonitor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Monitör Ekle
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Çalışıyor</p>
              <p className="text-2xl font-bold text-green-600">4</p>
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
              <p className="text-2xl font-bold">43ms</p>
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

      {/* Monitors Tab */}
      {activeTab === "monitors" && (
        <div className="space-y-4">
          {monitors.map((monitor) => (
            <Card key={monitor.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`h-3 w-3 rounded-full ${statusColors[monitor.status]}`} />
                  <div className="p-2 bg-muted rounded-lg">
                    {typeIcons[monitor.type]}
                  </div>
                  <div>
                    <p className="font-medium">{monitor.name}</p>
                    <p className="text-sm text-muted-foreground">{monitor.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="font-medium">{monitor.latency}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Interval</p>
                    <p className="font-medium">{monitor.interval}s</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <Card className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="font-medium">Aktif alarm yok</p>
            <p className="text-sm mt-1">Tüm sistemler normal çalışıyor</p>
          </div>
        </Card>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Alarm Kuralları</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Kural Ekle
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">API Latency {">"} 2000ms</p>
                <p className="text-sm text-muted-foreground">5 dakika boyunca - Kritik</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Aktif</span>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">CPU {">"} 90%</p>
                <p className="text-sm text-muted-foreground">10 dakika boyunca - Uyarı</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Aktif</span>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Monitor Modal */}
      {showAddMonitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h3 className="font-semibold mb-4">Yeni Monitör Ekle</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>İsim</Label>
                <Input placeholder="API Health Check" />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="HTTP">HTTP</option>
                  <option value="TCP">TCP</option>
                  <option value="DOCKER">Docker</option>
                  <option value="POSTGRES">PostgreSQL</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Hedef</Label>
                <Input placeholder="https://api.example.com/health" />
              </div>
              <div className="space-y-2">
                <Label>Kontrol Aralığı (saniye)</Label>
                <Input type="number" placeholder="60" defaultValue={60} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddMonitor(false)}>
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

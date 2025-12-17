"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  Edit,
  Trash2,
  Send,
} from "lucide-react";

type Tab = "services" | "incidents" | "maintenances";
type ServiceStatus = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "MAINTENANCE";

const statusColors: Record<ServiceStatus, string> = {
  OPERATIONAL: "bg-green-500",
  DEGRADED: "bg-yellow-500",
  PARTIAL_OUTAGE: "bg-orange-500",
  MAJOR_OUTAGE: "bg-red-500",
  MAINTENANCE: "bg-blue-500",
};

export default function AdminStatusPage() {
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const tabs = [
    { id: "services" as Tab, label: "Servisler", icon: <Activity className="h-4 w-4" /> },
    { id: "incidents" as Tab, label: "Olaylar", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "maintenances" as Tab, label: "Bakımlar", icon: <Wrench className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="h-7 w-7 text-primary" />
            Status Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Servis durumlarını ve olayları yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowIncidentForm(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Olay Oluştur
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Bakım Planla
          </Button>
        </div>
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

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Servis Grupları</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Grup Ekle
              </Button>
            </div>

            <div className="space-y-4">
              {/* Core Services */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Core Services</h4>
                <div className="space-y-2">
                  {["API", "Dashboard", "Authentication"].map((service) => (
                    <div key={service} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${statusColors.OPERATIONAL}`} />
                        <span>{service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="text-xs border rounded px-2 py-1">
                          <option value="OPERATIONAL">Çalışıyor</option>
                          <option value="DEGRADED">Yavaş</option>
                          <option value="PARTIAL_OUTAGE">Kısmi Kesinti</option>
                          <option value="MAJOR_OUTAGE">Ana Kesinti</option>
                          <option value="MAINTENANCE">Bakım</option>
                        </select>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud Services */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Cloud Services</h4>
                <div className="space-y-2">
                  {["EU-West", "US-East", "AP-South"].map((service) => (
                    <div key={service} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${statusColors.OPERATIONAL}`} />
                        <span>{service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="text-xs border rounded px-2 py-1">
                          <option value="OPERATIONAL">Çalışıyor</option>
                          <option value="DEGRADED">Yavaş</option>
                          <option value="PARTIAL_OUTAGE">Kısmi Kesinti</option>
                          <option value="MAJOR_OUTAGE">Ana Kesinti</option>
                        </select>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === "incidents" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Aktif ve Geçmiş Olaylar</h3>
          <div className="space-y-4">
            {/* Sample incident */}
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">API Response Delays</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Etkilenen: API, Dashboard
                  </p>
                  <p className="text-sm mt-2">
                    Investigating - API endpoint'lerinde yavaşlama tespit edildi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-1" />
                    Güncelle
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Çözüldü
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Maintenances Tab */}
      {activeTab === "maintenances" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Planlı Bakımlar</h3>
          <div className="space-y-4">
            {/* Sample maintenance */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Database Maintenance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    25 Aralık 2024, 02:00 - 04:00 UTC
                  </p>
                  <p className="text-sm mt-2">
                    Veritabanı güncellemesi ve optimizasyonu yapılacaktır.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Incident Modal */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h3 className="font-semibold mb-4">Yeni Olay Oluştur</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input placeholder="API Response Delays" />
              </div>
              <div className="space-y-2">
                <Label>Etkilenen Servisler</Label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>API</option>
                  <option>Dashboard</option>
                  <option>Authentication</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Etki Seviyesi</Label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="DEGRADED">Performans Düşüklüğü</option>
                  <option value="PARTIAL_OUTAGE">Kısmi Kesinti</option>
                  <option value="MAJOR_OUTAGE">Ana Kesinti</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>İlk Güncelleme</Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                  placeholder="Durumu açıklayın..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowIncidentForm(false)}>
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

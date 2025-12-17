"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@hyble/ui";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Wrench,
  Loader2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";

type ServiceStatus = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "MAINTENANCE";

interface Service {
  id: string;
  name: string;
  description?: string;
  currentStatus: ServiceStatus;
  dailyUptimes?: { date: Date; status: ServiceStatus; percentage: number }[];
}

interface ServiceGroup {
  id: string;
  name: string;
  services: Service[];
}

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  OPERATIONAL: { icon: <CheckCircle className="h-4 w-4" />, label: "Çalışıyor", color: "text-green-600", bgColor: "bg-green-500" },
  DEGRADED: { icon: <AlertTriangle className="h-4 w-4" />, label: "Performans Düşüklüğü", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  PARTIAL_OUTAGE: { icon: <AlertCircle className="h-4 w-4" />, label: "Kısmi Kesinti", color: "text-orange-600", bgColor: "bg-orange-500" },
  MAJOR_OUTAGE: { icon: <XCircle className="h-4 w-4" />, label: "Ana Kesinti", color: "text-red-600", bgColor: "bg-red-500" },
  MAINTENANCE: { icon: <Wrench className="h-4 w-4" />, label: "Bakım", color: "text-blue-600", bgColor: "bg-blue-500" },
};

function UptimeBar({ dailyUptimes }: { dailyUptimes: Service["dailyUptimes"] }) {
  // Last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(new Date(), 89 - i);
    const uptimeData = dailyUptimes?.find(
      (u) => format(new Date(u.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return {
      date,
      status: uptimeData?.status || "OPERATIONAL",
      percentage: uptimeData?.percentage || 100,
    };
  });

  return (
    <div className="flex gap-0.5">
      {days.map((day, i) => {
        const config = statusConfig[day.status as ServiceStatus];
        return (
          <div
            key={i}
            className={`h-8 w-1 rounded-sm ${config.bgColor} hover:opacity-80 transition-opacity cursor-pointer`}
            title={`${format(day.date, "d MMM yyyy", { locale: tr })}: ${config.label} (${day.percentage}%)`}
          />
        );
      })}
    </div>
  );
}

export function StatusPage() {
  const { data, isLoading, error } = trpc.status.getAll.useQuery();

  const groups = data?.groups || [];
  const activeIncidents = data?.activeIncidents || [];
  const scheduledMaintenances = data?.scheduledMaintenances || [];

  // Calculate overall status
  const getOverallStatus = (): ServiceStatus => {
    const allServices = groups.flatMap((g: ServiceGroup) => g.services);
    if (allServices.some((s: Service) => s.currentStatus === "MAJOR_OUTAGE")) return "MAJOR_OUTAGE";
    if (allServices.some((s: Service) => s.currentStatus === "PARTIAL_OUTAGE")) return "PARTIAL_OUTAGE";
    if (allServices.some((s: Service) => s.currentStatus === "MAINTENANCE")) return "MAINTENANCE";
    if (allServices.some((s: Service) => s.currentStatus === "DEGRADED")) return "DEGRADED";
    return "OPERATIONAL";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive bg-destructive/10">
        <p className="text-destructive">Durum bilgileri yüklenemedi</p>
      </Card>
    );
  }

  const overallStatus = getOverallStatus();
  const overallConfig = statusConfig[overallStatus];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className={`p-8 rounded-2xl text-center ${
        overallStatus === "OPERATIONAL"
          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
          : overallStatus === "MAJOR_OUTAGE"
          ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
          : "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900"
      }`}>
        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
          overallStatus === "OPERATIONAL"
            ? "bg-green-100 text-green-600"
            : overallStatus === "MAJOR_OUTAGE"
            ? "bg-red-100 text-red-600"
            : "bg-yellow-100 text-yellow-600"
        }`}>
          {overallConfig.icon && <span className="scale-[2]">{overallConfig.icon}</span>}
        </div>
        <h1 className={`text-2xl font-bold ${overallConfig.color}`}>
          {overallStatus === "OPERATIONAL"
            ? "Tüm Sistemler Çalışıyor"
            : overallConfig.label}
        </h1>
        <p className="text-muted-foreground mt-2">
          Son güncelleme: {format(new Date(), "d MMMM yyyy, HH:mm", { locale: tr })}
        </p>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <Card className="p-6 border-red-200 dark:border-red-900">
          <h2 className="font-semibold text-red-600 mb-4">Aktif Olaylar</h2>
          <div className="space-y-4">
            {activeIncidents.map((incident: any) => (
              <div key={incident.id} className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium">{incident.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {incident.affectedServices?.join(", ")}
                </p>
                {incident.updates?.[0] && (
                  <p className="text-sm mt-2">{incident.updates[0].message}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scheduled Maintenances */}
      {scheduledMaintenances.length > 0 && (
        <Card className="p-6 border-blue-200 dark:border-blue-900">
          <h2 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Planlı Bakımlar
          </h2>
          <div className="space-y-4">
            {scheduledMaintenances.map((maintenance: any) => (
              <div key={maintenance.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium">{maintenance.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(maintenance.scheduledStart), "d MMM HH:mm", { locale: tr })} -{" "}
                  {format(new Date(maintenance.scheduledEnd), "d MMM HH:mm", { locale: tr })}
                </p>
                <p className="text-sm mt-2">{maintenance.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Services */}
      {groups.map((group: ServiceGroup) => (
        <Card key={group.id} className="p-6">
          <h2 className="font-semibold mb-4">{group.name}</h2>
          <div className="space-y-4">
            {group.services.map((service) => {
              const config = statusConfig[service.currentStatus];
              return (
                <div key={service.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className={`text-sm ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <UptimeBar dailyUptimes={service.dailyUptimes} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90 gün önce</span>
                    <span>Bugün</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Subscribe */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Güncellemelerden Haberdar Olun</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sistem durumu değişikliklerinde email alın
            </p>
          </div>
          <a
            href="/status/subscribe"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Abone Ol
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </div>
  );
}

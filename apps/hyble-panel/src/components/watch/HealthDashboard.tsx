"use client";

import { Card } from "@hyble/ui";
import {
  Activity,
  Server,
  Database,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";

type MonitorStatus = "UP" | "DOWN" | "DEGRADED" | "MAINTENANCE";
type MonitorType = "HTTP" | "TCP" | "DOCKER" | "POSTGRES";

interface Monitor {
  id: string;
  name: string;
  type: MonitorType;
  target: string;
  currentStatus: MonitorStatus;
  lastCheckedAt?: Date;
  latestCheck?: {
    latency: number;
    statusCode?: number;
  };
}

interface ServerMetric {
  cpuPercent: number;
  memoryUsage: number;
  memoryTotal: number;
  diskUsage: number;
  diskTotal: number;
}

// Mock data - will be replaced with tRPC query when watch router is implemented
const mockMonitors: Monitor[] = [
  {
    id: "1",
    name: "Ana Website",
    type: "HTTP",
    target: "https://hyble.co",
    currentStatus: "UP",
    lastCheckedAt: new Date(),
    latestCheck: { latency: 45, statusCode: 200 },
  },
  {
    id: "2",
    name: "API Gateway",
    type: "HTTP",
    target: "https://api.hyble.co",
    currentStatus: "UP",
    lastCheckedAt: new Date(),
    latestCheck: { latency: 32, statusCode: 200 },
  },
  {
    id: "3",
    name: "PostgreSQL",
    type: "POSTGRES",
    target: "localhost:5432",
    currentStatus: "UP",
    lastCheckedAt: new Date(),
    latestCheck: { latency: 5 },
  },
  {
    id: "4",
    name: "Redis",
    type: "TCP",
    target: "localhost:6379",
    currentStatus: "UP",
    lastCheckedAt: new Date(),
    latestCheck: { latency: 2 },
  },
  {
    id: "5",
    name: "Hyble Panel",
    type: "DOCKER",
    target: "hyble-panel",
    currentStatus: "UP",
    lastCheckedAt: new Date(),
    latestCheck: { latency: 0 },
  },
];

const mockMetrics: ServerMetric = {
  cpuPercent: 35.5,
  memoryUsage: 8 * 1024 * 1024 * 1024, // 8GB
  memoryTotal: 32 * 1024 * 1024 * 1024, // 32GB
  diskUsage: 200 * 1024 * 1024 * 1024, // 200GB
  diskTotal: 500 * 1024 * 1024 * 1024, // 500GB
};

const mockAlerts: any[] = [];

const statusConfig: Record<MonitorStatus, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  UP: { icon: <CheckCircle className="h-4 w-4" />, label: "Çalışıyor", color: "text-green-600", bgColor: "bg-green-500" },
  DOWN: { icon: <XCircle className="h-4 w-4" />, label: "Çalışmıyor", color: "text-red-600", bgColor: "bg-red-500" },
  DEGRADED: { icon: <AlertTriangle className="h-4 w-4" />, label: "Yavaş", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  MAINTENANCE: { icon: <Clock className="h-4 w-4" />, label: "Bakımda", color: "text-blue-600", bgColor: "bg-blue-500" },
};

const typeIcons: Record<MonitorType, React.ReactNode> = {
  HTTP: <Globe className="h-5 w-5" />,
  TCP: <Wifi className="h-5 w-5" />,
  DOCKER: <Server className="h-5 w-5" />,
  POSTGRES: <Database className="h-5 w-5" />,
};

function MetricCard({ icon, label, value, total, unit, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  unit: string;
  color: string;
}) {
  const percentage = total ? (value / total) * 100 : value;
  const isWarning = percentage > 80;
  const isCritical = percentage > 95;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-semibold">
            {total ? `${value.toFixed(1)} / ${total.toFixed(1)} ${unit}` : `${value.toFixed(1)}${unit}`}
          </p>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </Card>
  );
}

export function HealthDashboard() {
  // TODO: Replace with tRPC query when watch router is ready
  // const { data, isLoading, error } = trpc.watch.getOverview.useQuery(undefined, {
  //   refetchInterval: 30000, // Refresh every 30 seconds
  // });
  const isLoading = false;
  const error = null;

  const monitors = mockMonitors;
  const metrics = mockMetrics;
  const alerts = mockAlerts;

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
        <p className="text-destructive">Monitoring verileri yüklenemedi</p>
      </Card>
    );
  }

  // Calculate overall status
  const upCount = monitors.filter((m: Monitor) => m.currentStatus === "UP").length;
  const totalCount = monitors.length;
  const overallHealthy = upCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className={`p-6 rounded-xl ${
        overallHealthy
          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
          : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
              overallHealthy ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {overallHealthy ? "Tüm Sistemler Sağlıklı" : "Dikkat Gerektiren Durumlar Var"}
              </h2>
              <p className="text-muted-foreground">
                {upCount} / {totalCount} servis çalışıyor
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                {alerts.length} Aktif Alarm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6 border-red-200 dark:border-red-900">
          <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Aktif Alarmlar
          </h3>
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{alert.rule?.monitor?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.rule?.metricType} {alert.rule?.operator} {alert.rule?.threshold}
                  </p>
                </div>
                <span className="text-sm text-red-600">
                  Değer: {alert.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Server Metrics */}
      {metrics && (
        <div>
          <h3 className="font-semibold mb-4">Sunucu Kaynakları</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<Cpu className="h-5 w-5" />}
              label="CPU Kullanımı"
              value={metrics.cpuPercent}
              unit="%"
              color="bg-blue-100 text-blue-600"
            />
            <MetricCard
              icon={<Activity className="h-5 w-5" />}
              label="RAM"
              value={metrics.memoryUsage / (1024 * 1024 * 1024)}
              total={metrics.memoryTotal / (1024 * 1024 * 1024)}
              unit="GB"
              color="bg-purple-100 text-purple-600"
            />
            <MetricCard
              icon={<HardDrive className="h-5 w-5" />}
              label="Disk"
              value={metrics.diskUsage / (1024 * 1024 * 1024)}
              total={metrics.diskTotal / (1024 * 1024 * 1024)}
              unit="GB"
              color="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      )}

      {/* Monitors */}
      <div>
        <h3 className="font-semibold mb-4">Servis Durumları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitors.map((monitor: Monitor) => {
            const config = statusConfig[monitor.currentStatus];
            const icon = typeIcons[monitor.type];

            return (
              <Card key={monitor.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {icon}
                    </div>
                    <div>
                      <p className="font-medium">{monitor.name}</p>
                      <p className="text-xs text-muted-foreground">{monitor.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    monitor.currentStatus === "UP"
                      ? "bg-green-100 text-green-700"
                      : monitor.currentStatus === "DOWN"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="truncate">
                    <span className="font-medium">Hedef:</span> {monitor.target}
                  </p>
                  {monitor.latestCheck && (
                    <p>
                      <span className="font-medium">Gecikme:</span> {monitor.latestCheck.latency}ms
                      {monitor.latestCheck.statusCode && ` (HTTP ${monitor.latestCheck.statusCode})`}
                    </p>
                  )}
                  {monitor.lastCheckedAt && (
                    <p>
                      <span className="font-medium">Son Kontrol:</span>{" "}
                      {new Date(monitor.lastCheckedAt).toLocaleTimeString("tr-TR")}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

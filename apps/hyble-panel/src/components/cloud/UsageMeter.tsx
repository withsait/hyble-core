"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@hyble/ui";
import {
  Activity,
  HardDrive,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";

interface UsageMeterProps {
  siteSlug: string;
}

interface UsageData {
  bandwidth: { used: number; limit: number; unit: string };
  storage: { used: number; limit: number; unit: string };
  buildMinutes: { used: number; limit: number };
  deployments: { count: number; limit: number };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const isWarning = percentage > 80;
  const isCritical = percentage > 95;

  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isCritical
            ? "bg-red-500"
            : isWarning
            ? "bg-yellow-500"
            : color
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function UsageMeter({ siteSlug }: UsageMeterProps) {
  const { data, isLoading } = trpc.cloud.usage.get.useQuery({ siteSlug });

  const usage: UsageData = data?.usage || {
    bandwidth: { used: 0, limit: 10737418240, unit: "bytes" }, // 10GB
    storage: { used: 0, limit: 1073741824, unit: "bytes" }, // 1GB
    buildMinutes: { used: 0, limit: 100 },
    deployments: { count: 0, limit: 50 },
  };

  const plan = data?.plan || { name: "Free", slug: "free" };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const metrics = [
    {
      icon: <Activity className="h-4 w-4" />,
      label: "Bandwidth",
      used: formatBytes(usage.bandwidth.used),
      limit: formatBytes(usage.bandwidth.limit),
      value: usage.bandwidth.used,
      max: usage.bandwidth.limit,
      color: "bg-blue-500",
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: "Storage",
      used: formatBytes(usage.storage.used),
      limit: formatBytes(usage.storage.limit),
      value: usage.storage.used,
      max: usage.storage.limit,
      color: "bg-purple-500",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Build Süresi",
      used: `${usage.buildMinutes.used} dk`,
      limit: `${usage.buildMinutes.limit} dk`,
      value: usage.buildMinutes.used,
      max: usage.buildMinutes.limit,
      color: "bg-green-500",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "Deployments",
      used: `${usage.deployments.count}`,
      limit: `${usage.deployments.limit}`,
      value: usage.deployments.count,
      max: usage.deployments.limit,
      color: "bg-orange-500",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Kullanım
          </h3>
          <p className="text-sm text-muted-foreground">Bu ayki kullanım istatistikleri</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
          {plan.name} Plan
        </span>
      </div>

      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{metric.icon}</span>
                <span className="font-medium">{metric.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {metric.used} / {metric.limit}
              </span>
            </div>
            <ProgressBar
              value={metric.value}
              max={metric.max}
              color={metric.color}
            />
          </div>
        ))}
      </div>

      {/* Upgrade CTA */}
      {plan.slug === "free" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
          <p className="text-sm font-medium">Daha fazla kaynağa mı ihtiyacınız var?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Starter plana yükselterek limitleri artırın.
          </p>
          <a
            href="/pricing"
            className="inline-block mt-3 text-xs font-medium text-primary hover:underline"
          >
            Planları İncele →
          </a>
        </div>
      )}
    </Card>
  );
}

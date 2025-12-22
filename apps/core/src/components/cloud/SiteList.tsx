"use client";

import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import {
  Globe,
  Plus,
  ExternalLink,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  MoreVertical,
  Trash2,
} from "lucide-react";

type SiteStatus = "ACTIVE" | "DEPLOYING" | "SUSPENDED" | "DELETED";

interface Site {
  id: string;
  name: string;
  slug: string;
  framework: string;
  status: SiteStatus;
  domains: { domain: string; isPrimary: boolean }[];
  lastDeployment?: {
    status: string;
    deployedAt?: Date;
  };
  createdAt: Date;
}

const statusConfig: Record<SiteStatus, { icon: React.ReactNode; label: string; color: string }> = {
  ACTIVE: { icon: <CheckCircle className="h-4 w-4" />, label: "Aktif", color: "text-green-600 bg-green-100" },
  DEPLOYING: { icon: <Loader2 className="h-4 w-4 animate-spin" />, label: "Yayınlanıyor", color: "text-blue-600 bg-blue-100" },
  SUSPENDED: { icon: <XCircle className="h-4 w-4" />, label: "Askıya Alındı", color: "text-red-600 bg-red-100" },
  DELETED: { icon: <XCircle className="h-4 w-4" />, label: "Silindi", color: "text-slate-600 bg-slate-100" },
};

const frameworkIcons: Record<string, string> = {
  nextjs: "⚡",
  react: "⚛️",
  vue: "💚",
  svelte: "🔥",
  static: "📄",
};

function SiteSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
    </Card>
  );
}

// Mock data - will be replaced with tRPC query when cloud router is implemented
const mockSites: Site[] = [
  {
    id: "1",
    name: "My Portfolio",
    slug: "my-portfolio",
    framework: "nextjs",
    status: "ACTIVE",
    domains: [{ domain: "my-portfolio.hyble.net", isPrimary: true }],
    lastDeployment: { status: "SUCCESS", deployedAt: new Date() },
    createdAt: new Date("2024-10-01"),
  },
  {
    id: "2",
    name: "Blog App",
    slug: "blog-app",
    framework: "react",
    status: "ACTIVE",
    domains: [{ domain: "blog-app.hyble.net", isPrimary: true }],
    lastDeployment: { status: "SUCCESS", deployedAt: new Date("2024-12-10") },
    createdAt: new Date("2024-11-15"),
  },
];

export function SiteList() {
  // TODO: Replace with tRPC query when cloud router is ready
  // const { data, isLoading, error } = trpc.cloud.sites.list.useQuery();
  const sites = mockSites;
  const isLoading = false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sitelerim</h2>
          <p className="text-sm text-muted-foreground">
            Toplam {sites.length} site
          </p>
        </div>
        <Link href="/dashboard/cloud/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Site
          </Button>
        </Link>
      </div>

      {/* Sites Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SiteSkeleton key={i} />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">Henüz siteniz yok</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            İlk sitenizi oluşturarak başlayın
          </p>
          <Link href="/dashboard/cloud/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Site Oluştur
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site: Site) => {
            const config = statusConfig[site.status];
            const primaryDomain = site.domains?.find(d => d.isPrimary)?.domain || `${site.slug}.hyble.net`;

            return (
              <Card key={site.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {frameworkIcons[site.framework.toLowerCase()] || "🌐"}
                    </span>
                    <div>
                      <Link
                        href={`/dashboard/cloud/${site.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {site.name}
                      </Link>
                      <p className="text-xs text-muted-foreground capitalize">
                        {site.framework}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <a
                    href={`https://${primaryDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {primaryDomain}
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {site.lastDeployment && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      Son deployment: {site.lastDeployment.deployedAt
                        ? new Date(site.lastDeployment.deployedAt).toLocaleDateString("tr-TR")
                        : "Beklemede"}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Link href={`/dashboard/cloud/${site.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-1" />
                      Yönet
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

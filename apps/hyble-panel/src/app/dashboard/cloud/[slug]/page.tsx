"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button } from "@hyble/ui";
import {
  ArrowLeft,
  Globe,
  Settings,
  Key,
  Activity,
  Rocket,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { DeploymentLogs } from "@/components/cloud/DeploymentLogs";
import { DomainManager } from "@/components/cloud/DomainManager";
import { EnvVarEditor } from "@/components/cloud/EnvVarEditor";
import { UsageMeter } from "@/components/cloud/UsageMeter";

type Tab = "overview" | "domains" | "env" | "usage" | "settings";

export default function SiteDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: site, isLoading } = trpc.cloud.sites.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6 text-center">
        <p>Site bulunamadı</p>
        <Link href="/dashboard/cloud" className="text-primary hover:underline">
          Sitelere dön
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: <Globe className="h-4 w-4" /> },
    { id: "domains", label: "Domainler", icon: <Globe className="h-4 w-4" /> },
    { id: "env", label: "Environment", icon: <Key className="h-4 w-4" /> },
    { id: "usage", label: "Kullanım", icon: <Activity className="h-4 w-4" /> },
    { id: "settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/cloud"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Sitelere Dön
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{site.name}</h1>
            <a
              href={`https://${site.slug}.hyble.net`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              {site.slug}.hyble.net
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button>
            <Rocket className="h-4 w-4 mr-2" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6 overflow-x-auto">
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Site Bilgileri</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Framework</dt>
                <dd className="font-medium capitalize">{site.framework}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Node Version</dt>
                <dd className="font-medium">{site.nodeVersion || "18"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Build Command</dt>
                <dd className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {site.buildCommand || "npm run build"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Output Directory</dt>
                <dd className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {site.outputDirectory || "dist"}
                </dd>
              </div>
            </dl>
          </Card>

          {site.deployments?.[0] && (
            <DeploymentLogs
              deploymentId={site.deployments[0].id}
              siteSlug={slug}
            />
          )}
        </div>
      )}

      {activeTab === "domains" && <DomainManager siteSlug={slug} />}
      {activeTab === "env" && <EnvVarEditor siteSlug={slug} />}
      {activeTab === "usage" && <UsageMeter siteSlug={slug} />}

      {activeTab === "settings" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Site Ayarları</h3>
          <p className="text-muted-foreground text-sm">
            Build ayarları, Node version ve diğer konfigürasyonlar
          </p>
          {/* Settings form would go here */}
        </Card>
      )}
    </div>
  );
}

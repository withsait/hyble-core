"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface DomainManagerProps {
  siteSlug: string;
}

type DomainStatus = "PENDING" | "VERIFIED" | "FAILED";

interface Domain {
  id: string;
  domain: string;
  type: "HYBLE_SUBDOMAIN" | "CUSTOM";
  status: DomainStatus;
  isPrimary: boolean;
  verificationToken?: string;
  sslEnabled: boolean;
}

const statusConfig: Record<DomainStatus, { icon: React.ReactNode; label: string; color: string }> = {
  PENDING: { icon: <Clock className="h-4 w-4" />, label: "Doğrulanıyor", color: "text-yellow-600 bg-yellow-100" },
  VERIFIED: { icon: <CheckCircle className="h-4 w-4" />, label: "Doğrulandı", color: "text-green-600 bg-green-100" },
  FAILED: { icon: <XCircle className="h-4 w-4" />, label: "Başarısız", color: "text-red-600 bg-red-100" },
};

// Mock data - will be replaced with tRPC query when cloud router is implemented
const mockDomains: Domain[] = [
  {
    id: "1",
    domain: "my-site.hyble.net",
    type: "HYBLE_SUBDOMAIN",
    status: "VERIFIED",
    isPrimary: true,
    sslEnabled: true,
  },
  {
    id: "2",
    domain: "example.com",
    type: "CUSTOM",
    status: "PENDING",
    isPrimary: false,
    verificationToken: "hyble-verify-abc123xyz789",
    sslEnabled: false,
  },
];

export function DomainManager({ siteSlug }: DomainManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState<Domain[]>(mockDomains);
  const [isAdding, setIsAdding] = useState(false);

  // TODO: Replace with tRPC query when cloud router is ready
  // const { data, isLoading, refetch } = trpc.cloud.domains.list.useQuery({ siteSlug });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAdd = async () => {
    setIsAdding(true);
    // Mock add - will be replaced with tRPC mutation
    await new Promise(resolve => setTimeout(resolve, 500));
    setDomains([...domains, {
      id: String(domains.length + 1),
      domain: newDomain,
      type: "CUSTOM",
      status: "PENDING",
      isPrimary: false,
      verificationToken: "hyble-verify-" + Math.random().toString(36).substring(7),
      sslEnabled: false,
    }]);
    setShowAddForm(false);
    setNewDomain("");
    setIsAdding(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold">Domain Yönetimi</h3>
          <p className="text-sm text-muted-foreground">
            Sitenize özel domain ekleyin
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Domain Ekle
        </Button>
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="space-y-2">
            <Label>Domain Adresi</Label>
            <Input
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Alt domain olmadan girin (örn: example.com)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newDomain || isAdding}
            >
              {isAdding && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Ekle
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
            >
              İptal
            </Button>
          </div>
        </div>
      )}

      {/* Domain List */}
      {domains.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Henüz domain eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => {
            const config = statusConfig[domain.status];
            const isHyble = domain.type === "HYBLE_SUBDOMAIN";

            return (
              <div
                key={domain.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{domain.domain}</span>
                      {domain.isPrimary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Ana Domain
                        </span>
                      )}
                      {isHyble && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          Hyble
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs ${config.color} px-2 py-0.5 rounded-full`}>
                        {config.icon}
                        {config.label}
                      </span>
                      {domain.sslEnabled && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Shield className="h-3 w-3" />
                          SSL
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {domain.status === "PENDING" && domain.verificationToken && (
                    <div className="text-xs text-muted-foreground mr-4">
                      <p>TXT Kaydı:</p>
                      <div className="flex items-center gap-1 font-mono bg-muted px-2 py-1 rounded">
                        <span>{domain.verificationToken.substring(0, 20)}...</span>
                        <button
                          onClick={() => copyToClipboard(domain.verificationToken!)}
                          className="hover:text-primary"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {domain.status === "PENDING" && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Doğrula
                    </Button>
                  )}

                  {!domain.isPrimary && domain.status === "VERIFIED" && (
                    <Button variant="ghost" size="sm">
                      Ana Yap
                    </Button>
                  )}

                  {!isHyble && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

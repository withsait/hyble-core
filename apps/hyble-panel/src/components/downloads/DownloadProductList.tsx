"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import {
  Download,
  Package,
  Clock,
  Shield,
  Tag,
  ExternalLink,
  Search,
  Filter,
  Loader2,
} from "lucide-react";

type LicenseType = "LIFETIME" | "SUBSCRIPTION" | "PROJECT";
type LicenseStatus = "ACTIVE" | "GRACE_PERIOD" | "EXPIRED" | "SUSPENDED";

interface DownloadProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  license: {
    type: LicenseType;
    status: LicenseStatus;
    expiresAt?: Date;
  };
  latestVersion?: {
    version: string;
    releasedAt: Date;
  };
  downloadCount: number;
}

const licenseTypeLabels: Record<LicenseType, string> = {
  LIFETIME: "Ömür Boyu",
  SUBSCRIPTION: "Abonelik",
  PROJECT: "Proje Bazlı",
};

const licenseStatusConfig: Record<LicenseStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700" },
  GRACE_PERIOD: { label: "Ek Süre", color: "bg-yellow-100 text-yellow-700" },
  EXPIRED: { label: "Süresi Dolmuş", color: "bg-red-100 text-red-700" },
  SUSPENDED: { label: "Askıya Alındı", color: "bg-slate-100 text-slate-600" },
};

// Mock data - will be replaced with tRPC query when downloads router is implemented
const mockProducts: DownloadProduct[] = [
  {
    id: "1",
    name: "Hyble Starter Theme",
    slug: "hyble-starter-theme",
    description: "Modern ve responsive bir başlangıç teması",
    license: {
      type: "LIFETIME",
      status: "ACTIVE",
    },
    latestVersion: { version: "1.2.0", releasedAt: new Date() },
    downloadCount: 45,
  },
];

function ProductSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="h-20 w-20 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    </Card>
  );
}

export function DownloadProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [licenseFilter, setLicenseFilter] = useState<LicenseStatus | "ALL">("ALL");

  // TODO: Replace with tRPC query when downloads router is ready
  // const { data, isLoading, error } = trpc.downloads.listProducts.useQuery();
  const isLoading = false;
  const error = null;

  const products = mockProducts;

  const filteredProducts = products.filter((product: DownloadProduct) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLicense = licenseFilter === "ALL" || product.license.status === licenseFilter;
    return matchesSearch && matchesLicense;
  });

  if (error) {
    return (
      <Card className="p-6 border-destructive bg-destructive/10">
        <p className="text-destructive text-sm">
          Ürünler yüklenemedi: {error.message}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          İndirilebilir Ürünlerim
        </h2>
        <p className="text-sm text-muted-foreground">
          Satın aldığınız dijital ürünleri buradan indirin
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value as LicenseStatus | "ALL")}
            className="px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Tüm Lisanslar</option>
            {Object.entries(licenseStatusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">Henüz ürün yok</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Satın aldığınız dijital ürünler burada görünecek
          </p>
          <Link href="/products">
            <Button>
              Ürünlere Göz At
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product: DownloadProduct) => {
            const statusConfig = licenseStatusConfig[product.license.status];
            const canDownload = product.license.status === "ACTIVE" || product.license.status === "GRACE_PERIOD";

            return (
              <Card key={product.id} className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/downloads/${product.slug}`}
                          className="font-semibold hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {licenseTypeLabels[product.license.type]}
                      </span>
                      {product.latestVersion && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          v{product.latestVersion.version}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {product.downloadCount} indirme
                      </span>
                      {product.license.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {new Date(product.license.expiresAt).toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {canDownload ? (
                      <Link href={`/downloads/${product.slug}`}>
                        <Button size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-1" />
                          İndir
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Shield className="h-4 w-4 mr-1" />
                        Lisans Gerekli
                      </Button>
                    )}
                    <Link href={`/downloads/${product.slug}`}>
                      <Button size="sm" variant="ghost" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Detay
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

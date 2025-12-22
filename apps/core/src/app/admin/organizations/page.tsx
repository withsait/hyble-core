// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Building2,
  Search,
  Users,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  Crown,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminOrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // tRPC queries
  const { data: stats, isLoading: statsLoading } = trpc.organization.adminStats.useQuery();

  const { data: orgsData, isLoading: orgsLoading, refetch } = trpc.organization.adminList.useQuery({
    page,
    limit: 20,
    search: searchTerm || undefined,
  });

  // tRPC mutations
  const deleteOrg = trpc.organization.adminDelete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" organizasyonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      deleteOrg.mutate({ id });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          Organizasyonlar
        </h1>
        <p className="text-muted-foreground mt-1">
          Tüm organizasyonları yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statsLoading ? (
          <>
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-3 bg-muted rounded w-16 mb-2" />
                  <div className="h-6 bg-muted rounded w-12" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Toplam</p>
              <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
            </Card>
            <Card className="p-4 border-blue-200">
              <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.newThisMonth || 0}</p>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Organizasyon adı veya slug ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {orgsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Yükleniyor...</p>
          </div>
        ) : orgsData?.organizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Organizasyon bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Organizasyon</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Sahip</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Üyeler</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Oluşturulma</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {orgsData?.organizations.map((org: any) => (
                    <tr key={org.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {org.logo ? (
                              <img src={org.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">/{org.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <div>
                            <p className="text-sm font-medium">{org.owner?.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{org.owner?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{org.memberCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(org.createdAt), "d MMM yyyy", { locale: tr })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/organizations/${org.id}`}>
                            <Button variant="ghost" size="icon" title="Detay">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Sil"
                            onClick={() => handleDelete(org.id, org.name)}
                            disabled={deleteOrg.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orgsData && orgsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Toplam {orgsData.total} organizasyon
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= orgsData.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

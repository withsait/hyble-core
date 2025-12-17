// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Building2,
  ArrowLeft,
  Users,
  Crown,
  Mail,
  Calendar,
  Globe,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  Loader2,
  UserMinus,
  Clock,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Tab = "overview" | "members" | "invites" | "settings";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  SUSPENDED: { label: "Askıya Alınmış", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Pause },
  DELETED: { label: "Silinmiş", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: XCircle },
};

const roleLabels: Record<string, { label: string; color: string }> = {
  OWNER: { label: "Sahip", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  ADMIN: { label: "Yönetici", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  MANAGER: { label: "Müdür", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  MEMBER: { label: "Üye", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  BILLING: { label: "Finans", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  VIEWER: { label: "İzleyici", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

export default function AdminOrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // tRPC queries
  const { data: org, isLoading, refetch } = trpc.organization.adminGet.useQuery({ id: orgId });

  // tRPC mutations
  const suspendOrg = trpc.organization.adminSuspend.useMutation({
    onSuccess: () => refetch(),
  });

  const activateOrg = trpc.organization.adminActivate.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteOrg = trpc.organization.adminDelete.useMutation({
    onSuccess: () => router.push("/admin/organizations"),
  });

  const handleSuspend = () => {
    const reason = window.prompt(`"${org?.name}" organizasyonunu askıya alma nedeninizi girin:`);
    if (reason !== null) {
      suspendOrg.mutate({ id: orgId, reason });
    }
  };

  const handleActivate = () => {
    if (window.confirm(`"${org?.name}" organizasyonunu aktifleştirmek istediğinize emin misiniz?`)) {
      activateOrg.mutate({ id: orgId });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`"${org?.name}" organizasyonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      deleteOrg.mutate({ id: orgId });
    }
  };

  const tabs = [
    { id: "overview" as Tab, label: "Genel Bakış", icon: Building2 },
    { id: "members" as Tab, label: `Üyeler (${org?.members?.length || 0})`, icon: Users },
    { id: "invites" as Tab, label: `Davetler (${org?.invites?.length || 0})`, icon: Mail },
    { id: "settings" as Tab, label: "Ayarlar", icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6 text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Organizasyon bulunamadı</p>
        <Link href="/admin/organizations">
          <Button className="mt-4">Geri Dön</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[org.status] || statusConfig.ACTIVE;
  const StatusIcon = status.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        href="/admin/organizations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Organizasyonlara Dön
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center">
            {org.logo ? (
              <img src={org.logo} alt="" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground font-mono">/{org.slug}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${status.color}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              {org.ssoConfig?.enabled && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Shield className="h-3 w-3" />
                  SSO Aktif
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {org.status === "ACTIVE" ? (
            <Button variant="outline" onClick={handleSuspend} disabled={suspendOrg.isPending}>
              <Pause className="h-4 w-4 mr-2 text-orange-500" />
              Askıya Al
            </Button>
          ) : (
            <Button variant="outline" onClick={handleActivate} disabled={activateOrg.isPending}>
              <Play className="h-4 w-4 mr-2 text-green-500" />
              Aktifleştir
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteOrg.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Organizasyon Bilgileri</h2>
              <div className="space-y-4">
                {org.description && (
                  <div>
                    <label className="text-xs text-muted-foreground">Açıklama</label>
                    <p className="text-sm">{org.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Oluşturulma</label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(org.createdAt), "d MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                  {org.website && (
                    <div>
                      <label className="text-xs text-muted-foreground">Website</label>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        {org.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {org.taxId && (
                    <div>
                      <label className="text-xs text-muted-foreground">Vergi No</label>
                      <p className="text-sm flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {org.taxId}
                      </p>
                    </div>
                  )}
                  {org.vatNumber && (
                    <div>
                      <label className="text-xs text-muted-foreground">KDV No</label>
                      <p className="text-sm flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {org.vatNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">İstatistikler</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{org._count?.members || 0}</p>
                  <p className="text-xs text-muted-foreground">Üye</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Mail className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{org._count?.invites || 0}</p>
                  <p className="text-xs text-muted-foreground">Bekleyen Davet</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{org.ssoConfig?.enabled ? "Aktif" : "Pasif"}</p>
                  <p className="text-xs text-muted-foreground">SSO</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Sahip
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                  {org.owner?.image ? (
                    <img src={org.owner.image} alt="" className="h-10 w-10 rounded-full" />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{org.owner?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">{org.owner?.email}</p>
                </div>
              </div>
              <Link href={`/admin/users/${org.owner?.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Kullanıcı Profilini Görüntüle
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <Card>
          {org.members?.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz üye yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Üye</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Rol</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Katılım</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {org.members?.map((member: any) => {
                    const role = roleLabels[member.role] || roleLabels.MEMBER;
                    return (
                      <tr key={member.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                              {member.user?.image ? (
                                <img src={member.user.image} alt="" className="h-8 w-8 rounded-full" />
                              ) : (
                                <Users className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.user?.name || "-"}</p>
                              <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${role.color}`}>
                            {member.role === "OWNER" && <Crown className="h-3 w-3" />}
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            member.user?.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {member.user?.status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(member.joinedAt), "d MMM yyyy", { locale: tr })}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/users/${member.user?.id}`}>
                            <Button variant="ghost" size="sm">
                              Profil
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Invites Tab */}
      {activeTab === "invites" && (
        <Card>
          {org.invites?.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Bekleyen davet yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">E-posta</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Rol</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Gönderilme</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Bitiş</th>
                  </tr>
                </thead>
                <tbody>
                  {org.invites?.map((invite: any) => {
                    const role = roleLabels[invite.role] || roleLabels.MEMBER;
                    const isExpired = new Date(invite.expiresAt) < new Date();
                    return (
                      <tr key={invite.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{invite.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${role.color}`}>
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(invite.createdAt), "d MMM yyyy", { locale: tr })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 w-fit ${
                            isExpired
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {format(new Date(invite.expiresAt), "d MMM yyyy", { locale: tr })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              SSO Yapılandırması
            </h2>
            {org.ssoConfig ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Durum</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    org.ssoConfig.enabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {org.ssoConfig.enabled ? "Aktif" : "Pasif"}
                  </span>
                </div>
                {org.ssoConfig.provider && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sağlayıcı</span>
                    <span className="text-sm font-mono">{org.ssoConfig.provider}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">SSO yapılandırılmamış</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold mb-4 text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Tehlikeli İşlemler
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Bu işlemler geri alınamaz. Dikkatli olun.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={deleteOrg.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Organizasyonu Sil
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Building2,
  Users,
  Settings,
  Mail,
  Loader2,
  Plus,
  Crown,
  Shield,
  User,
  Eye,
  CreditCard,
  MoreVertical,
  Trash2,
  UserMinus,
  Globe,
  Calendar,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Tab = "overview" | "members" | "invites" | "settings";
type MemberRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "BILLING" | "VIEWER";

const roleConfig: Record<MemberRole, { label: string; color: string; icon: typeof Crown }> = {
  OWNER: { label: "Sahip", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Crown },
  ADMIN: { label: "Yönetici", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Shield },
  MANAGER: { label: "Müdür", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: User },
  MEMBER: { label: "Üye", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: User },
  BILLING: { label: "Finans", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: CreditCard },
  VIEWER: { label: "İzleyici", color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400", icon: Eye },
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("MEMBER");
  const [copied, setCopied] = useState(false);

  // tRPC queries
  const { data: orgsData } = trpc.organization.list.useQuery();
  const org = orgsData?.find((o: any) => o.slug === slug);
  const orgId = org?.id;

  const { data: orgDetails, isLoading, refetch } = trpc.organization.get.useQuery(
    { orgId: orgId || "" },
    { enabled: !!orgId }
  );

  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = trpc.organization.getMembers.useQuery(
    { orgId: orgId || "" },
    { enabled: !!orgId }
  );

  const { data: invites, refetch: refetchInvites } = trpc.organization.getInvites.useQuery(
    { orgId: orgId || "" },
    { enabled: !!orgId }
  );

  // Mutations
  const inviteMember = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      refetchInvites();
    },
  });

  const removeMember = trpc.organization.removeMember.useMutation({
    onSuccess: () => refetchMembers(),
  });

  const cancelInvite = trpc.organization.cancelInvite.useMutation({
    onSuccess: () => refetchInvites(),
  });

  const leaveOrg = trpc.organization.leave.useMutation({
    onSuccess: () => router.push("/organizations"),
  });

  const tabs = [
    { id: "overview" as Tab, label: "Genel Bakış", icon: <Building2 className="h-4 w-4" /> },
    { id: "members" as Tab, label: "Üyeler", icon: <Users className="h-4 w-4" /> },
    { id: "invites" as Tab, label: "Davetler", icon: <Mail className="h-4 w-4" /> },
    { id: "settings" as Tab, label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
  ];

  const handleInvite = () => {
    if (!inviteEmail || !orgId) return;
    inviteMember.mutate({ orgId, email: inviteEmail, role: inviteRole });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!orgId) return;
    if (confirm(`${memberName} adlı üyeyi organizasyondan çıkarmak istediğinizden emin misiniz?`)) {
      removeMember.mutate({ orgId, memberId });
    }
  };

  const handleCancelInvite = (inviteId: string) => {
    if (!orgId) return;
    if (confirm("Daveti iptal etmek istediğinizden emin misiniz?")) {
      cancelInvite.mutate({ orgId, inviteId });
    }
  };

  const handleLeave = () => {
    if (!orgId) return;
    if (confirm("Organizasyondan ayrılmak istediğinizden emin misiniz?")) {
      leaveOrg.mutate({ orgId });
    }
  };

  const copySlug = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!org && !isLoading) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Organizasyon bulunamadı</h2>
        <p className="text-slate-500 mt-2">Bu organizasyona erişim yetkiniz yok veya mevcut değil.</p>
        <Link href="/organizations" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
          ← Organizasyonlara dön
        </Link>
      </div>
    );
  }

  if (isLoading || !orgDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const myRole = org?.role as MemberRole;
  const canManageMembers = ["OWNER", "ADMIN"].includes(myRole);
  const canEditSettings = ["OWNER", "ADMIN"].includes(myRole);
  const isOwner = myRole === "OWNER";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/organizations"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-1"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {orgDetails.logo ? (
              <img src={orgDetails.logo} alt={orgDetails.name} className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {orgDetails.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={copySlug}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  @{slug}
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
                <span className={`text-xs px-2 py-0.5 rounded ${roleConfig[myRole]?.color || "bg-slate-100"}`}>
                  {roleConfig[myRole]?.label || myRole}
                </span>
              </div>
            </div>
          </div>
        </div>
        {canManageMembers && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Üye Davet Et
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {orgDetails.description && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Açıklama</h3>
                <p className="text-slate-600 dark:text-slate-400">{orgDetails.description}</p>
              </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">Bilgiler</h3>
              <dl className="space-y-3">
                {orgDetails.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <dt className="text-sm text-slate-500">Website:</dt>
                    <dd>
                      <a href={orgDetails.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {orgDetails.website}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <dt className="text-sm text-slate-500">Oluşturulma:</dt>
                  <dd className="text-sm text-slate-900 dark:text-white">
                    {format(new Date(orgDetails.createdAt), "d MMMM yyyy", { locale: tr })}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <dt className="text-sm text-slate-500">Üye Sayısı:</dt>
                  <dd className="text-sm text-slate-900 dark:text-white">{orgDetails._count?.members || 0}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">İstatistikler</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Toplam Üye</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgDetails._count?.members || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Bekleyen Davet</p>
                  <p className="text-2xl font-bold text-yellow-600">{orgDetails._count?.invites || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {membersLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {members?.map((member: any) => {
                const role = roleConfig[member.role as MemberRole];
                const RoleIcon = role?.icon || User;
                return (
                  <div key={member.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {member.user.image ? (
                          <img src={member.user.image} alt="" className="h-10 w-10 rounded-full" />
                        ) : (
                          <User className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{member.user.name || "İsimsiz"}</p>
                        <p className="text-sm text-slate-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${role?.color || ""}`}>
                        <RoleIcon className="h-3 w-3" />
                        {role?.label || member.role}
                      </span>
                      {canManageMembers && member.role !== "OWNER" && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === "invites" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {!invites || invites.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Bekleyen davet yok</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {invites.map((invite: any) => {
                const role = roleConfig[invite.role as MemberRole];
                return (
                  <div key={invite.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{invite.email}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(invite.createdAt), "d MMM yyyy", { locale: tr })} tarihinde davet edildi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${role?.color || ""}`}>
                        {role?.label || invite.role}
                      </span>
                      {canManageMembers && (
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {!isOwner && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">Organizasyondan Ayrıl</h3>
              <p className="text-sm text-slate-500 mb-4">
                Bu organizasyondan ayrıldığınızda erişiminiz sona erecektir.
              </p>
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Organizasyondan Ayrıl
              </button>
            </div>
          )}

          {isOwner && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-200">Tehlikeli Bölge</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Organizasyonu silmek için lütfen destek ile iletişime geçin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Üye Davet Et</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="MANAGER">Müdür</option>
                  <option value="MEMBER">Üye</option>
                  <option value="BILLING">Finans</option>
                  <option value="VIEWER">İzleyici</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={handleInvite}
                disabled={inviteMember.isPending || !inviteEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {inviteMember.isPending ? "Gönderiliyor..." : "Davet Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

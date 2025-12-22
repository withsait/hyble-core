"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Settings,
  Mail,
  Loader2,
  Globe,
  Calendar,
  UserPlus,
  Trash2,
} from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Invite {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  createdAt: string;
  members: Member[];
  memberCount: number;
  pendingInvites: number;
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye,
};

const roleLabels = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "İzleyici",
};

const roleColors = {
  OWNER: "text-yellow-400 bg-yellow-400/10",
  ADMIN: "text-purple-400 bg-purple-400/10",
  MEMBER: "text-blue-400 bg-blue-400/10",
  VIEWER: "text-slate-400 bg-slate-400/10",
};

// Safe URL hostname parser
function getHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    // If URL is invalid, try to extract domain-like part
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    return match ? match[1] ?? url : url;
  }
}

// Safe date formatter
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Belirtilmemiş";
  try {
    return new Date(dateString).toLocaleDateString("tr-TR");
  } catch {
    return "Geçersiz tarih";
  }
}

export default function OrganizationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchOrganization();
    }
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/organizations/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Organization not found");
      }

      if (!data.organization) {
        throw new Error("Invalid response from server");
      }

      setOrganization(data.organization);

      // Fetch invites if admin or owner
      const userRole = data.organization.currentUserRole;
      if (userRole === "OWNER" || userRole === "ADMIN") {
        try {
          const invitesResponse = await fetch(`/api/organizations/${slug}/invites`);
          if (invitesResponse.ok) {
            const invitesData = await invitesResponse.json();
            setInvites(invitesData.invites || []);
          }
        } catch (inviteErr) {
          console.error("Failed to fetch invites:", inviteErr);
          // Don't show error for invites, just continue
        }
      }
    } catch (err) {
      console.error("Error fetching organization:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      const response = await fetch(`/api/organizations/${slug}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Davet gönderilemedi");
      }

      if (data.invite) {
        setInvites((prev) => [data.invite, ...prev]);
      }
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setInviting(false);
    }
  };

  const cancelInvite = async (email: string) => {
    try {
      const response = await fetch(`/api/organizations/${slug}/invites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setInvites((prev) => prev.filter((inv) => inv.email !== email));
      }
    } catch (err) {
      console.error("Failed to cancel invite:", err);
    }
  };

  const canManageMembers =
    organization?.currentUserRole === "OWNER" ||
    organization?.currentUserRole === "ADMIN";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Organizasyon bulunamadı
          </h2>
          <p className="text-slate-400 mb-6">{error || "Bilinmeyen bir hata oluştu"}</p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Organizasyonlara Dön
          </Link>
        </div>
      </div>
    );
  }

  const currentUserRole = organization.currentUserRole || "VIEWER";
  const members = organization.members || [];
  const hostname = getHostname(organization.website);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/organizations"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Organizasyonlara Dön
        </Link>

        {/* Organization Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-6">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="w-20 h-20 rounded-2xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {organization.name?.charAt(0)?.toUpperCase() || "O"}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white truncate">
                  {organization.name || "İsimsiz Organizasyon"}
                </h1>
                {roleIcons[currentUserRole] && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      roleColors[currentUserRole] || roleColors.VIEWER
                    }`}
                  >
                    {(() => {
                      const Icon = roleIcons[currentUserRole];
                      return Icon ? <Icon className="w-3 h-3" /> : null;
                    })()}
                    {roleLabels[currentUserRole] || "İzleyici"}
                  </span>
                )}
              </div>

              {organization.description && (
                <p className="text-slate-400 mb-3">{organization.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {members.length} üye
                </span>
                {hostname && (
                  <a
                    href={organization.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {hostname}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(organization.createdAt)}
                </span>
              </div>
            </div>

            {canManageMembers && (
              <Link
                href={`/organizations/${slug}/settings`}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "members"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-4 h-4" />
            Üyeler ({members.length})
          </button>
          {canManageMembers && (
            <button
              onClick={() => setActiveTab("invites")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "invites"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Mail className="w-4 h-4" />
              Davetler ({invites.length})
            </button>
          )}

          {canManageMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Davet Et
            </button>
          )}
        </div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {members.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Henüz üye bulunmuyor</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {members.map((member) => {
                  const memberRole = member.role || "MEMBER";
                  const RoleIcon = roleIcons[memberRole] || User;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
                    >
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name || ""}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">
                            {member.name || "İsimsiz"}
                          </span>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              roleColors[memberRole] || roleColors.MEMBER
                            }`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleLabels[memberRole] || "Üye"}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm truncate">
                          {member.email}
                        </p>
                      </div>

                      <span className="text-slate-500 text-sm">
                        {formatDate(member.joinedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Invites Tab */}
        {activeTab === "invites" && canManageMembers && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {invites.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Bekleyen davet yok</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {invites.map((invite) => {
                  const inviteRole = invite.role || "MEMBER";
                  const RoleIcon = roleIcons[inviteRole] || User;
                  const isExpired = invite.expiresAt ? new Date(invite.expiresAt) < new Date() : false;

                  return (
                    <div
                      key={invite.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">
                            {invite.email}
                          </span>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              roleColors[inviteRole] || roleColors.MEMBER
                            }`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleLabels[inviteRole] || "Üye"}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm">
                          {isExpired
                            ? "Süresi doldu"
                            : `${formatDate(invite.expiresAt)} tarihine kadar geçerli`}
                        </p>
                      </div>

                      <button
                        onClick={() => cancelInvite(invite.email)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Daveti iptal et"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Üye Davet Et
            </h3>

            <form onSubmit={handleInvite} className="space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "ADMIN" | "MEMBER" | "VIEWER")
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="MEMBER">Üye</option>
                  <option value="VIEWER">İzleyici</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
                >
                  {inviting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Davet Gönder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

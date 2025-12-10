"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  X,
  Loader2,
  Crown,
  Shield,
  User,
  Eye,
  Trash2,
  Mail,
  Search,
} from "lucide-react";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    status: string;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface MemberManagementProps {
  slug: string;
  members: Member[];
  invites: Invite[];
}

const roleLabels: Record<string, string> = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "Görüntüleyici",
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye,
};

const roleColors: Record<string, string> = {
  OWNER: "text-blue-400",
  ADMIN: "text-purple-400",
  MEMBER: "text-slate-400",
  VIEWER: "text-slate-500",
};

export function MemberManagement({ slug, members, invites }: MemberManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ type: string; id: string; name?: string } | null>(null);

  // Add member state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{id: string; name: string | null; email: string}>>([]);
  const [selectedUser, setSelectedUser] = useState<{id: string; name: string | null; email: string} | null>(null);
  const [selectedRole, setSelectedRole] = useState("MEMBER");

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  // Role change state
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out existing members
        const memberIds = members.map(m => m.user.id);
        setSearchResults(data.filter((u: {id: string}) => !memberIds.includes(u.id)));
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role: selectedRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add member");
      }

      setShowAddMember(false);
      setSelectedUser(null);
      setSearchQuery("");
      setSelectedRole("MEMBER");
      router.refresh();
    } catch (error) {
      console.error("Add member error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}/members?memberId=${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove member");

      setShowConfirm(null);
      router.refresh();
    } catch (error) {
      console.error("Remove member error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (memberId: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });

      if (!response.ok) throw new Error("Failed to change role");

      setEditingMember(null);
      router.refresh();
    } catch (error) {
      console.error("Change role error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invite");
      }

      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      router.refresh();
    } catch (error) {
      console.error("Send invite error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}/invites?inviteId=${inviteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel invite");

      setShowConfirm(null);
      router.refresh();
    } catch (error) {
      console.error("Cancel invite error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Üye Ekle
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl font-medium transition-colors"
        >
          <Mail className="w-4 h-4" />
          Davet Gönder
        </button>
      </div>

      {/* Members List with Role Management */}
      <div className="space-y-3">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role] || User;
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.user.name?.charAt(0) || member.user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">
                    {member.user.name || "İsimsiz"}
                  </p>
                  <p className="text-slate-500 text-sm">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingMember === member.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={newRole || member.role}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="OWNER">Sahip</option>
                      <option value="ADMIN">Yönetici</option>
                      <option value="MEMBER">Üye</option>
                      <option value="VIEWER">Görüntüleyici</option>
                    </select>
                    <button
                      onClick={() => handleChangeRole(member.id, newRole || member.role)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingMember(null);
                        setNewRole("");
                      }}
                      className="px-3 py-1.5 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingMember(member.id);
                        setNewRole(member.role);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors`}
                    >
                      <RoleIcon className={`w-4 h-4 ${roleColors[member.role]}`} />
                      <span className={`text-sm ${roleColors[member.role]}`}>
                        {roleLabels[member.role] || member.role}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowConfirm({ type: "member", id: member.id, name: member.user.name || member.user.email })}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Invites with Cancel */}
      {invites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Bekleyen Davetler</h3>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{invite.email}</p>
                    <p className="text-slate-500 text-xs">{roleLabels[invite.role]}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirm({ type: "invite", id: invite.id, name: invite.email })}
                  className="px-3 py-1.5 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Üye Ekle</h3>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kullanıcı Ara
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    placeholder="İsim veya e-posta ile ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedUser && (
                  <div className="mt-2 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery(user.name || user.email);
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors"
                      >
                        <p className="text-white text-sm">{user.name || "İsimsiz"}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected User */}
                {selectedUser && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">{selectedUser.name || "İsimsiz"}</p>
                      <p className="text-blue-400/70 text-xs">{selectedUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery("");
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="OWNER">Sahip</option>
                  <option value="ADMIN">Yönetici</option>
                  <option value="MEMBER">Üye</option>
                  <option value="VIEWER">Görüntüleyici</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Davet Gönder</h3>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setInviteEmail("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="OWNER">Sahip</option>
                  <option value="ADMIN">Yönetici</option>
                  <option value="MEMBER">Üye</option>
                  <option value="VIEWER">Görüntüleyici</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInvite(false);
                  setInviteEmail("");
                }}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail || isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {showConfirm.type === "member" ? "Üyeyi Kaldır" : "Daveti İptal Et"}
              </h3>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 mb-6">
              {showConfirm.type === "member"
                ? `"${showConfirm.name}" kullanıcısını organizasyondan kaldırmak istediğinize emin misiniz?`
                : `"${showConfirm.name}" adresine gönderilen daveti iptal etmek istediğinize emin misiniz?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  if (showConfirm.type === "member") {
                    handleRemoveMember(showConfirm.id);
                  } else {
                    handleCancelInvite(showConfirm.id);
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "İşleniyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserX,
  UserCheck,
  Shield,
  Eye,
  Edit,
  Ban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  UserPlus,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin" | "super_admin";
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "FROZEN" | "DELETED";
  trustLevel: "GUEST" | "VERIFIED" | "SECURE" | "CORPORATE";
  emailVerified: Date | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  createdAt: Date;
  lastActiveAt: Date | null;
  profile: { avatar: string | null } | null;
  _count: { memberships: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SUSPENDED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  BANNED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  FROZEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETED: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

const trustLevelColors = {
  GUEST: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  VERIFIED: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  SECURE: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  CORPORATE: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

const roleLabels = {
  user: "Kullanıcı",
  admin: "Admin",
  super_admin: "Süper Admin",
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [trustFilter, setTrustFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, statusFilter, trustFilter, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (trustFilter) params.set("trustLevel", trustFilter);
      if (roleFilter) params.set("role", roleFilter);

      const response = await fetch(`/api/trpc/admin.listUsers?input=${encodeURIComponent(JSON.stringify({ json: Object.fromEntries(params) }))}`);
      const data = await response.json();

      if (data.result?.data) {
        setUsers(data.result.data.users);
        setPagination(prev => ({ ...prev, ...data.result.data.pagination }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, type: "TEMPORARY" | "PERMANENT" | "SHADOW") => {
    const reason = prompt("Ban sebebini girin:");
    if (!reason) return;

    try {
      await fetch("/api/trpc/admin.banUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { userId, type, reason, revokeAllSessions: true },
        }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to ban user:", error);
    }
    setActionMenuOpen(null);
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await fetch("/api/trpc/admin.unbanUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { userId } }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to unban user:", error);
    }
    setActionMenuOpen(null);
  };

  const handleUpdateStatus = async (userId: string, status: User["status"]) => {
    try {
      await fetch("/api/trpc/admin.updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { userId, status } }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
    setActionMenuOpen(null);
  };

  const handleImpersonate = async (userId: string) => {
    const reason = prompt("Impersonation sebebini girin:");
    if (!reason) return;

    try {
      const response = await fetch("/api/trpc/admin.impersonateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { userId, reason } }),
      });
      const data = await response.json();
      if (data.result?.data?.impersonationToken) {
        localStorage.setItem("impersonationToken", data.result.data.impersonationToken);
        localStorage.setItem("originalAdmin", "true");
        window.location.href = "/console/dashboard";
      }
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
    setActionMenuOpen(null);
  };

  const exportUsers = async () => {
    try {
      const params = new URLSearchParams({
        format: "csv",
        all: "true",
      });
      window.open(`/api/admin/users/export?${params}`, "_blank");
    } catch (error) {
      console.error("Failed to export users:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Kullanıcı Yönetimi
              </h3>
              <p className="text-sm text-slate-500">
                {pagination.total} kullanıcı
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportUsers}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                  : "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtreler
            </button>
            <button
              onClick={fetchUsers}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Email, isim veya ID ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUSPENDED">Askıda</option>
                <option value="BANNED">Yasaklı</option>
                <option value="FROZEN">Dondurulmuş</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Güven Seviyesi</label>
              <select
                value={trustFilter}
                onChange={(e) => setTrustFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="GUEST">Misafir</option>
                <option value="VERIFIED">Doğrulanmış</option>
                <option value="SECURE">Güvenli</option>
                <option value="CORPORATE">Kurumsal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Süper Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sıralama</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="createdAt-desc">En Yeni</option>
                <option value="createdAt-asc">En Eski</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="lastActiveAt-desc">Son Aktif</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-[#0d0d14]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Güven
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Kayıt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#0d0d14]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {user.profile?.avatar ? (
                          <img src={user.profile.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.name || "İsimsiz"}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm ${
                      user.role === "super_admin"
                        ? "text-red-600"
                        : user.role === "admin"
                        ? "text-purple-600"
                        : "text-slate-600"
                    }`}>
                      {user.role === "super_admin" && <Shield className="w-3 h-3" />}
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${trustLevelColors[user.trustLevel]}`}>
                      {user.trustLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === user.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => window.open(`/admin/users/${user.id}`, "_self")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                            Detayları Gör
                          </button>
                          <button
                            onClick={() => window.open(`/admin/users/${user.id}/edit`, "_self")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                            Düzenle
                          </button>
                          {user.role !== "super_admin" && user.role !== "admin" && (
                            <>
                              <button
                                onClick={() => handleImpersonate(user.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <UserCheck className="w-4 h-4" />
                                Impersonate
                              </button>
                              <hr className="my-1 border-slate-200 dark:border-slate-700" />
                              {user.status === "ACTIVE" ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(user.id, "SUSPENDED")}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                  >
                                    <UserX className="w-4 h-4" />
                                    Askıya Al
                                  </button>
                                  <button
                                    onClick={() => handleBanUser(user.id, "PERMANENT")}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Yasakla
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Yasağı Kaldır
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {pagination.total} kullanıcıdan {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Sayfa {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

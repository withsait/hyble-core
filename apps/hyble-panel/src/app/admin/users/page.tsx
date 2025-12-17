"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Ban,
  Mail,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserX,
  Building2,
  MoreVertical,
} from "lucide-react";

type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "FROZEN" | "DELETED";
type UserRole = "user" | "admin" | "super_admin";
type TrustLevel = "GUEST" | "VERIFIED" | "SECURE" | "CORPORATE";

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  SUSPENDED: { label: "Askıda", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  BANNED: { label: "Yasaklı", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  FROZEN: { label: "Dondurulmuş", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  DELETED: { label: "Silinmiş", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  user: { label: "Kullanıcı", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  super_admin: { label: "Süper Admin", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const trustConfig: Record<TrustLevel, { label: string; color: string }> = {
  GUEST: { label: "Misafir", color: "bg-slate-100 text-slate-600" },
  VERIFIED: { label: "Doğrulanmış", color: "bg-green-100 text-green-700" },
  SECURE: { label: "Güvenli", color: "bg-blue-100 text-blue-700" },
  CORPORATE: { label: "Kurumsal", color: "bg-purple-100 text-purple-700" },
};

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  trustLevel: string;
  emailVerified: Date | null;
  phoneVerified: boolean;
  createdAt: Date;
  profile?: {
    avatar?: string | null;
  };
  _count?: {
    memberships?: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">(
    (searchParams.get("status") as UserStatus) || "ALL"
  );
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  // tRPC query
  const { data, isLoading, refetch } = trpc.admin.listUsers.useQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: dashboardStats } = trpc.admin.getDashboardStats.useQuery();

  const users = (data?.users ?? []) as UserItem[];
  const pagination = data?.pagination;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform kullanıcılarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Kullanıcı Ekle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam</p>
          <p className="text-2xl font-bold mt-1">{dashboardStats?.users.total ?? 0}</p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {dashboardStats?.users.active ?? 0}
          </p>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground">Doğrulanmış</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {dashboardStats?.users.verified ?? 0}
          </p>
        </Card>
        <Card className="p-4 border-amber-200 dark:border-amber-800">
          <p className="text-sm text-muted-foreground">2FA Aktif</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {dashboardStats?.users.secure ?? 0}
          </p>
        </Card>
        <Card className="p-4 border-red-200 dark:border-red-800">
          <p className="text-sm text-muted-foreground">Yasaklı</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {dashboardStats?.users.banned ?? 0}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim, email veya ID ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | "ALL");
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "ALL");
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Roller</option>
              {Object.entries(roleConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-semibold">Kullanıcı</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Rol</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Güven</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Güvenlik</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Org</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Kayıt</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">Kullanıcı bulunamadı</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {user.profile?.avatar ? (
                            <img src={user.profile.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-medium text-primary">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "İsimsiz"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${roleConfig[user.role as UserRole]?.color || "bg-slate-100"}`}>
                        {roleConfig[user.role as UserRole]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${statusConfig[user.status as UserStatus]?.color || "bg-slate-100"}`}>
                        {statusConfig[user.status as UserStatus]?.label || user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${trustConfig[user.trustLevel as TrustLevel]?.color || "bg-slate-100"}`}>
                        {trustConfig[user.trustLevel as TrustLevel]?.label || user.trustLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs" title="Email doğrulama">
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-xs" title="Telefon doğrulama">
                          {user.phoneVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-300" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {user._count?.memberships ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                        {user.status !== "BANNED" && user.role === "user" && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Ban className="h-4 w-4" />
                          </Button>
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
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Toplam {pagination.total} kullanıcı, sayfa {pagination.page}/{pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

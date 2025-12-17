"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Ban,
  Mail,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "BANNED";
type UserRole = "USER" | "ADMIN" | "SUPPORT";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700" },
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700" },
  SUSPENDED: { label: "Askıda", color: "bg-orange-100 text-orange-700" },
  BANNED: { label: "Yasaklı", color: "bg-red-100 text-red-700" },
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  USER: { label: "Kullanıcı", color: "bg-slate-100 text-slate-700" },
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700" },
  SUPPORT: { label: "Destek", color: "bg-blue-100 text-blue-700" },
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Mock users
  const users: User[] = [
    {
      id: "1",
      name: "Sait Karakurt",
      email: "sait@hyble.co",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date("2024-01-01"),
      lastLoginAt: new Date(),
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      role: "USER",
      status: "ACTIVE",
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date("2024-06-15"),
      lastLoginAt: new Date("2024-12-15"),
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "USER",
      status: "PENDING",
      emailVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date("2024-12-10"),
    },
    {
      id: "4",
      name: "Bob Wilson",
      email: "bob@spam.com",
      role: "USER",
      status: "BANNED",
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date("2024-11-01"),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

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
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Kullanıcı Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
          <p className="text-2xl font-bold mt-1">{users.length}</p>
        </Card>
        <Card className="p-4 border-green-200">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {users.filter((u) => u.status === "ACTIVE").length}
          </p>
        </Card>
        <Card className="p-4 border-yellow-200">
          <p className="text-sm text-muted-foreground">Doğrulama Bekliyor</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {users.filter((u) => u.status === "PENDING").length}
          </p>
        </Card>
        <Card className="p-4 border-purple-200">
          <p className="text-sm text-muted-foreground">Admin</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">
            {users.filter((u) => u.role === "ADMIN").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim veya email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | "ALL")}
              className="px-3 py-2 border rounded-lg bg-background text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
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
                <th className="text-left px-4 py-3 text-sm font-semibold">Güvenlik</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Son Giriş</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${roleConfig[user.role].color}`}>
                      {roleConfig[user.role].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${statusConfig[user.status].color}`}>
                      {statusConfig[user.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs">
                        {user.emailVerified ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        Email
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        {user.twoFactorEnabled ? (
                          <Shield className="h-3 w-3 text-green-600" />
                        ) : (
                          <Shield className="h-3 w-3 text-slate-300" />
                        )}
                        2FA
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastLoginAt ? (
                      user.lastLoginAt.toLocaleDateString("tr-TR")
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hiç
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {user.status !== "BANNED" && (
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

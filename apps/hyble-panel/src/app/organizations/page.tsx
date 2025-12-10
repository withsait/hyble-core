"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Plus,
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Loader2,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  memberCount: number;
  joinedAt: string;
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

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard&apos;a Dön
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Organizasyonlar</h1>
              <p className="text-slate-400">
                Üye olduğunuz organizasyonları yönetin
              </p>
            </div>
          </div>

          <Link
            href="/organizations/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yeni Organizasyon
          </Link>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Henüz bir organizasyonunuz yok
            </h3>
            <p className="text-slate-400 mb-6">
              Yeni bir organizasyon oluşturun veya bir davete katılın.
            </p>
            <Link
              href="/organizations/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Organizasyon Oluştur
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => {
              const RoleIcon = roleIcons[org.role];
              return (
                <Link
                  key={org.id}
                  href={`/organizations/${org.slug}`}
                  className="block bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {org.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {org.name}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[org.role]}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {roleLabels[org.role]}
                        </span>
                      </div>
                      {org.description && (
                        <p className="text-slate-400 text-sm truncate mb-2">
                          {org.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {org.memberCount} üye
                        </span>
                        <span>/{org.slug}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

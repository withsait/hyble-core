// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Plus, Building2, Users, Loader2, Crown } from "lucide-react";

const roleLabels: Record<string, { label: string; color: string }> = {
  OWNER: { label: "Sahip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  MANAGER: { label: "Yönetici", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  MEMBER: { label: "Üye", color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  BILLING: { label: "Faturalama", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  VIEWER: { label: "İzleyici", color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" },
};

export default function OrganizationsPage() {
  const { data: organizations, isLoading } = trpc.organization.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Organizasyonlar
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Üye olduğunuz organizasyonları yönetin.
          </p>
        </div>
        <Link
          href="/organizations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Yeni Organizasyon
        </Link>
      </div>

      {/* Stats */}
      {organizations && organizations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Organizasyon</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {organizations.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Sahip Olduğunuz</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {organizations.filter((o: any) => o.isOwner).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Üye</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {organizations.reduce((sum: number, o: any) => sum + (o.memberCount || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-slate-500 mt-2">Yükleniyor...</p>
        </div>
      ) : !organizations || organizations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Henüz organizasyon yok
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            İlk organizasyonunuzu oluşturarak başlayın.
          </p>
          <Link
            href="/organizations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Organizasyon Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org: any) => {
            const roleConfig = roleLabels[org.role] || roleLabels.MEMBER;
            return (
              <Link
                key={org.id}
                href={`/organizations/${org.slug}`}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {org.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${roleConfig.color}`}>
                        {org.isOwner && <Crown className="h-3 w-3 mr-1" />}
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{org.memberCount} üye</span>
                  </div>
                  {org.joinedAt && (
                    <span className="text-xs text-slate-500">
                      {new Date(org.joinedAt).toLocaleDateString("tr-TR")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

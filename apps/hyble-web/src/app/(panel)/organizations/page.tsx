"use client";

import Link from "next/link";
import { Plus, Building2, Users } from "lucide-react";

export default function OrganizationsPage() {
  // TODO: Fetch from tRPC
  const organizations: Array<{
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    role: string;
  }> = [];

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

      {organizations.length === 0 ? (
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
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/organizations/${org.slug}`}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {org.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {org.role}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="h-4 w-4" />
                <span>{org.memberCount} üye</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { ChevronDown, Plus, Building2 } from "lucide-react";

interface OrgSwitcherProps {
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
}

export function OrgSwitcher({ currentOrgId, onOrgChange }: OrgSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: orgs, isLoading } = trpc.organization.list.useQuery();

  const currentOrg = orgs?.find((o) => o.id === currentOrgId) || orgs?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <Link
        href="/org/create"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Organizasyon Oluştur</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
          {currentOrg?.name.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate">{currentOrg?.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
            <div className="p-1">
              <p className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                Organizasyonlar
              </p>
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onOrgChange?.(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    org.id === currentOrg?.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      org.id === currentOrg?.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">{org.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {org.memberCount} üye • {org.role}
                    </p>
                  </div>
                  {org.isOwner && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                      Sahip
                    </span>
                  )}
                </button>
              ))}

              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

              <Link
                href="/org/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Organizasyon
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

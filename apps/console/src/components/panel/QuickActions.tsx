"use client";

import { Plus, CreditCard, LifeBuoy } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    { name: "Yeni Web Sitesi", href: "/websites/new", icon: Plus, color: "bg-blue-600" },
    { name: "Para Yükle", href: "/wallet/deposit", icon: CreditCard, color: "bg-emerald-600" },
    { name: "Destek Talebi", href: "/support/new", icon: LifeBuoy, color: "bg-purple-600" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="relative flex items-center space-x-3 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
        >
          <div
            className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${action.color} text-white`}
          >
            <action.icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {action.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`font-medium ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                  ? "text-red-600"
                  : "text-slate-600"
            }`}
          >
            {change}
          </span>
          <span className="ml-2 text-slate-500 dark:text-slate-400">
            geçen aya göre
          </span>
        </div>
      )}
    </div>
  );
}

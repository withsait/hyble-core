"use client";

import { FolderKanban, Wallet, CreditCard, HeadphonesIcon } from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { QuickActions } from "@/components/panel/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Hoş Geldiniz
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Hesabınızın genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aktif Projeler"
          value="3"
          change="+1"
          changeType="positive"
          icon={FolderKanban}
        />
        <StatCard
          title="Cüzdan Bakiyesi"
          value="€124.50"
          change="+€50.00"
          changeType="positive"
          icon={Wallet}
        />
        <StatCard
          title="Bu Ay Harcama"
          value="€45.00"
          change="-12%"
          changeType="positive"
          icon={CreditCard}
        />
        <StatCard
          title="Açık Destek Talepleri"
          value="0"
          changeType="neutral"
          icon={HeadphonesIcon}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Hızlı İşlemler
        </h2>
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Son Aktiviteler
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Henüz aktivite bulunmuyor.
          </div>
        </div>
      </div>
    </div>
  );
}

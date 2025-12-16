"use client";

import { TRPCProvider } from "@/lib/trpc";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelHeader } from "@/components/panel/PanelHeader";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <PanelSidebar />
        <div className="lg:pl-64">
          <PanelHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </TRPCProvider>
  );
}

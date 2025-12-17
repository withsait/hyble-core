"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";

export default function NotificationSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Ayarlara Dön
        </Link>
        <h1 className="text-2xl font-bold">Bildirim Ayarları</h1>
        <p className="text-muted-foreground mt-1">
          Hangi bildirimleri almak istediğinizi seçin
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}

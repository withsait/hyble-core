"use client";

import React from "react";
import { api } from "@/lib/trpc";
import { Monitor, Smartphone, Tablet, Globe, Trash2, LogOut } from "lucide-react";

export function SessionList() {
  const { data: sessions, isLoading, refetch } = api.security.getSessions.useQuery();

  const revokeSessionMutation = api.security.revokeSession.useMutation({
    onSuccess: () => refetch(),
  });

  const revokeAllMutation = api.security.revokeAllSessions.useMutation({
    onSuccess: () => refetch(),
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "DESKTOP":
        return <Monitor className="w-5 h-5" />;
      case "MOBILE":
        return <Smartphone className="w-5 h-5" />;
      case "TABLET":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Aktif Oturumlar
        </h3>
        {sessions && sessions.length > 1 && (
          <button
            onClick={() => revokeAllMutation.mutate({})}
            disabled={revokeAllMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Tüm Oturumları Sonlandır
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
        {sessions?.map((session) => (
          <div key={session.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                {getDeviceIcon(session.deviceType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {session.browser || "Bilinmeyen Tarayıcı"} - {session.os || "Bilinmeyen OS"}
                  </p>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Bu Cihaz
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{session.ipAddress || "IP gizli"}</span>
                  <span>•</span>
                  <span>{session.location || "Konum bilinmiyor"}</span>
                  <span>•</span>
                  <span>Son aktivite: {formatDate(session.lastActiveAt)}</span>
                </div>
              </div>
            </div>

            {!session.isCurrent && (
              <button
                onClick={() => revokeSessionMutation.mutate({ sessionId: session.id })}
                disabled={revokeSessionMutation.isPending}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Oturumu sonlandır"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {(!sessions || sessions.length === 0) && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Aktif oturum bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}

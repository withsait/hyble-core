"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Monitor, Smartphone, Tablet, Globe, MapPin, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  deviceName: string | null;
  deviceType: string;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  location: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  expiresAt: Date;
}

interface SessionsListProps {
  sessions: Session[];
  userId: string;
}

export function SessionsList({ sessions, userId }: SessionsListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "MOBILE":
        return <Smartphone className="w-5 h-5 text-slate-400" />;
      case "TABLET":
        return <Tablet className="w-5 h-5 text-slate-400" />;
      case "DESKTOP":
      default:
        return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleTerminate = async (sessionId: string) => {
    setIsLoading(sessionId);
    try {
      const response = await fetch(`/api/users/${userId}/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to terminate session:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Aktif oturum bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
              {getDeviceIcon(session.deviceType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">
                  {session.browser || "Bilinmeyen Tarayıcı"}
                  {session.browserVersion && ` ${session.browserVersion}`}
                </p>
                <span className="text-slate-500">•</span>
                <p className="text-slate-400 text-sm">
                  {session.os || "Bilinmeyen İşletim Sistemi"}
                  {session.osVersion && ` ${session.osVersion}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                {session.ipAddress && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {session.ipAddress}
                  </span>
                )}
                {session.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {session.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-slate-400 text-sm">
                Son aktif: {format(session.lastActiveAt, "dd MMM HH:mm", { locale: tr })}
              </p>
              <p className="text-slate-500 text-xs">
                Oluşturulma: {format(session.createdAt, "dd MMM yyyy", { locale: tr })}
              </p>
            </div>
            <button
              onClick={() => handleTerminate(session.id)}
              disabled={isLoading === session.id}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Oturumu Sonlandır"
            >
              {isLoading === session.id ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

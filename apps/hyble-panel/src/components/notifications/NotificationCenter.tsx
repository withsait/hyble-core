"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@hyble/ui";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Loader2,
  FileText,
  CreditCard,
  Server,
  Shield,
  MessageSquare,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  data?: Record<string, any>;
  readAt?: Date;
  createdAt: Date;
}

// Mock notifications - will be replaced with tRPC when notifications router is ready
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Fatura oluşturuldu",
    body: "INV-2024-001 numaralı faturanız hazır",
    channel: "IN_APP",
    status: "SENT",
    data: { type: "invoice" },
    createdAt: new Date("2024-12-16"),
  },
  {
    id: "2",
    title: "Ödeme alındı",
    body: "€25.00 tutarındaki ödemeniz başarıyla alındı",
    channel: "IN_APP",
    status: "SENT",
    data: { type: "billing" },
    readAt: new Date("2024-12-15"),
    createdAt: new Date("2024-12-15"),
  },
];

const notificationIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-4 w-4" />,
  billing: <CreditCard className="h-4 w-4" />,
  server: <Server className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  ticket: <MessageSquare className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />,
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with tRPC query when notifications router is ready
  const isLoading = false;
  const notifications = localNotifications;
  const unreadCount = localNotifications.filter(n => !n.readAt).length;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (notification: Notification) => {
    const type = notification.data?.type || "default";
    return notificationIcons[type] || notificationIcons.default;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Bildirimler</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setIsMarkingAllRead(true);
                    await new Promise(r => setTimeout(r, 300));
                    setLocalNotifications(prev => prev.map(n => ({ ...n, readAt: new Date() })));
                    setIsMarkingAllRead(false);
                  }}
                  disabled={isMarkingAllRead}
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-1" />
                  )}
                  Tümünü Okundu Yap
                </Button>
              )}
              <Link href="/settings/notifications">
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.readAt ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (!notification.readAt) {
                        setLocalNotifications(prev => prev.map(n =>
                          n.id === notification.id ? { ...n, readAt: new Date() } : n
                        ));
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.readAt ? "bg-muted" : "bg-primary/10 text-primary"
                      }`}>
                        {getIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.readAt ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notification.createdAt), "d MMM, HH:mm", { locale: tr })}
                        </p>
                      </div>
                      {!notification.readAt && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30">
            <Link
              href="/notifications"
              className="block text-center text-sm text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Tüm bildirimleri gör
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

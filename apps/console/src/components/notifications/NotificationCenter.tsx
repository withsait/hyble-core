// @ts-nocheck - Router type inference not available in console package
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  CreditCard,
  Shield,
  MessageSquare,
  Settings,
  Package,
  Megaphone,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { trpc } from "@/lib/trpc";

// Icon mapping based on notification type
const typeIcons: Record<string, React.ReactNode> = {
  SYSTEM: <Bell className="h-4 w-4" />,
  SECURITY: <Shield className="h-4 w-4" />,
  BILLING: <CreditCard className="h-4 w-4" />,
  ORDER: <Package className="h-4 w-4" />,
  SUBSCRIPTION: <CreditCard className="h-4 w-4" />,
  SUPPORT: <MessageSquare className="h-4 w-4" />,
  MARKETING: <Megaphone className="h-4 w-4" />,
  ANNOUNCEMENT: <Megaphone className="h-4 w-4" />,
};

// Priority colors
const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  NORMAL: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  URGENT: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const { data: notificationsData, isLoading, refetch } = trpc.notification.list.useQuery(
    { limit: 20 },
    { enabled: isOpen }
  );
  const { data: unreadData, refetch: refetchUnread } = trpc.notification.unreadCount.useQuery();

  // tRPC mutations
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchUnread();
    },
  });
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchUnread();
    },
  });

  const notifications = notificationsData?.notifications ?? [];
  const unreadCount = unreadData?.count ?? 0;

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

  const getIcon = (notification: typeof notifications[0]) => {
    return typeIcons[notification.type] || typeIcons.SYSTEM;
  };

  const getIconColor = (notification: typeof notifications[0]) => {
    if (notification.isRead) {
      return "bg-slate-100 dark:bg-slate-800";
    }
    return priorityColors[notification.priority] || priorityColors.NORMAL;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Bildirimler</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {markAllAsReadMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  Tümünü Okundu Yap
                </button>
              )}
              <Link
                href="/settings/notifications"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-[#0d0d14]/50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsReadMutation.mutate({ id: notification.id });
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getIconColor(notification)}`}>
                        {getIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm text-slate-900 dark:text-white ${!notification.isRead ? "font-semibold" : ""}`}>
                            {notification.title}
                          </p>
                          {notification.priority === "URGENT" && (
                            <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {format(new Date(notification.createdAt), "d MMM, HH:mm", { locale: tr })}
                          </p>
                          {notification.actionLabel && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {notification.actionLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0d0d14]/50">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

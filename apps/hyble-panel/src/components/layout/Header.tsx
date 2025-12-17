"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Settings,
  User,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  title?: string;
  subtitle?: string;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const panelUrl =
    process.env.NODE_ENV === "production"
      ? "https://panel.hyble.co"
      : "http://localhost:3001";

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
      {/* Left - Title or Search */}
      <div className="flex items-center gap-4">
        {title ? (
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ara..."
              className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Go to Panel Button */}
        <a
          href={`${panelUrl}/dashboard`}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
        >
          Panele Git
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Bildirimler
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Yeni bildirim yok
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name || "Kullanici"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                  <Link
                    href="/settings/security"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Ayarlar
                  </Link>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Cikis Yap
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

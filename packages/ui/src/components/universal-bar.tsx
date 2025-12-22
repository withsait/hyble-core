"use client";

import { useState } from "react";
import { cn } from "../lib/utils";

export type AppType = "gateway" | "studios" | "digital" | "cloud" | "console";

interface UniversalBarProps {
  activeApp: AppType;
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
  } | null;
  credits?: number;
  cartCount?: number;
  onLogin?: () => void;
  onLogout?: () => void;
  onCartClick?: () => void;
}

const APP_LINKS: { app: AppType; label: string; href: string; color: string }[] = [
  { app: "studios", label: "Studios", href: "https://studios.hyble.co", color: "studios" },
  { app: "digital", label: "Digital", href: "https://digital.hyble.co", color: "digital" },
  { app: "cloud", label: "Cloud", href: "https://cloud.hyble.co", color: "cloud" },
];

export function UniversalBar({
  activeApp,
  user,
  credits = 0,
  cartCount = 0,
  onLogin,
  onLogout,
  onCartClick,
}: UniversalBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = !!user;

  const getAppColor = (app: string) => {
    switch (app) {
      case "studios":
        return "text-studios-600 hover:text-studios-700";
      case "digital":
        return "text-digital-600 hover:text-digital-700";
      case "cloud":
        return "text-cloud-600 hover:text-cloud-700";
      default:
        return "text-primary-600 hover:text-primary-700";
    }
  };

  const getActiveStyle = (app: AppType) => {
    if (activeApp !== app) return "";
    switch (app) {
      case "studios":
        return "border-b-2 border-studios-500 text-studios-600 font-medium";
      case "digital":
        return "border-b-2 border-digital-500 text-digital-600 font-medium";
      case "cloud":
        return "border-b-2 border-cloud-500 text-cloud-600 font-medium";
      default:
        return "border-b-2 border-primary-500 text-primary-600 font-medium";
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-6">
          {/* Hyble Logo */}
          <a href="https://hyble.co" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">Hyble</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {APP_LINKS.map(({ app, label, href }) => (
              <a
                key={app}
                href={href}
                className={cn(
                  "px-3 py-4 text-sm text-gray-600 transition-colors hover:text-gray-900",
                  getActiveStyle(app)
                )}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: Cart + Credits + User */}
        <div className="flex items-center gap-3">
          {/* Cart - Only show when authenticated */}
          {isAuthenticated && (
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          )}

          {/* Credits - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 sm:flex">
              <span className="text-sm font-medium text-gray-900">
                £{credits.toFixed(2)}
              </span>
            </div>
          )}

          {/* User Menu / Login Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {userInitials}
                  </div>
                )}
                <svg
                  className={cn(
                    "hidden h-4 w-4 text-gray-500 transition-transform sm:block",
                    isUserMenuOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-100 px-4 pb-3 pt-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <a
                        href="https://console.hyble.co"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Dashboard
                      </a>
                      <a
                        href="https://console.hyble.co/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </a>
                      <a
                        href="https://console.hyble.co/billing"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Billing
                      </a>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="space-y-1 px-4 py-3">
            {APP_LINKS.map(({ app, label, href, color }) => (
              <a
                key={app}
                href={href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100",
                  activeApp === app && `bg-${color}-50 ${getAppColor(app)}`
                )}
              >
                {label}
              </a>
            ))}
          </nav>
          {isAuthenticated && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Credits</span>
                <span className="text-sm font-medium text-gray-900">
                  £{credits.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

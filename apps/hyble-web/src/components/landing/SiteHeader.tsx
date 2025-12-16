"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/contact", label: "İletişim" },
];

const authLinks = [
  { href: "https://id.hyble.co/auth/login", label: "Giriş Yap" },
  { href: "https://id.hyble.co/auth/register", label: "Başla", primary: true },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Temayı Değiştir"
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-slate-300" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-4">
              {authLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    link.primary
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {authLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium text-center transition-colors ${
                      link.primary
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Sun, Moon, Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Docs", href: "/docs" },
];

// Auth URLs - external links
const AUTH_URL = "https://id.hyble.co";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-base sm:text-lg">H</span>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            hyble
          </span>
        </Link>

        {/* CENTER - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/40 backdrop-blur-sm rounded-full px-1.5 py-1 border border-slate-200/50 dark:border-slate-700/50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/70 dark:hover:bg-slate-700/50 rounded-full transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </button>
          )}

          {/* Login Button (Desktop) - External Link */}
          <a
            href={`${AUTH_URL}/login`}
            className="hidden sm:flex px-4 py-2 text-slate-600 dark:text-slate-300 font-medium text-[13px] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Login
          </a>

          {/* Register Button (Desktop) - External Link */}
          <a
            href={`${AUTH_URL}/register`}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-[13px] rounded-lg transition-all duration-300 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
          >
            Get Started
            <ChevronRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between text-[15px] font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <a
                href={`${AUTH_URL}/login`}
                className="block w-full text-center px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-[15px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
              <a
                href={`${AUTH_URL}/register`}
                className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold text-[15px] rounded-lg shadow-md shadow-blue-500/25"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

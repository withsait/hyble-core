"use client";

import Link from "next/link";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Why Hyble", href: "#why-hyble" },
  { name: "Docs", href: "/docs" },
];

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 dark:bg-[#0A0AFF]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            hyble
          </span>
        </Link>

        {/* CENTER - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {/* Coming Soon Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Coming Soon</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Sign In Button (Desktop) */}
          <Link
            href="/login"
            className="hidden sm:flex px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A0AFF] border-t border-gray-200 dark:border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-2 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Coming Soon</span>
            </div>
            <Link
              href="/login"
              className="block w-full text-center px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

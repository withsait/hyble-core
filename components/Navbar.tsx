"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Hizmetler", "Projeler", "AI Çözümleri", "Blog"];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#061020]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1A3050] shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tighter">
              hyble
            </span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mb-1 group-hover:animate-pulse" />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors touch-target"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}

            {/* Login Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-primary/50 transition-all group"
            >
              Müşteri Girişi
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white touch-target"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-16 left-0 right-0 bg-white dark:bg-[#061020] border-b border-gray-200 dark:border-[#1A3050] shadow-xl transition-all duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item}
                href="#"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors touch-target"
              >
                {item}
              </Link>
            ))}
            <hr className="my-2 border-gray-200 dark:border-[#1A3050]" />
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-black font-bold transition-colors touch-target"
            >
              Müşteri Girişi
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

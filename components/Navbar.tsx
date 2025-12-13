"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X, Sun, Moon, Globe, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("TR");
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Services", href: "#services" },
    { name: "Projects", href: "#projects" },
    { name: "AI Solutions", href: "#ai" },
    { name: "Gaming", href: "#mineble" },
    { name: "Contact", href: "/contact" },
  ];

  const languages = [
    { code: "TR", name: "Türkçe", flag: "🇹🇷" },
    { code: "EN", name: "English", flag: "🇬🇧" },
    { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            <span className="font-medium">
              <span className="hidden sm:inline">🚀 Hyble 2.0 is live! New AI-powered features and faster infrastructure.</span>
              <span className="sm:hidden">🚀 Hyble 2.0 is live!</span>
            </span>
            <Link href="/blog/hyble-2" className="underline underline-offset-2 hover:no-underline font-semibold ml-1">
              Discover →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`fixed top-8 sm:top-9 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 dark:bg-[#061020]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-[#1A3050]/50 shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-white/50 dark:bg-[#061020]/50 backdrop-blur-md border-b border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="relative">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                  hyble
                </span>
                <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:animate-ping" />
                <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Language Selector */}
              <div className="relative hidden sm:block" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-medium border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLang}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-40 py-2 bg-white dark:bg-[#0D1E36] rounded-xl shadow-xl border border-gray-200 dark:border-[#1A3050] transition-all duration-200 ${
                  langOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        currentLang === lang.code
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
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
                className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Login</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white transition-colors"
                aria-label="Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-[calc(2rem+3.5rem)] sm:top-[calc(2.25rem+4rem)] left-0 right-0 bg-white dark:bg-[#061020] border-b border-gray-200 dark:border-[#1A3050] shadow-2xl transition-all duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
          <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium"
              >
                {item.name}
                <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
              </Link>
            ))}

            {/* Mobile Language Selector */}
            <div className="pt-2 pb-1">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Language</p>
              <div className="flex gap-2 px-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentLang === lang.code
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-3 border-gray-200 dark:border-[#1A3050]" />

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 mx-2 px-4 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-all shadow-lg"
            >
              Login
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

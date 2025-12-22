"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Menu, X, ChevronDown, ExternalLink,
  Globe, Layout, Code2, Briefcase, FileText, Palette,
  ArrowRight, Gamepad2, Building2
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Sablonlar", href: "/templates" },
  { label: "Cozumler", href: "/solutions", hasDropdown: true },
  { label: "Demo", href: "/demo" },
  { label: "Iletisim", href: "/contact" },
];

const solutionItems = [
  { icon: Globe, name: "Hyble ID", description: "Kimlik dogrulama sistemi", href: "/solutions/id" },
  { icon: Briefcase, name: "Hyble Wallet", description: "Dijital cuzdan cozumu", href: "/solutions/wallet" },
  { icon: Code2, name: "Hyble License", description: "Lisans yonetim sistemi", href: "/solutions/license" },
  { icon: FileText, name: "Hyble Cloud", description: "Bulut hosting cozumleri", href: "/solutions/cloud" },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnter = (dropdown: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-xl">Digital</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("solutions")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                      activeDropdown === "solutions" ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === "solutions" ? "rotate-180" : ""
                    }`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-3 transition-all duration-200 ${
                      activeDropdown === "solutions" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 overflow-hidden p-3">
                      <div className="space-y-1">
                        {solutionItems.map((solution) => (
                          <Link
                            key={solution.name}
                            href={solution.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center flex-shrink-0">
                              <solution.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {solution.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {solution.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-slate-400" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}

            {/* Other Verticals */}
            <div className="hidden lg:flex items-center gap-2 ml-2 mr-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <a
                href="https://hyble.co"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Ana Sayfa
              </a>
              <a
                href="https://studios.hyble.co"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Studios
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Giris Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                Basla
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}

              {/* Vertical Links */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 px-3">
                <a
                  href="https://hyble.co"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <Globe className="w-4 h-4" />
                  Ana Sayfa
                </a>
                <a
                  href="https://studios.hyble.co"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Studios
                </a>
              </div>

              {/* Auth */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 px-3">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="py-2.5 text-sm text-center text-slate-600 dark:text-slate-300"
                >
                  Giris Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold text-center"
                >
                  Ucretsiz Basla
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

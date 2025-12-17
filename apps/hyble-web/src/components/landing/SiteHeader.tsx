"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Menu, X, ChevronDown,
  Shield, Wallet, Cloud, Key, Activity, Wrench,
  BookOpen, Headphones, FileText, Users, Gamepad2
} from "lucide-react";
import { useState, useEffect } from "react";

// Ürünler - Ana ürünler
const mainProducts = [
  {
    icon: Shield,
    name: "Hyble ID",
    description: "Kimlik doğrulama ve SSO",
    href: "/products/id",
  },
  {
    icon: Wallet,
    name: "Hyble Wallet",
    description: "Ödeme ve cüzdan sistemi",
    href: "/products/wallet",
  },
  {
    icon: Key,
    name: "Hyble License",
    description: "Yazılım lisanslama",
    href: "/products/license",
  },
  {
    icon: Activity,
    name: "Hyble Status",
    description: "Uptime monitoring",
    href: "/products/status",
  },
  {
    icon: Cloud,
    name: "Hyble Cloud",
    description: "VPS ve hosting",
    href: "/products/cloud",
    badge: "Yakında",
  },
  {
    icon: Gamepad2,
    name: "HybleGaming",
    description: "Game server hosting",
    href: "https://game.hyble.co",
    external: true,
  },
];

// Kaynaklar
const resources = [
  { icon: BookOpen, name: "Dokümantasyon", description: "API ve rehberler", href: "https://docs.hyble.co" },
  { icon: Headphones, name: "Destek", description: "7/24 yardım merkezi", href: "/support" },
  { icon: FileText, name: "Blog", description: "Haberler ve ipuçları", href: "/blog" },
  { icon: Users, name: "Topluluk", description: "Discord sunucusu", href: "https://discord.gg/hyble" },
];

// Araçlar
const tools = [
  { icon: Wrench, name: "Geliştirici Araçları", description: "Ücretsiz araçlar", href: "/tools" },
];

const navLinks = [
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/contact", label: "İletişim" },
];

type DropdownType = "products" | "resources" | null;

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  useEffect(() => setMounted(true), []);

  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnter = (dropdown: DropdownType) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-slate-900 font-bold text-sm">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-lg">Hyble</span>
          </Link>

          {/* Desktop Navigation - Vercel Style */}
          <nav className="hidden lg:flex items-center">
            {/* Ürünler Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("products")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${
                  activeDropdown === "products" ? "text-slate-900 dark:text-white" : ""
                }`}
              >
                Ürünler
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === "products" ? "rotate-180" : ""}`} />
              </button>

              {/* Products Dropdown */}
              <div
                className={`absolute top-full left-0 pt-2 transition-all duration-150 ${
                  activeDropdown === "products" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                }`}
              >
                <div className="w-[320px] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-2">
                  {mainProducts.map((product) => (
                    <Link
                      key={product.name}
                      href={product.href}
                      target={product.external ? "_blank" : undefined}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <product.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {product.name}
                          </span>
                          {"badge" in product && product.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {product.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Kaynaklar Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${
                  activeDropdown === "resources" ? "text-slate-900 dark:text-white" : ""
                }`}
              >
                Kaynaklar
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === "resources" ? "rotate-180" : ""}`} />
              </button>

              {/* Resources Dropdown */}
              <div
                className={`absolute top-full left-0 pt-2 transition-all duration-150 ${
                  activeDropdown === "resources" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                }`}
              >
                <div className="w-[280px] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-2">
                  {resources.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-500">{item.description}</span>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <tool.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white block">
                            {tool.name}
                          </span>
                          <span className="text-xs text-slate-500">{tool.description}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Diğer linkler */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Tema Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Temayı Değiştir"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-slate-400" />
                ) : (
                  <Sun className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Giriş
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Başla
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
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
              {/* Ürünler */}
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ürünler</p>
                {mainProducts.map((product) => (
                  <Link
                    key={product.name}
                    href={product.href}
                    target={product.external ? "_blank" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <product.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
                    {"badge" in product && product.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                        {product.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Kaynaklar */}
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kaynaklar</p>
                {resources.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Nav Links */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 px-3">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="py-2 text-sm text-center text-slate-600 dark:text-slate-300"
                >
                  Giriş Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-sm font-medium text-center"
                >
                  Ücretsiz Başla
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

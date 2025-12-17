"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Menu, X, ChevronDown,
  Shield, Wallet, Cloud, Key, Activity, Wrench,
  BookOpen, Headphones, FileText, Users,
  Globe, Gamepad2
} from "lucide-react";
import { useState, useEffect } from "react";

// Ürünler mega menü içeriği
const products = {
  main: [
    {
      icon: Shield,
      name: "Hyble ID",
      description: "Merkezi kimlik doğrulama ve SSO",
      href: "/products/id",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wallet,
      name: "Hyble Wallet",
      description: "Global cüzdan ve ödeme sistemi",
      href: "/products/wallet",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Cloud,
      name: "Hyble Cloud",
      description: "VPS, hosting ve sunucu çözümleri",
      href: "/products/cloud",
      badge: "Yakında",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Gamepad2,
      name: "HybleGaming",
      description: "Minecraft & Game Server Hosting",
      href: "https://game.hyble.co",
      color: "from-emerald-500 to-green-600",
      external: true,
    },
  ],
  tools: [
    {
      icon: Key,
      name: "Hyble License",
      description: "Yazılım lisanslama API",
      href: "/products/license",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Activity,
      name: "Hyble Status",
      description: "Uptime monitoring ve status sayfaları",
      href: "/products/status",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Wrench,
      name: "Hyble Tools",
      description: "Ücretsiz geliştirici araçları",
      href: "/tools",
      color: "from-slate-500 to-slate-700",
    },
  ],
  resources: [
    { icon: BookOpen, name: "Dokümantasyon", href: "https://docs.hyble.co" },
    { icon: Headphones, name: "Destek Merkezi", href: "/support" },
    { icon: FileText, name: "Blog", href: "/blog" },
    { icon: Users, name: "Topluluk", href: "https://discord.gg/hyble" },
  ],
};

// Dil seçenekleri
const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

const navLinks = [
  { href: "/about", label: "Hakkımızda" },
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/contact", label: "İletişim" },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  useEffect(() => setMounted(true), []);

  // Hover timeout için
  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnterProducts = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setProductsOpen(true);
  };

  const handleMouseLeaveProducts = () => {
    hoverTimeout = setTimeout(() => {
      setProductsOpen(false);
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Ürünler Dropdown - Hover ile açılır (Vercel tarzı) */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium ${
                  productsOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : ""
                }`}
              >
                Ürünler
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Menu - Vercel tarzı */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                  productsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="w-[800px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                    {/* Ana Ürünler */}
                    <div className="p-5">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        Ana Ürünler
                      </h3>
                      <div className="space-y-1">
                        {products.main.map((product) => (
                          <Link
                            key={product.name}
                            href={product.href}
                            target={product.external ? "_blank" : undefined}
                            onClick={() => setProductsOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <product.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {product.name}
                                </span>
                                {"badge" in product && product.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded font-medium">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {product.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Araçlar & Servisler */}
                    <div className="p-5">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        Araçlar & Servisler
                      </h3>
                      <div className="space-y-1">
                        {products.tools.map((product) => (
                          <Link
                            key={product.name}
                            href={product.href}
                            onClick={() => setProductsOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <product.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {product.name}
                              </span>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {product.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Kaynaklar */}
                    <div className="p-5 bg-slate-50/50 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        Kaynaklar
                      </h3>
                      <div className="space-y-1">
                        {products.resources.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setProductsOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group"
                          >
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alt Banner */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Tüm ürünleri keşfet</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">7 gün ücretsiz deneme ile başla</p>
                      </div>
                      <Link
                        href="https://id.hyble.co/register"
                        onClick={() => setProductsOpen(false)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
                      >
                        Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diğer linkler */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dil Seçici */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dil Seçin"
              >
                <span className="text-lg">{currentLang?.flag}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 max-h-80 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        currentLang?.code === lang.code ? "bg-blue-50 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lang.name}</span>
                      {currentLang?.code === lang.code && (
                        <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tema Toggle */}
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

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Giriş Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Başla
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
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700">
            <nav className="flex flex-col gap-1">
              {/* Ürünler Accordion */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ürünler</p>
                {[...products.main, ...products.tools].map((product) => (
                  <Link
                    key={product.name}
                    href={product.href}
                    target={("external" in product && product.external) ? "_blank" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                      <product.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                      {"badge" in product && (product as { badge?: string }).badge && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded">
                          {(product as { badge?: string }).badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {/* Dil Seçici - Mobile */}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Dil
                </p>
                <div className="flex flex-wrap gap-2 px-4">
                  {languages.slice(0, 5).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                        currentLang?.code === lang.code
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 px-4">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="px-4 py-3 rounded-lg text-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Giriş Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors"
                >
                  7 Gün Ücretsiz Başla
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

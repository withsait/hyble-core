"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Menu, X, ChevronDown, ExternalLink,
  Globe, ShoppingCart, Layout, Code2,
  Cloud, Server, Database, Gamepad2, ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { CartIcon } from "@/components/cart";
import { WishlistIcon } from "@/components/wishlist";

// Navigation items
const navItems = [
  { label: "Ürünler", href: "/products", hasDropdown: true },
  { label: "Çözümler", href: "/solutions", hasDropdown: true, dropdownType: "solutions" },
  { label: "Fiyatlandırma", href: "/pricing" },
  { label: "Hakkımızda", href: "/about" },
  { label: "İletişim", href: "/contact" },
];

// Menu item type
type MenuItem = {
  icon: typeof Globe;
  name: string;
  description: string;
  href: string;
  external?: boolean;
  badge?: string;
};

type ProductCategory = {
  title: string;
  items: MenuItem[];
};

// Products mega menu data
const productCategories: ProductCategory[] = [
  {
    title: "HAZIR ŞABLONLAR",
    items: [
      { icon: Globe, name: "Web Siteleri", description: "Kurumsal & kişisel siteler", href: "/store/category/website-templates" },
      { icon: ShoppingCart, name: "E-ticaret", description: "Online mağaza şablonları", href: "/store/category/ecommerce" },
      { icon: Layout, name: "Landing Page", description: "Dönüşüm odaklı sayfalar", href: "/store/category/landing-pages" },
      { icon: Code2, name: "SaaS Şablonları", description: "Hazır SaaS çözümleri", href: "/store/category/saas-templates" },
    ],
  },
  {
    title: "CLOUD HOSTING",
    items: [
      { icon: Cloud, name: "Cloud VPS", description: "Yüksek performans VPS", href: "/cloud" },
      { icon: Server, name: "Web Hosting", description: "Paylaşımlı hosting", href: "/cloud/pricing" },
      { icon: Database, name: "Managed Database", description: "PostgreSQL, MySQL, Redis", href: "/cloud" },
    ],
  },
  {
    title: "OYUN SUNUCULARI",
    items: [
      {
        icon: Gamepad2,
        name: "Game Servers",
        description: "Minecraft, FiveM ve daha fazlası",
        href: "https://gaming.hyble.co",
        external: true,
        badge: "gaming.hyble.co",
      },
    ],
  },
];

// Solutions menu
const solutionItems = [
  { icon: Globe, name: "Hyble ID", description: "Kimlik doğrulama sistemi", href: "/solutions/id" },
  { icon: ShoppingCart, name: "Hyble Wallet", description: "Dijital cüzdan çözümü", href: "/solutions/wallet" },
  { icon: Code2, name: "Hyble License", description: "Lisans yönetim sistemi", href: "/solutions/license" },
];

// Resources menu
const resourceItems = [
  { icon: Globe, name: "Dokümantasyon", description: "API ve entegrasyon rehberi", href: "/docs" },
  { icon: Layout, name: "Blog", description: "Haberler ve güncellemeler", href: "/blog" },
  { icon: Code2, name: "Destek", description: "Yardım merkezi", href: "/support" },
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
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.dropdownType || "products")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                      activeDropdown === (item.dropdownType || "products") ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === (item.dropdownType || "products") ? "rotate-180" : ""
                    }`} />
                  </button>

                  {/* Products Mega Menu */}
                  {item.dropdownType !== "solutions" && item.dropdownType !== "resources" && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                        activeDropdown === "products" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="w-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                        <div className="grid grid-cols-2 gap-0">
                          {/* Left Column - Templates & Cloud */}
                          <div className="p-5 border-r border-slate-100 dark:border-slate-800">
                            {productCategories.slice(0, 2).map((category) => (
                              <div key={category.title} className="mb-6 last:mb-0">
                                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                                  {category.title}
                                </h4>
                                <div className="space-y-1">
                                  {category.items.map((item) => (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-50 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-colors">
                                        <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                          {item.description}
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Right Column - Gaming */}
                          <div className="p-5 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/30 dark:to-slate-900">
                            {productCategories.slice(2).map((category) => (
                              <div key={category.title}>
                                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                                  {category.title}
                                </h4>
                                <div className="space-y-1">
                                  {category.items.map((item) => (
                                    item.external ? (
                                      <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setActiveDropdown(null)}
                                        className="flex items-start gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-colors group"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                                          <item.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                              {item.name}
                                            </span>
                                            {item.badge && (
                                              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-md">
                                                {item.badge}
                                              </span>
                                            )}
                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {item.description}
                                          </div>
                                        </div>
                                      </a>
                                    ) : (
                                      <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setActiveDropdown(null)}
                                        className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                                      >
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                          <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-slate-800 dark:text-white">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.description}
                                          </div>
                                        </div>
                                      </Link>
                                    )
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* CTA */}
                            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                              <Link
                                href="/store"
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                              >
                                Tüm ürünlere göz at
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solutions Dropdown */}
                  {item.dropdownType === "solutions" && (
                    <div
                      className={`absolute top-full left-0 pt-3 transition-all duration-200 ${
                        activeDropdown === "solutions" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 overflow-hidden p-3">
                        <div className="space-y-1">
                          {solutionItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800 dark:text-white">
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resources Dropdown */}
                  {item.dropdownType === "resources" && (
                    <div
                      className={`absolute top-full left-0 pt-3 transition-all duration-200 ${
                        activeDropdown === "resources" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 overflow-hidden p-3">
                        <div className="space-y-1">
                          {resourceItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800 dark:text-white">
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
                aria-label="Temayı Değiştir"
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-slate-400" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}

            {/* Wishlist Icon */}
            <WishlistIcon />

            {/* Cart Icon */}
            <CartIcon />

            {/* Vertical Buttons */}
            <div className="hidden lg:flex items-center gap-2 ml-2 mr-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <a
                href="https://digital.hyble.co"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Digital
              </a>
              <a
                href="https://studios.hyble.co"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Studios
              </a>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Giriş Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
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
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-1">
              {/* Nav Items */}
              {navItems.filter(item => !item.hasDropdown).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                >
                  {item.label}
                </Link>
              ))}

              {/* Products Section */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ürünler
                </p>
                {productCategories.map((category) => (
                  <div key={category.title} className="mb-4">
                    <p className="px-3 py-1 text-xs text-slate-400">
                      {category.title}
                    </p>
                    {category.items.map((item) => (
                      item.external ? (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                        >
                          <item.icon className="w-4 h-4 text-slate-400" />
                          {item.name}
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                        >
                          <item.icon className="w-4 h-4 text-slate-400" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                ))}
              </div>

              {/* Vertical Links */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 px-3">
                <a
                  href="https://digital.hyble.co"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                >
                  <Globe className="w-4 h-4" />
                  Digital
                </a>
                <a
                  href="https://studios.hyble.co"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Studios
                </a>
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 px-3">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="py-2.5 text-sm text-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                >
                  Giriş Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold text-center transition-all shadow-lg shadow-amber-500/20"
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

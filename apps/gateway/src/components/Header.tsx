"use client";

import Link from "next/link";
import {
  Menu, X, ChevronDown, ExternalLink,
  Globe, ShoppingCart, Layout, Code2,
  Cloud, Server, Database, Gamepad2, ArrowRight,
  Briefcase, Sparkles
} from "lucide-react";
import { useState } from "react";

// Navigation items
const navItems = [
  { label: "Ürünler", href: "/products", hasDropdown: true },
  { label: "Çözümler", href: "/solutions", hasDropdown: true, dropdownType: "solutions" },
  { label: "Kaynaklar", href: "/resources", hasDropdown: true, dropdownType: "resources" },
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
    title: "HYBLE STUDIOS",
    items: [
      { icon: Gamepad2, name: "Oyun Sunucuları", description: "Minecraft, Rust ve daha fazlası", href: "https://studios.hyble.co", external: true, badge: "Gaming" },
      { icon: Server, name: "GamePanel", description: "Sunucu yönetim paneli", href: "https://cloud.hyble.co/gamepanel", external: true },
    ],
  },
  {
    title: "HYBLE DIGITAL",
    items: [
      { icon: Globe, name: "Web Hosting", description: "Hızlı ve güvenilir hosting", href: "https://digital.hyble.co", external: true },
      { icon: Database, name: "Cloud VPS", description: "Yüksek performans VPS", href: "https://digital.hyble.co/vps", external: true },
      { icon: Layout, name: "Domain", description: "Alan adı kayıt", href: "https://digital.hyble.co/domains", external: true },
    ],
  },
  {
    title: "HYBLE CLOUD",
    items: [
      { icon: Cloud, name: "SaaS Uygulamaları", description: "GamePanel, WebStore ve daha fazlası", href: "https://cloud.hyble.co", external: true },
      { icon: Code2, name: "API & SDK", description: "Geliştirici araçları", href: "https://cloud.hyble.co/developers", external: true },
    ],
  },
];

// Solutions menu
const solutionItems = [
  { icon: Globe, name: "Hyble ID", description: "Tek kimlik, tüm servisler", href: "https://id.hyble.co" },
  { icon: ShoppingCart, name: "Hyble Wallet", description: "Dijital cüzdan çözümü", href: "https://console.hyble.co/wallet" },
  { icon: Briefcase, name: "Kurumsal Çözümler", description: "Özel enterprise paketleri", href: "/enterprise" },
];

// Resources menu
const resourceItems = [
  { icon: Globe, name: "Dokümantasyon", description: "API ve entegrasyon rehberi", href: "/docs" },
  { icon: Layout, name: "Blog", description: "Haberler ve güncellemeler", href: "/blog" },
  { icon: Code2, name: "Destek", description: "Yardım merkezi", href: "/support" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-slate-900 font-semibold text-xl">Hyble</span>
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
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors ${
                      activeDropdown === (item.dropdownType || "products") ? "text-blue-600" : ""
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
                      <div className="w-[700px] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-3 gap-0">
                          {productCategories.map((category, idx) => (
                            <div
                              key={category.title}
                              className={`p-5 ${idx < 2 ? 'border-r border-slate-100' : ''} ${
                                idx === 0 ? 'bg-gradient-to-br from-emerald-50/50 to-white' :
                                idx === 1 ? 'bg-gradient-to-br from-amber-50/50 to-white' :
                                'bg-gradient-to-br from-indigo-50/50 to-white'
                              }`}
                            >
                              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
                                idx === 0 ? 'text-emerald-600' :
                                idx === 1 ? 'text-amber-600' :
                                'text-indigo-600'
                              }`}>
                                {category.title}
                              </h4>
                              <div className="space-y-1">
                                {category.items.map((menuItem) => (
                                  menuItem.external ? (
                                    <a
                                      key={menuItem.name}
                                      href={menuItem.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setActiveDropdown(null)}
                                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/80 transition-colors group"
                                    >
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        idx === 0 ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                                        idx === 1 ? 'bg-amber-100 group-hover:bg-amber-200' :
                                        'bg-indigo-100 group-hover:bg-indigo-200'
                                      } transition-colors`}>
                                        <menuItem.icon className={`w-4 h-4 ${
                                          idx === 0 ? 'text-emerald-600' :
                                          idx === 1 ? 'text-amber-600' :
                                          'text-indigo-600'
                                        }`} />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
                                            {menuItem.name}
                                          </span>
                                          {menuItem.badge && (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                              idx === 0 ? 'bg-emerald-100 text-emerald-700' :
                                              idx === 1 ? 'bg-amber-100 text-amber-700' :
                                              'bg-indigo-100 text-indigo-700'
                                            }`}>
                                              {menuItem.badge}
                                            </span>
                                          )}
                                          <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          {menuItem.description}
                                        </div>
                                      </div>
                                    </a>
                                  ) : (
                                    <Link
                                      key={menuItem.name}
                                      href={menuItem.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/80 transition-colors group"
                                    >
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        idx === 0 ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                                        idx === 1 ? 'bg-amber-100 group-hover:bg-amber-200' :
                                        'bg-indigo-100 group-hover:bg-indigo-200'
                                      } transition-colors`}>
                                        <menuItem.icon className={`w-4 h-4 ${
                                          idx === 0 ? 'text-emerald-600' :
                                          idx === 1 ? 'text-amber-600' :
                                          'text-indigo-600'
                                        }`} />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
                                          {menuItem.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          {menuItem.description}
                                        </div>
                                      </div>
                                    </Link>
                                  )
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                              <Sparkles className="w-4 h-4 inline mr-2 text-blue-500" />
                              Tüm Hyble ürünlerini keşfedin
                            </p>
                            <Link
                              href="https://console.hyble.co"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Konsola Git
                              <ArrowRight className="w-4 h-4" />
                            </Link>
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
                      <div className="w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden p-3">
                        <div className="space-y-1">
                          {solutionItems.map((menuItem) => (
                            <Link
                              key={menuItem.name}
                              href={menuItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
                                <menuItem.icon className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800">
                                  {menuItem.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {menuItem.description}
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
                      <div className="w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden p-3">
                        <div className="space-y-1">
                          {resourceItems.map((menuItem) => (
                            <Link
                              key={menuItem.name}
                              href={menuItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
                                <menuItem.icon className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800">
                                  {menuItem.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {menuItem.description}
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
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Giriş Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Ücretsiz Başla
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-1">
              {/* Nav Items */}
              {navItems.filter(item => !item.hasDropdown).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                >
                  {item.label}
                </Link>
              ))}

              {/* Products Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
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
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
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
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                        >
                          <item.icon className="w-4 h-4 text-slate-400" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 px-3">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="py-2.5 text-sm text-center text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Giriş Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold text-center transition-all shadow-lg shadow-blue-500/20"
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

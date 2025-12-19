"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { CartIcon } from "@/components/cart";
import { WishlistIcon } from "@/components/wishlist";

// Basit navigation items - max 5 item
const navItems = [
  { label: "Ürünler", href: "/products", hasDropdown: true },
  { label: "Fiyatlandırma", href: "/pricing" },
  { label: "Şablonlar", href: "/store" },
  { label: "Destek", href: "/support" },
];

// Ürünler dropdown - basit liste
const productItems = [
  { name: "Web Siteleri", description: "Kurumsal & kişisel siteler", href: "/store/category/website-templates" },
  { name: "E-ticaret", description: "Online mağaza şablonları", href: "/store/category/ecommerce" },
  { name: "Cloud Hosting", description: "VPS ve web hosting", href: "/cloud/pricing" },
  { name: "Game Servers", description: "Minecraft, FiveM ve daha fazlası", href: "https://gaming.hyble.co", external: true },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setProductsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setProductsOpen(false);
    }, 100);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
          </Link>

          {/* Desktop Navigation - Simplified */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                      productsOpen ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${productsOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Simple Dropdown */}
                  <div
                    className={`absolute top-full left-0 pt-2 transition-all duration-150 ${
                      productsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                    }`}
                  >
                    <div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden py-2">
                      {productItems.map((product) => (
                        product.external ? (
                          <a
                            key={product.name}
                            href={product.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setProductsOpen(false)}
                            className="flex flex-col px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-sm font-medium text-slate-800 dark:text-white">
                              {product.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {product.description}
                            </span>
                          </a>
                        ) : (
                          <Link
                            key={product.name}
                            href={product.href}
                            onClick={() => setProductsOpen(false)}
                            className="flex flex-col px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-sm font-medium text-slate-800 dark:text-white">
                              {product.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {product.description}
                            </span>
                          </Link>
                        )
                      ))}
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
          <div className="flex items-center gap-3">
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

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Giriş Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-amber-500/20"
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                >
                  {item.label}
                </Link>
              ))}

              {/* Product Items in Mobile */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ürünler
                </p>
                {productItems.map((product) => (
                  product.external ? (
                    <a
                      key={product.name}
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                    >
                      {product.name}
                    </a>
                  ) : (
                    <Link
                      key={product.name}
                      href={product.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                    >
                      {product.name}
                    </Link>
                  )
                ))}
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
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold text-center transition-colors"
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

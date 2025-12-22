"use client";

import Link from "next/link";
import {
  Menu, X, ChevronDown,
  Globe, Gamepad2, Server, Cpu,
  Crown, Zap
} from "lucide-react";
import { useState } from "react";

// Minecraft Block Icon (Creeper-style)
function MinecraftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      {/* Minecraft block/creeper face style */}
      <rect x="0" y="0" width="16" height="16" rx="2" />
      {/* Eyes */}
      <rect x="2" y="3" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="10" y="3" width="4" height="4" fill="white" opacity="0.9" />
      {/* Mouth */}
      <rect x="5" y="8" width="6" height="2" fill="white" opacity="0.9" />
      <rect x="6" y="10" width="4" height="4" fill="white" opacity="0.9" />
    </svg>
  );
}

const navItems = [
  { label: "Sunucular", href: "/servers", hasDropdown: true },
  { label: "Pluginler", href: "/plugins" },
  { label: "Paketler", href: "/packs" },
  { label: "Iletisim", href: "/contact" },
];

const serverItems = [
  { icon: Gamepad2, name: "Minecraft", description: "Java & Bedrock sunuculari", href: "/servers/minecraft" },
  { icon: Cpu, name: "FiveM", description: "GTA V roleplay sunuculari", href: "/servers/fivem" },
  { icon: Server, name: "Rust", description: "Survival oyun sunuculari", href: "/servers/rust" },
  { icon: Zap, name: "Diger Oyunlar", description: "CS2, ARK, Valheim ve daha fazlasi", href: "/servers/other" },
];

export function SiteHeader() {
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
    <header className="sticky top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-md border-b border-emerald-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MinecraftIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 font-semibold text-xl">Hyble</span>
              <span className="text-emerald-600 font-semibold text-xl">Studios</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("servers")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors ${
                      activeDropdown === "servers" ? "text-emerald-600" : ""
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === "servers" ? "rotate-180" : ""
                    }`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-3 transition-all duration-200 ${
                      activeDropdown === "servers" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    <div className="w-72 bg-white rounded-2xl shadow-2xl shadow-emerald-200/30 border border-emerald-100 overflow-hidden p-3">
                      <div className="space-y-1">
                        {serverItems.map((server) => (
                          <Link
                            key={server.name}
                            href={server.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                              <server.icon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                                {server.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {server.description}
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
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Other Verticals */}
            <div className="hidden lg:flex items-center gap-1 ml-2 mr-2 border-l border-emerald-100 pl-4">
              <a
                href="https://digital.hyble.co"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Digital
              </a>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg"
              >
                <MinecraftIcon className="w-3.5 h-3.5" />
                Studios
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <a
                href="https://id.hyble.co/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Giris Yap
              </a>
              <a
                href="https://id.hyble.co/auth/register"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Basla
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-emerald-50"
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
          <div className="lg:hidden py-4 border-t border-emerald-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}

              {/* Vertical Links */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-emerald-100 px-3">
                <a
                  href="https://digital.hyble.co"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-lg"
                >
                  <Globe className="w-4 h-4" />
                  Digital
                </a>
                <span
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg"
                >
                  <MinecraftIcon className="w-4 h-4" />
                  Studios
                </span>
              </div>

              {/* Auth */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-emerald-100 px-3">
                <a
                  href="https://id.hyble.co/auth/login"
                  className="py-2.5 text-sm text-center text-slate-600"
                >
                  Giris Yap
                </a>
                <a
                  href="https://id.hyble.co/auth/register"
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold text-center"
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

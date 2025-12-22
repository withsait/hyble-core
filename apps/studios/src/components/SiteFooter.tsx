"use client";

import Link from "next/link";
import { Gamepad2, Globe, Building2 } from "lucide-react";

const footerLinks = {
  sunucular: [
    { label: "Minecraft", href: "/servers/minecraft" },
    { label: "FiveM", href: "/servers/fivem" },
    { label: "Rust", href: "/servers/rust" },
    { label: "Diger Oyunlar", href: "/servers/other" },
  ],
  urunler: [
    { label: "Pluginler", href: "/plugins" },
    { label: "Server Packler", href: "/packs" },
    { label: "Ozel Gelistirme", href: "/custom" },
    { label: "Destek Paketleri", href: "/support-plans" },
  ],
  sirket: [
    { label: "Hakkimizda", href: "https://hyble.co/about" },
    { label: "Iletisim", href: "/contact" },
    { label: "Blog", href: "https://hyble.co/blog" },
    { label: "Kariyer", href: "https://hyble.co/careers" },
  ],
  yasal: [
    { label: "Gizlilik Politikasi", href: "https://hyble.co/legal/privacy" },
    { label: "Kullanim Sartlari", href: "https://hyble.co/legal/terms" },
    { label: "Iade Politikasi", href: "https://hyble.co/legal/refunds" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900 dark:text-white">Hyble</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Studios</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Gaming cozumleri. Sunucular, pluginler ve ozel gelistirmeler.
            </p>
            <div className="flex gap-2">
              <a
                href="https://hyble.co"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="https://digital.hyble.co"
                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Sunucular</h4>
            <ul className="space-y-2">
              {footerLinks.sunucular.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Urunler</h4>
            <ul className="space-y-2">
              {footerLinks.urunler.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Sirket</h4>
            <ul className="space-y-2">
              {footerLinks.sirket.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Yasal</h4>
            <ul className="space-y-2">
              {footerLinks.yasal.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Hyble Ltd. Tum haklari saklidir.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            UK Registered Company #15872841
          </p>
        </div>
      </div>
    </footer>
  );
}

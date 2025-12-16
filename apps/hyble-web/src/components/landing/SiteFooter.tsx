"use client";

import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative py-16 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
              Geliştiriciler için hepsi bir arada platform. Daha iyi yazılımları, daha hızlı geliştirin.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/hyblehq"
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/hyblehq"
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://discord.gg/hyble"
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Ürün</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Özellikler
                </Link>
              </li>
              <li>
                <a href="https://docs.hyble.co" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dokümantasyon
                </a>
              </li>
              <li>
                <a href="https://status.hyble.co" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sistem Durumu
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Şirket</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Gizlilik
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Hyble Ltd. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

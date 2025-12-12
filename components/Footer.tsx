"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOptions = [
    { value: "light", icon: Sun, label: "Gündüz" },
    { value: "dark", icon: Moon, label: "Gece" },
    { value: "system", icon: Monitor, label: "Sistem" },
  ];

  return (
    <footer className="bg-white dark:bg-[#061020] border-t border-gray-200 dark:border-[#1A3050] pt-16 sm:pt-20 pb-8 sm:pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-20">

          {/* Marka */}
          <div className="col-span-1 sm:col-span-2">
            <Link href="/" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tighter mb-4 sm:mb-6 block">
              hyble<span className="text-primary">.</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6 sm:mb-8 text-sm sm:text-base">
              Yapay zeka gücüyle işletmeleri ve toplulukları dönüştüren yeni nesil dijital mimarlık ofisi.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-primary hover:text-black transition-all touch-target">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-primary hover:text-black transition-all touch-target">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-primary hover:text-black transition-all touch-target">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-primary hover:text-black transition-all touch-target">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Linkler */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Şirket</h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">Hakkımızda</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">Kariyer</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">İletişim</Link></li>
            </ul>
          </div>

          {/* Linkler 2 */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Hizmetler</h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">Web Geliştirme</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">AI Danışmanlığı</Link></li>
              <li><Link href="/gaming" className="hover:text-primary transition-colors touch-target inline-block py-1">Minecraft Sunucu</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors touch-target inline-block py-1">Siber Güvenlik</Link></li>
            </ul>
          </div>
        </div>

        {/* Tema Seçici */}
        <div className="border-t border-gray-200 dark:border-[#1A3050] pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-muted">Görünüm:</span>
            <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-[#0D1E36] border border-gray-200 dark:border-[#1A3050]">
              {mounted && themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-target ${
                    theme === option.value
                      ? "bg-primary text-black shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-label={option.label}
                >
                  <option.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
              {!mounted && (
                <div className="flex items-center gap-1 px-4 py-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alt Telif */}
        <div className="border-t border-gray-200 dark:border-[#1A3050] pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-500 gap-4">
          <p>&copy; 2025 Hyble Digital Solutions. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target py-1">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target py-1">Kullanım Şartları</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

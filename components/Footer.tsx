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
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <footer className="bg-white dark:bg-[#061020] border-t border-gray-200 dark:border-[#1A3050] pt-16 sm:pt-20 pb-8 sm:pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-20">

          {/* Marka */}
          <div className="col-span-1 sm:col-span-2">
            <Link href="/" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tighter mb-4 sm:mb-6 block">
              hyble<span className="text-blue-500">.</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6 sm:mb-8 text-sm sm:text-base">
              Next-generation digital architecture office transforming businesses and communities with the power of AI.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all touch-target">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all touch-target">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all touch-target">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all touch-target">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Company</h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">About Us</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Careers</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Blog</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Contact</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Services</h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Web Development</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">AI Consulting</Link></li>
              <li><Link href="/gaming" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Minecraft Server</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target inline-block py-1">Cyber Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="border-t border-gray-200 dark:border-[#1A3050] pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-muted">Appearance:</span>
            <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-[#0D1E36] border border-gray-200 dark:border-[#1A3050]">
              {mounted && themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-target ${
                    theme === option.value
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
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

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-[#1A3050] pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-500 gap-4">
          <p>&copy; 2025 Hyble Digital Solutions. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target py-1">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors touch-target py-1">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

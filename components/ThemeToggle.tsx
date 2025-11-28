"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Hydration hatasını önlemek için
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10"></div>; // Yüklenirken boş kutu göster
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors group"
      aria-label="Temayı Değiştir"
    >
      {/* Güneş İkonu (Gündüzken görünür) */}
      <Sun className="h-5 w-5 text-yellow-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      
      {/* Ay İkonu (Geceyen görünür) */}
      <Moon className="h-5 w-5 text-primary rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
    </button>
  );
}
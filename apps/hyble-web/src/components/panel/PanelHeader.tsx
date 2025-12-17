"use client";

import { useTheme } from "next-themes";
import { Bell, Menu, Search, User, Sun, Moon } from "lucide-react";

export function PanelHeader() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden dark:text-slate-200"
      >
        <span className="sr-only">Menüyü aç</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Ara
          </label>
          <div className="relative w-full text-slate-400 focus-within:text-slate-600 dark:focus-within:text-slate-200">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              className="block h-full w-full border-0 bg-transparent py-0 pl-10 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-white sm:text-sm"
              placeholder="Ara..."
              type="search"
              name="search"
            />
          </div>
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
            title={theme === "dark" ? "Açık moda geç" : "Karanlık moda geç"}
          >
            <span className="sr-only">Tema değiştir</span>
            {theme === "dark" ? (
              <Sun className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Moon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
          >
            <span className="sr-only">Bildirimler</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700"
            aria-hidden="true"
          />
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button className="flex items-center gap-x-2 p-1.5">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="text-sm font-semibold leading-6 text-slate-900 dark:text-white"
                  aria-hidden="true"
                >
                  Kullanıcı
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

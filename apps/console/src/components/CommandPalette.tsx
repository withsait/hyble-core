"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  CreditCard,
  Wallet,
  Globe,
  HeadphonesIcon,
  Settings,
  User,
  Plus,
  Moon,
  Sun,
  LogOut,
  Building2,
  FileText,
  Bell,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";

interface Command {
  id: string;
  name: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "action" | "settings";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const commands: Command[] = [
    // Navigation
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Ana sayfaya git",
      icon: Home,
      shortcut: "G D",
      action: () => router.push("/dashboard"),
      category: "navigation",
    },
    {
      id: "billing",
      name: "Faturalar",
      description: "Fatura ve ödemelerinizi görüntüleyin",
      icon: CreditCard,
      shortcut: "G B",
      action: () => router.push("/billing"),
      category: "navigation",
    },
    {
      id: "wallet",
      name: "Cüzdan",
      description: "Hyble Credits bakiyenizi yönetin",
      icon: Wallet,
      shortcut: "G W",
      action: () => router.push("/wallet"),
      category: "navigation",
    },
    {
      id: "websites",
      name: "Web Sitelerim",
      description: "Web sitelerinizi yönetin",
      icon: Globe,
      action: () => router.push("/websites"),
      category: "navigation",
    },
    {
      id: "support",
      name: "Destek",
      description: "Destek taleplerinizi görüntüleyin",
      icon: HeadphonesIcon,
      shortcut: "G S",
      action: () => router.push("/support"),
      category: "navigation",
    },
    {
      id: "organizations",
      name: "Organizasyonlar",
      description: "Ekiplerinizi yönetin",
      icon: Building2,
      action: () => router.push("/organizations"),
      category: "navigation",
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Site istatistiklerinizi görüntüleyin",
      icon: FileText,
      action: () => router.push("/analytics"),
      category: "navigation",
    },
    // Actions
    {
      id: "new-website",
      name: "Yeni Web Sitesi",
      description: "Yeni bir web sitesi oluşturun",
      icon: Plus,
      shortcut: "N W",
      action: () => router.push("/websites/new"),
      category: "action",
    },
    {
      id: "new-ticket",
      name: "Yeni Destek Talebi",
      description: "Destek ekibine ulaşın",
      icon: Plus,
      action: () => router.push("/support/new"),
      category: "action",
    },
    {
      id: "add-funds",
      name: "Bakiye Yükle",
      description: "Cüzdanınıza bakiye ekleyin",
      icon: Wallet,
      action: () => router.push("/wallet?action=deposit"),
      category: "action",
    },
    // Settings
    {
      id: "toggle-theme",
      name: theme === "dark" ? "Açık Moda Geç" : "Karanlık Moda Geç",
      description: "Tema tercihini değiştir",
      icon: theme === "dark" ? Sun : Moon,
      shortcut: "T",
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
      category: "settings",
    },
    {
      id: "notifications",
      name: "Bildirim Ayarları",
      description: "Bildirim tercihlerinizi yönetin",
      icon: Bell,
      action: () => router.push("/settings/notifications"),
      category: "settings",
    },
    {
      id: "security",
      name: "Güvenlik",
      description: "Şifre ve 2FA ayarlarını yönetin",
      icon: Shield,
      action: () => router.push("/settings/security"),
      category: "settings",
    },
    {
      id: "account",
      name: "Hesap Ayarları",
      description: "Profil bilgilerinizi düzenleyin",
      icon: User,
      action: () => {
        window.location.href = "https://id.hyble.co/account";
      },
      category: "settings",
    },
    {
      id: "logout",
      name: "Çıkış Yap",
      description: "Hesabınızdan çıkış yapın",
      icon: LogOut,
      action: () => {
        window.location.href = "/api/auth/signout";
      },
      category: "settings",
    },
  ];

  const filteredCommands =
    query === ""
      ? commands
      : commands.filter((command) => {
          const searchStr = `${command.name} ${command.description || ""}`.toLowerCase();
          return searchStr.includes(query.toLowerCase());
        });

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    action: filteredCommands.filter((c) => c.category === "action"),
    settings: filteredCommands.filter((c) => c.category === "settings"),
  };

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((command: Command | null) => {
    if (!command) return;
    setOpen(false);
    setQuery("");
    command.action();
  }, []);

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery("")}>
      <Dialog onClose={setOpen} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform overflow-hidden rounded-xl bg-white dark:bg-[#12121a] shadow-2xl ring-1 ring-black/5 transition-all">
              <Combobox onChange={handleSelect}>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                    placeholder="Komut ara..."
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <kbd className="absolute right-4 top-3.5 hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-slate-600 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                    ESC
                  </kbd>
                </div>

                {filteredCommands.length > 0 && (
                  <Combobox.Options
                    static
                    className="max-h-80 scroll-py-2 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto"
                  >
                    {groupedCommands.navigation.length > 0 && (
                      <li className="p-2">
                        <h2 className="mb-2 px-3 text-xs font-semibold text-slate-500">
                          Gezinti
                        </h2>
                        <ul>
                          {groupedCommands.navigation.map((command) => (
                            <Combobox.Option
                              key={command.id}
                              value={command}
                              className={({ active }) =>
                                `flex cursor-pointer select-none items-center rounded-lg px-3 py-2 ${
                                  active
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-700 dark:text-slate-300"
                                }`
                              }
                            >
                              {({ active }) => (
                                <>
                                  <command.icon
                                    className={`h-5 w-5 flex-none ${
                                      active ? "text-white" : "text-slate-400"
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {command.name}
                                  </span>
                                  {command.shortcut && (
                                    <kbd
                                      className={`ml-3 flex-none text-xs font-semibold ${
                                        active
                                          ? "text-blue-200"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}

                    {groupedCommands.action.length > 0 && (
                      <li className="p-2">
                        <h2 className="mb-2 px-3 text-xs font-semibold text-slate-500">
                          Eylemler
                        </h2>
                        <ul>
                          {groupedCommands.action.map((command) => (
                            <Combobox.Option
                              key={command.id}
                              value={command}
                              className={({ active }) =>
                                `flex cursor-pointer select-none items-center rounded-lg px-3 py-2 ${
                                  active
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-700 dark:text-slate-300"
                                }`
                              }
                            >
                              {({ active }) => (
                                <>
                                  <command.icon
                                    className={`h-5 w-5 flex-none ${
                                      active ? "text-white" : "text-slate-400"
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {command.name}
                                  </span>
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}

                    {groupedCommands.settings.length > 0 && (
                      <li className="p-2">
                        <h2 className="mb-2 px-3 text-xs font-semibold text-slate-500">
                          Ayarlar
                        </h2>
                        <ul>
                          {groupedCommands.settings.map((command) => (
                            <Combobox.Option
                              key={command.id}
                              value={command}
                              className={({ active }) =>
                                `flex cursor-pointer select-none items-center rounded-lg px-3 py-2 ${
                                  active
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-700 dark:text-slate-300"
                                }`
                              }
                            >
                              {({ active }) => (
                                <>
                                  <command.icon
                                    className={`h-5 w-5 flex-none ${
                                      active ? "text-white" : "text-slate-400"
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {command.name}
                                  </span>
                                  {command.shortcut && (
                                    <kbd
                                      className={`ml-3 flex-none text-xs font-semibold ${
                                        active
                                          ? "text-blue-200"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}
                  </Combobox.Options>
                )}

                {query !== "" && filteredCommands.length === 0 && (
                  <div className="px-6 py-14 text-center sm:px-14">
                    <Search
                      className="mx-auto h-6 w-6 text-slate-400"
                      aria-hidden="true"
                    />
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      "{query}" için sonuç bulunamadı
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-xs text-slate-500">
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-semibold">
                    ↵
                  </kbd>
                  <span className="mr-4">seç</span>
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-semibold">
                    ↑
                  </kbd>
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-semibold">
                    ↓
                  </kbd>
                  <span className="mr-4">gezin</span>
                  <kbd className="mx-1 flex h-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-1.5 font-semibold">
                    esc
                  </kbd>
                  <span>kapat</span>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  HeadphonesIcon,
  Settings,
  LogOut,
  Globe,
  ShoppingBag,
  Heart,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Web Sitelerim", href: "/websites", icon: Globe },
  { name: "Siparişlerim", href: "/orders", icon: ShoppingBag },
  { name: "Favorilerim", href: "/favorites", icon: Heart },
  { name: "Cüzdan", href: "/wallet", icon: Wallet },
  { name: "Faturalama", href: "/billing", icon: Receipt },
  { name: "Destek", href: "/support", icon: HeadphonesIcon },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function PanelSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 shrink-0 items-center">
          <span className="text-2xl font-bold text-blue-600">Hyble</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                href="https://id.hyble.co/logout"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
              >
                <LogOut
                  className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400"
                  aria-hidden="true"
                />
                Çıkış Yap
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

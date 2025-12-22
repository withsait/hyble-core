"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  User,
  Shield,
  Monitor,
  Link2,
  Bell,
  Key,
  LayoutDashboard,
  FolderKanban,
  Cloud,
  Globe,
  Lock,
  Wallet,
  FileText,
  CreditCard,
  Building2,
  HeadphonesIcon,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  badge?: string;
}

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const panelUrl = process.env.NODE_ENV === "production"
  ? "https://panel.hyble.co"
  : "http://localhost:3001";

const identityNavItems: NavItem[] = [
  {
    title: "Genel Bakış",
    href: "/dashboard",
    icon: User,
  },
  {
    title: "Güvenlik",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Aktif Oturumlar",
    href: "/settings/sessions",
    icon: Monitor,
  },
  {
    title: "Bağlı Hesaplar",
    href: "/settings/connections",
    icon: Link2,
  },
  {
    title: "Bildirim Tercihleri",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "API Anahtarları",
    href: "/settings/api-keys",
    icon: Key,
  },
];

const panelQuickLinks: NavItem[] = [
  {
    title: "Panel Dashboard",
    href: `${panelUrl}/dashboard`,
    icon: LayoutDashboard,
    external: true,
  },
  {
    title: "Projelerim",
    href: `${panelUrl}/projects`,
    icon: FolderKanban,
    external: true,
  },
  {
    title: "Cloud Hosting",
    href: `${panelUrl}/cloud`,
    icon: Cloud,
    external: true,
  },
  {
    title: "Domainler",
    href: `${panelUrl}/domains`,
    icon: Globe,
    external: true,
  },
];

const financeNavItems: NavItem[] = [
  {
    title: "Cüzdanım",
    href: `${panelUrl}/wallet`,
    icon: Wallet,
    external: true,
  },
  {
    title: "Faturalarım",
    href: `${panelUrl}/billing`,
    icon: FileText,
    external: true,
  },
  {
    title: "Ödeme Yöntemleri",
    href: `${panelUrl}/payment-methods`,
    icon: CreditCard,
    external: true,
  },
];

const orgNavItems: NavItem[] = [
  {
    title: "Organizasyonlarım",
    href: `${panelUrl}/organizations`,
    icon: Building2,
    external: true,
  },
];

const supportNavItems: NavItem[] = [
  {
    title: "Destek Merkezi",
    href: `${panelUrl}/support`,
    icon: HeadphonesIcon,
    external: true,
  },
  {
    title: "Dökümanlar",
    href: "https://docs.hyble.co",
    icon: BookOpen,
    external: true,
  },
];

function CollapsibleSection({
  title,
  items,
  currentPath,
  defaultOpen = true,
  icon: SectionIcon,
}: {
  title: string;
  items: NavItem[];
  currentPath: string;
  defaultOpen?: boolean;
  icon?: LucideIcon;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveItem = items.some(item => !item.external && currentPath === item.href);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          hasActiveItem
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        <div className="flex items-center gap-2">
          {SectionIcon && <SectionIcon className="w-4 h-4" />}
          <span className="uppercase text-xs tracking-wider">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <nav className="mt-1 space-y-0.5">
          {items.map((item) => {
            const isActive = !item.external && currentPath === item.href;
            const Icon = item.icon;

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                    "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  <span className="flex-1">{item.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-blue-500" : "text-slate-400")} />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-semibold text-base leading-tight">
              Hyble ID
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Kimlik Merkezi
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Identity Section - Primary */}
        <CollapsibleSection
          title="Hesabım"
          items={identityNavItems}
          currentPath={pathname}
          defaultOpen={true}
          icon={User}
        />

        {/* Panel CTA Banner */}
        <div className="my-4 mx-1">
          <a
            href={panelUrl}
            className="block p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    Hyble Panel
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Projelerini ve hizmetlerini yönet
                </p>
              </div>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="my-3 mx-3 border-t border-slate-200 dark:border-slate-800" />

        {/* Panel Quick Links */}
        <CollapsibleSection
          title="Hızlı Erişim"
          items={panelQuickLinks}
          currentPath={pathname}
          defaultOpen={false}
          icon={LayoutDashboard}
        />

        {/* Finance */}
        <CollapsibleSection
          title="Finans"
          items={financeNavItems}
          currentPath={pathname}
          defaultOpen={false}
          icon={Wallet}
        />

        {/* Organization */}
        <CollapsibleSection
          title="Organizasyon"
          items={orgNavItems}
          currentPath={pathname}
          defaultOpen={false}
          icon={Building2}
        />

        {/* Support */}
        <CollapsibleSection
          title="Yardım"
          items={supportNavItems}
          currentPath={pathname}
          defaultOpen={false}
          icon={HeadphonesIcon}
        />
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-2 ring-blue-500/20">
              <span className="text-white text-sm font-medium">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user.name || "Kullanıcı"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href="/settings"
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4 text-slate-400" />
            </Link>
            <a
              href="/api/auth/signout"
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  KeyRound,
  HeadphonesIcon,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const identityNavItems = [
  {
    title: "Genel Bakis",
    href: "/dashboard",
    icon: User,
  },
  {
    title: "Guvenlik",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Oturumlar",
    href: "/settings/sessions",
    icon: Monitor,
  },
  {
    title: "Bagli Hesaplar",
    href: "/settings/connections",
    icon: Link2,
  },
  {
    title: "Bildirimler",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "API Anahtarlari",
    href: "/settings/api-keys",
    icon: Key,
  },
];

const serviceNavItems = [
  {
    title: "Dashboard",
    href: `${panelUrl}/dashboard`,
    icon: LayoutDashboard,
    external: true,
  },
  {
    title: "Projeler",
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
    title: "Domains",
    href: `${panelUrl}/domains`,
    icon: Globe,
    external: true,
  },
  {
    title: "SSL Sertifikalari",
    href: `${panelUrl}/ssl`,
    icon: Lock,
    external: true,
  },
];

const financeNavItems = [
  {
    title: "Cuzdan",
    href: `${panelUrl}/wallet`,
    icon: Wallet,
    external: true,
  },
  {
    title: "Faturalar",
    href: `${panelUrl}/billing`,
    icon: FileText,
    external: true,
  },
  {
    title: "Odeme Yontemleri",
    href: `${panelUrl}/payment-methods`,
    icon: CreditCard,
    external: true,
  },
];

const orgNavItems = [
  {
    title: "Takimlarim",
    href: `${panelUrl}/organizations`,
    icon: Building2,
    external: true,
  },
  {
    title: "Takim API Keys",
    href: `${panelUrl}/organizations/api-keys`,
    icon: KeyRound,
    external: true,
  },
];

const supportNavItems = [
  {
    title: "Destek Talepleri",
    href: `${panelUrl}/support`,
    icon: HeadphonesIcon,
    external: true,
  },
  {
    title: "Dokumantasyon",
    href: "https://docs.hyble.co",
    icon: BookOpen,
    external: true,
  },
];

function NavSection({
  title,
  items,
  currentPath,
}: {
  title: string;
  items: typeof identityNavItems;
  currentPath: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = !item.external && currentPath === item.href;
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.title}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-blue-500")} />
              <span>{item.title}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-slate-900 dark:text-white font-semibold text-lg">
            Hyble ID
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavSection
          title="Hyble ID"
          items={identityNavItems}
          currentPath={pathname}
        />

        <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

        <NavSection
          title="Hizmetler"
          items={serviceNavItems}
          currentPath={pathname}
        />

        <NavSection
          title="Finans"
          items={financeNavItems}
          currentPath={pathname}
        />

        <NavSection
          title="Organizasyon"
          items={orgNavItems}
          currentPath={pathname}
        />

        <NavSection
          title="Destek"
          items={supportNavItems}
          currentPath={pathname}
        />
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user.name || "Kullanici"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

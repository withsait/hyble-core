import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Wallet,
  Key,
  ExternalLink,
  Monitor,
  Building2,
} from "lucide-react";
import { prisma } from "@hyble/database";
import { VerificationBanner } from "@/components/VerificationBanner";
import { VerificationSuccess } from "@/components/VerificationSuccess";
import { SessionTracker } from "@/components/SessionTracker";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { verified?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch user from database with profile
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });

  const isEmailVerified = !!dbUser?.emailVerified;
  const profile = dbUser?.profile;
  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user.name || "Kullanıcı";
  const avatarUrl = profile?.avatar || user.image;
  const justVerified = searchParams.verified === "true";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Session Tracker - creates/updates session record */}
      <SessionTracker />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-slate-900 dark:text-white font-semibold text-xl">Hyble ID</span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <Link href="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-slate-900 dark:text-white text-sm hidden sm:block">
                  {displayName}
                </span>
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Email Verification Success Message (auto-hides after 5 seconds) */}
        {justVerified && <VerificationSuccess />}

        {/* Email Verification Banner */}
        {!isEmailVerified && user.email && (
          <VerificationBanner email={user.email} />
        )}

        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Hoş geldin, {profile?.firstName || displayName.split(" ")[0]}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hyble hesabını ve bağlı uygulamalarını yönet.
          </p>
        </div>

        {/* Profile Card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-start gap-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  {displayName}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{user.email}</p>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm">
                    <Shield className="w-4 h-4" />
                    {user.role === "admin" ? "Admin" : "Kullanıcı"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                    <User className="w-4 h-4" />
                    Aktif
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/profile/edit"
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Hesap Bilgileri
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Hesap ID</span>
                <span className="text-slate-900 dark:text-white font-mono text-sm">
                  {user.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Rol</span>
                <span className="text-slate-900 dark:text-white capitalize">{user.role === "admin" ? "Admin" : "Kullanıcı"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Bağlı Uygulamalar</span>
                <span className="text-slate-900 dark:text-white">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hızlı İşlemler</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: User,
              title: "Profil",
              description: "Profil bilgilerini görüntüle",
              href: "/dashboard/profile",
            },
            {
              icon: Settings,
              title: "Profili Düzenle",
              description: "Kişisel bilgilerini güncelle",
              href: "/dashboard/profile/edit",
            },
            {
              icon: Key,
              title: "Güvenlik",
              description: "Şifre ve 2FA yönetimi",
              href: "/settings/security",
            },
            {
              icon: Monitor,
              title: "Oturumlar",
              description: "Aktif cihazları yönet",
              href: "/settings/sessions",
            },
            {
              icon: Building2,
              title: "Organizasyonlar",
              description: "Ekiplerinizi yönetin",
              href: "/organizations",
            },
            {
              icon: Wallet,
              title: "Cüzdan",
              description: "Bakiye ve işlemler",
              href: "/wallet",
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <action.icon className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-medium mb-1">{action.title}</h4>
              <p className="text-slate-600 dark:text-slate-500 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Hyble Apps */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hyble Uygulamaları</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Hyble",
              description: "Main website",
              url: "https://hyble.co",
            },
            {
              name: "Hyble Tools",
              description: "Developer utilities",
              url: "https://tools.hyble.co",
            },
            {
              name: "Hyble Status",
              description: "Service status",
              url: "https://status.hyble.co",
            },
          ].map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 rounded-xl transition-all"
            >
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">{app.name}</h4>
                <p className="text-slate-600 dark:text-slate-500 text-sm">{app.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

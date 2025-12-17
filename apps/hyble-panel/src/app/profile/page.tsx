import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Key,
  ExternalLink,
  Monitor,
  Mail,
  CheckCircle,
  XCircle,
  Smartphone,
} from "lucide-react";
import { prisma } from "@hyble/db";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch user from database with profile and 2FA status
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      twoFactorAuth: true,
      connectedAccounts: true,
    },
  });

  const isEmailVerified = !!dbUser?.emailVerified;
  const is2FAEnabled = dbUser?.twoFactorAuth?.enabled ?? false;
  const profile = dbUser?.profile;
  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user.name || "Kullanici";
  const avatarUrl = profile?.avatar || user.image;
  const connectedAccounts = dbUser?.connectedAccounts || [];

  // Panel URL
  const panelUrl =
    process.env.NODE_ENV === "production"
      ? "https://panel.hyble.co"
      : "http://localhost:3001";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-slate-900 dark:text-white font-semibold text-xl">
                Hyble ID
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />

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
                  <span className="hidden sm:block">Cikis</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Hyble ID Profili
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kimlik bilgilerinizi ve guvenlik ayarlarinizi yonetin.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
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
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {user.email}
              </p>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                    isEmailVerified
                      ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isEmailVerified ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {isEmailVerified ? "E-posta Dogrulandi" : "E-posta Dogrulanmadi"}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                    is2FAEnabled
                      ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {is2FAEnabled ? "2FA Aktif" : "2FA Pasif"}
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

        {/* Account Info */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Hesap Bilgileri
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Hesap ID
                </span>
              </div>
              <span className="text-slate-900 dark:text-white font-mono text-sm">
                {user.id?.slice(0, 12)}...
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  E-posta
                </span>
              </div>
              <span className="text-slate-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Bagli Hesaplar
                </span>
              </div>
              <span className="text-slate-900 dark:text-white">
                {connectedAccounts.length} hesap
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Guvenlik & Ayarlar
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/settings/security"
            className="group p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium mb-1">
              Guvenlik
            </h4>
            <p className="text-slate-600 dark:text-slate-500 text-sm">
              Sifre ve 2FA yonetimi
            </p>
          </Link>

          <Link
            href="/settings/sessions"
            className="group p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium mb-1">
              Oturumlar
            </h4>
            <p className="text-slate-600 dark:text-slate-500 text-sm">
              Aktif cihazlari yonet
            </p>
          </Link>
        </div>

        {/* Go to Panel CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Hyble Panel</h3>
              <p className="text-blue-100 text-sm">
                Projelerinizi, cuzdaninizi ve daha fazlasini yonetin.
              </p>
            </div>
            <a
              href={`${panelUrl}/dashboard`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
            >
              Panele Git
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

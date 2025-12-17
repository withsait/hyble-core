import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Monitor,
  Link2,
  Bell,
  Key,
  Mail,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { prisma } from "@hyble/db";
import { DashboardLayout } from "@/components/layout";
import { VerificationBanner } from "@/components/VerificationBanner";
import { SessionTracker } from "@/components/SessionTracker";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch user from database with profile and security info
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      twoFactorAuth: true,
      connectedAccounts: true,
      userSessions: {
        where: { isRevoked: false },
        orderBy: { lastActiveAt: "desc" },
        take: 5,
      },
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
  const activeSessions = dbUser?.userSessions || [];

  const panelUrl =
    process.env.NODE_ENV === "production"
      ? "https://panel.hyble.co"
      : "http://localhost:3001";

  // Security score calculation
  let securityScore = 0;
  if (isEmailVerified) securityScore += 30;
  if (is2FAEnabled) securityScore += 40;
  if (connectedAccounts.length > 0) securityScore += 15;
  if (dbUser?.password) securityScore += 15;

  const getSecurityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getSecurityBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <DashboardLayout
      user={{
        id: user.id,
        name: displayName,
        email: user.email,
        image: avatarUrl,
        role: user.role,
      }}
    >
      <SessionTracker />

      {/* Email Verification Banner */}
      {!isEmailVerified && user.email && (
        <div className="mb-6">
          <VerificationBanner email={user.email} />
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Hos geldin, {profile?.firstName || displayName.split(" ")[0]}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Hyble ID hesabini ve guvenlik ayarlarini yonet.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-5">
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
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </h2>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
                    Admin
                  </span>
                )}
              </div>
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
                  {isEmailVerified ? "E-posta Dogrulandi" : "Dogrulanmadi"}
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
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              Duzenle
            </Link>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            Guvenlik Puani
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(securityScore / 100) * 226} 226`}
                  strokeLinecap="round"
                  className={getSecurityColor(securityScore)}
                />
              </svg>
              <span
                className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getSecurityColor(securityScore)}`}
              >
                {securityScore}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {securityScore >= 80
                  ? "Hesabin guvenli"
                  : securityScore >= 50
                    ? "Iyilestirilebilir"
                    : "Acil iyilestirme gerekli"}
              </p>
            </div>
          </div>
          <Link
            href="/settings/security"
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Guvenligi artir
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Hizli Islemler
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/profile"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            Profil
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Kisisel bilgilerini goruntule
          </p>
        </Link>

        <Link
          href="/settings/security"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            Guvenlik
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Sifre ve 2FA yonetimi
          </p>
        </Link>

        <Link
          href="/settings/sessions"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            Oturumlar
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            {activeSessions.length} aktif cihaz
          </p>
        </Link>

        <Link
          href="/settings/connections"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
            <Link2 className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            Bagli Hesaplar
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            {connectedAccounts.length} hesap bagli
          </p>
        </Link>

        <Link
          href="/settings/notifications"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
            <Bell className="w-5 h-5 text-pink-600 dark:text-pink-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            Bildirimler
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Bildirim tercihlerini yonet
          </p>
        </Link>

        <Link
          href="/settings/api-keys"
          className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
            <Key className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
            API Anahtarlari
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            API erisimini yonet
          </p>
        </Link>
      </div>

      {/* Account Info & Recent Sessions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Account Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Hesap Bilgileri
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
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
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  E-posta
                </span>
              </div>
              <span className="text-slate-900 dark:text-white text-sm">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Kayit Tarihi
                </span>
              </div>
              <span className="text-slate-900 dark:text-white text-sm">
                {dbUser?.createdAt
                  ? new Date(dbUser.createdAt).toLocaleDateString("tr-TR")
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Son Aktivite
                </span>
              </div>
              <span className="text-slate-900 dark:text-white text-sm">
                {dbUser?.lastActiveAt
                  ? new Date(dbUser.lastActiveAt).toLocaleDateString("tr-TR")
                  : "Simdi"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Son Oturumlar
            </h3>
            <Link
              href="/settings/sessions"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Tumunu Gor
            </Link>
          </div>
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {activeSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <Monitor className="w-5 h-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {session.deviceName || `${session.browser || "Bilinmeyen"} - ${session.os || "Bilinmeyen"}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.location || session.ipAddress || "Bilinmeyen konum"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(session.lastActiveAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Aktif oturum bulunamadi
            </p>
          )}
        </div>
      </div>

      {/* Go to Panel CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Hyble Panel</h3>
              <p className="text-blue-100 text-sm">
                Projelerini, cuzdanini ve tum hizmetlerini yonet
              </p>
            </div>
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
    </DashboardLayout>
  );
}

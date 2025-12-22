import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldOff,
  Calendar,
  Smartphone,
  Globe,
  Key,
  Wallet,
  Building2,
  LogIn,
  CheckCircle,
  AlertTriangle,
  Monitor,
  MapPin,
} from "lucide-react";
import { UserDetailActions } from "./UserDetailActions";
import { SessionsList } from "./SessionsList";

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      twoFactorAuth: {
        select: { enabled: true, verified: true, createdAt: true },
      },
      wallets: true,
      accounts: {
        select: { provider: true, type: true },
      },
      memberships: {
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
      },
      userSessions: {
        where: { isRevoked: false, expiresAt: { gt: new Date() } },
        orderBy: { lastActiveAt: "desc" },
        take: 10,
      },
      securityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          securityLogs: true,
          userSessions: true,
        },
      },
    },
  });

  return user;
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const user = await getUser(params.id);
  if (!user) {
    notFound();
  }

  const statusColors = {
    ACTIVE: "bg-green-500/20 text-green-400",
    SUSPENDED: "bg-yellow-500/20 text-yellow-400",
    FROZEN: "bg-red-500/20 text-red-400",
    PENDING_DELETION: "bg-purple-500/20 text-purple-400",
  };

  const statusLabels = {
    ACTIVE: "Aktif",
    SUSPENDED: "Askıda",
    FROZEN: "Dondurulmuş",
    PENDING_DELETION: "Silinme Bekliyor",
  };

  const roleColors = {
    admin: "bg-purple-500/20 text-purple-400",
    user: "bg-slate-700 text-slate-300",
  };

  const securityActionLabels: Record<string, string> = {
    LOGIN: "Giriş",
    LOGOUT: "Çıkış",
    PASSWORD_CHANGE: "Şifre Değişikliği",
    EMAIL_CHANGE: "E-posta Değişikliği",
    PHONE_CHANGE: "Telefon Değişikliği",
    TWO_FACTOR_ENABLE: "2FA Etkinleştirme",
    TWO_FACTOR_DISABLE: "2FA Devre Dışı",
    ACCOUNT_LOCK: "Hesap Kilitleme",
    ACCOUNT_UNLOCK: "Hesap Kilit Açma",
    SESSION_REVOKE: "Oturum Sonlandırma",
    API_KEY_CREATE: "API Anahtarı Oluşturma",
    API_KEY_REVOKE: "API Anahtarı İptal",
  };

  const securityStatusColors = {
    SUCCESS: "text-green-400",
    FAILURE: "text-red-400",
    BLOCKED: "text-yellow-400",
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/users"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Kullanıcı Detayları</h1>
          <p className="text-slate-400 text-sm mt-1">
            ID: <code className="bg-slate-800 px-2 py-0.5 rounded">{user.id}</code>
          </p>
        </div>
        <UserDetailActions
          userId={user.id}
          currentRole={user.role}
          currentStatus={user.status}
          has2FA={user.twoFactorAuth?.enabled || false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Profil Bilgileri
            </h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                {user.image ? (
                  <img src={user.image} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-sm">Ad Soyad</label>
                    <p className="text-white font-medium">{user.name || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">E-posta</label>
                    <div className="flex items-center gap-2">
                      <p className="text-white">{user.email}</p>
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">Telefon</label>
                    <p className="text-white">{user.phoneNumber || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">Durum</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                      {statusLabels[user.status]}
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">Rol</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors] || roleColors.user}`}>
                      {user.role === "admin" ? "Admin" : "Kullanıcı"}
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">Güven Seviyesi</label>
                    <p className="text-white">{user.trustLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Güvenlik
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {user.twoFactorAuth?.enabled ? (
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <ShieldOff className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-slate-400 text-sm">2FA</span>
                </div>
                <p className={`font-medium ${user.twoFactorAuth?.enabled ? "text-green-400" : "text-slate-400"}`}>
                  {user.twoFactorAuth?.enabled ? "Aktif" : "Kapalı"}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-400 text-sm">E-posta</span>
                </div>
                <p className={`font-medium ${user.emailVerified ? "text-green-400" : "text-yellow-400"}`}>
                  {user.emailVerified ? "Doğrulanmış" : "Beklemede"}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-400 text-sm">Telefon</span>
                </div>
                <p className={`font-medium ${user.phoneVerified ? "text-green-400" : "text-slate-400"}`}>
                  {user.phoneVerified ? "Doğrulanmış" : "Doğrulanmamış"}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-400 text-sm">Oturumlar</span>
                </div>
                <p className="font-medium text-white">{user.userSessions.length} Aktif</p>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              Aktif Oturumlar ({user.userSessions.length})
            </h2>
            <SessionsList sessions={user.userSessions} userId={user.id} />
          </div>

          {/* Security Logs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-amber-400" />
              Güvenlik Logları ({user._count.securityLogs})
            </h2>
            <div className="space-y-3">
              {user.securityLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Güvenlik kaydı bulunamadı</p>
              ) : (
                user.securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.status === "SUCCESS" ? "bg-green-400" : log.status === "FAILURE" ? "bg-red-400" : "bg-yellow-400"}`} />
                      <div>
                        <p className="text-white font-medium">
                          {securityActionLabels[log.action] || log.action}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          {log.ipAddress && <span>{log.ipAddress}</span>}
                          {log.device && <span>• {log.device}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${securityStatusColors[log.status]}`}>
                        {log.status === "SUCCESS" ? "Başarılı" : log.status === "FAILURE" ? "Başarısız" : "Engellendi"}
                      </span>
                      <p className="text-slate-500 text-xs">
                        {format(log.createdAt, "dd MMM yyyy HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Tarihler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-sm">Kayıt Tarihi</label>
                <p className="text-white">
                  {format(user.createdAt, "dd MMMM yyyy HH:mm", { locale: tr })}
                </p>
              </div>
              <div>
                <label className="text-slate-500 text-sm">Son Güncelleme</label>
                <p className="text-white">
                  {format(user.updatedAt, "dd MMMM yyyy HH:mm", { locale: tr })}
                </p>
              </div>
              {user.emailVerified && (
                <div>
                  <label className="text-slate-500 text-sm">E-posta Doğrulama</label>
                  <p className="text-white">
                    {format(user.emailVerified, "dd MMMM yyyy HH:mm", { locale: tr })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Bağlı Hesaplar
            </h3>
            {user.accounts.length === 0 ? (
              <p className="text-slate-400 text-sm">Bağlı hesap yok (yalnızca e-posta/şifre)</p>
            ) : (
              <div className="space-y-3">
                {user.accounts.map((account) => (
                  <div
                    key={account.provider}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                  >
                    <span className="text-white capitalize">{account.provider}</span>
                    <span className="text-slate-500 text-sm">
                      {account.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallets */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              Cüzdanlar
            </h3>
            {user.wallets.length === 0 ? (
              <p className="text-slate-400 text-sm">Cüzdan bulunamadı</p>
            ) : (
              <div className="space-y-3">
                {user.wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                  >
                    <span className="text-slate-400">{wallet.currency}</span>
                    <span className="text-white font-medium">
                      {parseFloat(wallet.balance.toString()).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Organizations */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Organizasyonlar
            </h3>
            {user.memberships.length === 0 ? (
              <p className="text-slate-400 text-sm">Organizasyon üyeliği yok</p>
            ) : (
              <div className="space-y-3">
                {user.memberships.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/organizations/${membership.organization.slug}`}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {membership.organization.logo ? (
                        <img
                          src={membership.organization.logo}
                          alt=""
                          className="w-8 h-8 rounded-lg"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <span className="text-white">{membership.organization.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm capitalize">{membership.role.toLowerCase()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

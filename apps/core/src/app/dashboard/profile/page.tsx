import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@hyble/db";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Briefcase,
  Globe,
  Calendar,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) {
    redirect("/login");
  }

  const profile = user.profile;
  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user.name || "İsimsiz Kullanıcı";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard&apos;a Dön
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profil</h1>
          <Link
            href="/dashboard/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Düzenle
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {profile?.avatar || user.image ? (
              <img
                src={profile?.avatar || user.image || ""}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{displayName}</h2>
              {profile?.position && (
                <p className="text-slate-600 dark:text-slate-400 mb-4">{profile.position}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm">
                  <Shield className="w-4 h-4" />
                  {user.role === "admin" ? "Admin" : "Kullanıcı"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                  <User className="w-4 h-4" />
                  {user.status}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                  <Shield className="w-4 h-4" />
                  {user.trustLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">İletişim Bilgileri</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-500">Email</p>
                <p className="text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Doğrulanmış
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    Doğrulanmamış
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-500">Telefon</p>
                <p className="text-slate-900 dark:text-white">{user.phoneNumber || "Belirtilmemiş"}</p>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2">
                  {user.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Doğrulanmış
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Doğrulanmamış
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        {profile && (
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profil Detayları</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.position && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-500">Pozisyon</p>
                    <p className="text-slate-900 dark:text-white">{profile.position}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-500">Dil</p>
                  <p className="text-slate-900 dark:text-white">{profile.language === "tr" ? "Türkçe" : profile.language}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-500">Saat Dilimi</p>
                  <p className="text-slate-900 dark:text-white">{profile.timezone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-500">Tarih Formatı</p>
                  <p className="text-slate-900 dark:text-white">{profile.dateFormat}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="mt-6 text-center text-slate-600 dark:text-slate-500 text-sm">
          <p>
            Hesap ID: <span className="font-mono text-slate-700 dark:text-slate-400">{user.id}</span>
          </p>
          <p className="mt-1">
            Kayıt Tarihi: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </main>
    </div>
  );
}

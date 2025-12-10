import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@hyble/database";
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Database,
  Mail,
  Key,
  Lock,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Server,
} from "lucide-react";

async function getSettingsData() {
  const [
    totalUsers,
    activeUsers,
    totalSessions,
    totalSecurityLogs,
    totalLoginAttempts,
    expiredSessions,
    oldSecurityLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.userSession.count(),
    prisma.securityLog.count(),
    prisma.loginAttempt.count(),
    prisma.userSession.count({
      where: { expiresAt: { lt: new Date() } },
    }),
    prisma.securityLog.count({
      where: {
        createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalSessions,
    totalSecurityLogs,
    totalLoginAttempts,
    expiredSessions,
    oldSecurityLogs,
  };
}

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const data = await getSettingsData();

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ayarlar</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Admin panel ve sistem ayarlarını yönetin
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Admin Profili
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl font-bold text-white">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "A"}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {session.user?.name || "İsimsiz Admin"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{session.user?.email}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    Admin
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Kullanıcı ID</p>
                <code className="text-blue-600 dark:text-blue-400 text-sm">{session.user?.id}</code>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Son Giriş</p>
                <p className="text-slate-900 dark:text-white">Şu an</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Oturum</p>
                <p className="text-green-600 dark:text-green-400">Aktif</p>
              </div>
            </div>
          </div>
        </section>

        {/* General Settings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Genel Ayarlar
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dil
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Saat Dilimi
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tarih Formatı
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="dd/MM/yyyy">31/12/2024</option>
                  <option value="MM/dd/yyyy">12/31/2024</option>
                  <option value="yyyy-MM-dd">2024-12-31</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Para Birimi
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="TRY">TRY - Türk Lirası</option>
                  <option value="USD">USD - Dolar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sayfa Boyutu
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="10">10 kayıt</option>
                  <option value="20">20 kayıt</option>
                  <option value="50">50 kayıt</option>
                  <option value="100">100 kayıt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tema
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="system">Sistem</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Güvenlik Ayarları
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">İki Faktörlü Kimlik Doğrulama (2FA)</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">Tüm adminler için 2FA zorunluluğu</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">Oturum Kilitleme</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">İşlemsiz kalındığında oturumu kilitle</p>
                </div>
              </div>
              <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="never">Hiçbir zaman</option>
                <option value="5">5 dakika</option>
                <option value="15">15 dakika</option>
                <option value="30">30 dakika</option>
                <option value="60">1 saat</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">IP Kısıtlaması</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">Sadece belirli IP adreslerinden erişim</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">Şifre Süresi</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">Şifre değişikliği zorunluluğu</p>
                </div>
              </div>
              <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="never">Hiçbir zaman</option>
                <option value="30">30 gün</option>
                <option value="60">60 gün</option>
                <option value="90">90 gün</option>
              </select>
            </div>
          </div>
        </section>

        {/* Email Settings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            E-posta Ayarları
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SMTP Sunucu
                </label>
                <input
                  type="text"
                  placeholder="smtp.example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  placeholder="587"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Gönderen E-posta
                </label>
                <input
                  type="email"
                  placeholder="noreply@hyble.co"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Gönderen Adı
                </label>
                <input
                  type="text"
                  placeholder="Hyble"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                Test E-postası Gönder
              </button>
              <button className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-medium transition-colors">
                Kaydet
              </button>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Bildirim Ayarları
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Yeni Kullanıcı Bildirimi</h4>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Yeni kullanıcı kaydolduğunda bildirim al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Güvenlik Uyarıları</h4>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Şüpheli aktivite tespit edildiğinde bildirim al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Sistem Hataları</h4>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Sistem hatası oluştuğunda bildirim al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Günlük Rapor</h4>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Her gün sistem özeti e-postası al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Database Maintenance */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Veritabanı Bakımı
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalUsers}</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Toplam Oturum</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalSessions}</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                  {data.expiredSessions} süresi dolmuş
                </p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Güvenlik Logları</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalSecurityLogs}</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                  {data.oldSecurityLogs} eski (90+ gün)
                </p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Giriş Denemeleri</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalLoginAttempts}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium">Süresi Dolmuş Oturumları Temizle</h4>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">{data.expiredSessions} oturum temizlenecek</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                  Temizle
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium">Eski Güvenlik Loglarını Temizle</h4>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">90 günden eski {data.oldSecurityLogs} log temizlenecek</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors">
                  Temizle
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium">Veritabanı Yedeği Al</h4>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">Tüm veritabanını SQL olarak indir</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors">
                  İndir
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            Tehlikeli Bölge
          </h2>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">Tüm Oturumları Sonlandır</h4>
                  <p className="text-red-600 dark:text-red-400/70 text-sm">Tüm kullanıcıların oturumları sonlandırılacak</p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">
                  Sonlandır
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">Cache Temizle</h4>
                  <p className="text-red-600 dark:text-red-400/70 text-sm">Tüm önbellek verilerini temizle</p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">
                  Temizle
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">Bakım Modu</h4>
                  <p className="text-red-600 dark:text-red-400/70 text-sm">Sistemi bakım moduna al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Environment Info */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Ortam Bilgileri
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Uygulama</p>
                <p className="text-slate-900 dark:text-white font-medium">Hyble Admin</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Ortam</p>
                <p className={`font-medium ${process.env.NODE_ENV === "production" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                  {process.env.NODE_ENV || "development"}
                </p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Versiyon</p>
                <p className="text-slate-900 dark:text-white font-medium">1.0.0</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Node.js</p>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{process.version}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

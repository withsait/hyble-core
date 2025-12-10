import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/login?error=AccessDenied");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-slate-900 dark:text-white font-semibold">
                Hyble Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {session.user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Toplam Kullanıcı
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              0
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Aktif Servisler
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              0
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Aylık Gelir
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              $0
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Destek Talepleri
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              0
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Kullanıcı Ekle
            </button>
            <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Servis Oluştur
            </button>
            <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Fatura Kes
            </button>
            <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Sistem Durumu
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

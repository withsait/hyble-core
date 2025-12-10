import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="text-2xl font-bold text-amber-500">Hyble</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-sm">{session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <nav className="lg:col-span-1 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900/50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil
            </Link>
            <Link
              href="/dashboard/security"
              className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900/50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Güvenlik
            </Link>
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900/50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Oturumlar
            </Link>
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900/50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Cüzdan
            </Link>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6 mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Hoş geldiniz, {session.user.name || "Kullanıcı"}!
              </h1>
              <p className="text-zinc-400">
                Hyble hesabınızı buradan yönetebilirsiniz.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-500 text-sm">Bakiye</p>
                <p className="text-3xl font-bold text-white mt-2">$0.00</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-500 text-sm">Aktif Servisler</p>
                <p className="text-3xl font-bold text-white mt-2">0</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-500 text-sm">Destek Talepleri</p>
                <p className="text-3xl font-bold text-white mt-2">0</p>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Servisleriniz
              </h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-zinc-500 mb-4">Henüz aktif servisiniz yok</p>
                <Link
                  href="https://hyble.co/services"
                  className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
                >
                  Servislere Göz At
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

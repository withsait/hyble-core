import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User, LayoutDashboard, Plus } from "lucide-react";

export default async function Dashboard() {
  // Sunucu tarafında oturum bilgisini çek
  const session = await getServerSession();

  // Güvenlik kontrolü (Oturum yoksa login'e at)
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-bold font-display text-white tracking-tighter">
            hyble<span className="text-primary">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/5 hover:border-primary/50 transition-all">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-medium">Genel Bakış</span>
          </button>
          
          <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <User className="w-5 h-5" />
            <span className="font-medium">Müşteriler</span>
          </button>
        </nav>

        {/* Kullanıcı Profili & Çıkış */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-black font-bold text-lg">
              {session.user?.name?.[0] || "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-2 transition-colors">
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </Link>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Üst Başlık */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">
              Hoşgeldin, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">{session.user?.name}</span>
            </h1>
            <p className="text-gray-400 mt-1">Sisteme bugün 3 yeni bildirim düştü.</p>
          </div>
          
          {/* GÜNCELLENEN KISIM: Buton Link içine alındı */}
          <Link href="/dashboard/new">
            <button className="flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-lg font-bold hover:scale-105 transition-transform shadow-[0_0_20px_-5px_#CCFF00]">
              <Plus className="w-5 h-5" />
              Yeni Proje Ekle
            </button>
          </Link>
        </header>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface border border-white/10 p-6 rounded-2xl hover:border-secondary/30 transition-colors">
            <h3 className="text-gray-400 mb-2 text-sm font-medium uppercase tracking-wider">Toplam Gelir</h3>
            <p className="text-4xl font-bold text-white font-display">₺ 0.00</p>
          </div>
          <div className="bg-surface border border-white/10 p-6 rounded-2xl hover:border-primary/30 transition-colors">
            <h3 className="text-gray-400 mb-2 text-sm font-medium uppercase tracking-wider">Aktif Projeler</h3>
            <p className="text-4xl font-bold text-white font-display">1</p>
          </div>
          <div className="bg-surface border border-white/10 p-6 rounded-2xl hover:border-accent/30 transition-colors">
            <h3 className="text-gray-400 mb-2 text-sm font-medium uppercase tracking-wider">Bekleyen İşler</h3>
            <p className="text-4xl font-bold text-white font-display">3</p>
          </div>
        </div>

        {/* Son Aktiviteler (Boş Durum) */}
        <div className="bg-surface border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Henüz Aktivite Yok</h3>
          <p className="text-gray-400 max-w-sm">
            Proje eklemeye başladığında veya müşterilerinden talep geldiğinde burada görünecek.
          </p>
        </div>

      </main>
    </div>
  );
}
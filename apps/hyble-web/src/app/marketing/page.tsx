import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-amber-500">
              Hyble
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-zinc-400 hover:text-white transition-colors">
                Servisler
              </Link>
              <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors">
                Fiyatlar
              </Link>
              <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">
                Hakkımızda
              </Link>
              <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                İletişim
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://id.hyble.co/login"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="https://id.hyble.co/register"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Güçlü <span className="text-amber-500">Hosting</span>
            <br />
            Sınırsız İmkanlar
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Yüksek performanslı web hosting, VPS ve cloud çözümleri ile
            projelerinizi bir üst seviyeye taşıyın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-lg"
            >
              Servisleri İncele
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors text-lg border border-zinc-700"
            >
              Fiyatları Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Neden <span className="text-amber-500">Hyble</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Yüksek Performans
              </h3>
              <p className="text-zinc-400">
                NVMe SSD diskler ve en son nesil işlemciler ile maksimum hız.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Güvenlik
              </h3>
              <p className="text-zinc-400">
                DDoS koruması, SSL sertifikaları ve günlük yedekleme.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                7/24 Destek
              </h3>
              <p className="text-zinc-400">
                Uzman ekibimiz her zaman yanınızda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Servislerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">
                Web Hosting
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Başlangıç seviyesi web siteleri için
              </p>
              <p className="text-amber-500 font-bold">$2.99/ay&apos;dan</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">
                VPS
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Tam kontrol ve esneklik
              </p>
              <p className="text-amber-500 font-bold">$9.99/ay&apos;dan</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">
                Dedicated Server
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Maksimum performans
              </p>
              <p className="text-amber-500 font-bold">$49.99/ay&apos;dan</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">
                Domain
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Alan adı kaydı ve transferi
              </p>
              <p className="text-amber-500 font-bold">$8.99/yıl&apos;dan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Ücretsiz hesap oluşturun ve hosting servislerimizi keşfedin.
          </p>
          <Link
            href="https://id.hyble.co/register"
            className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-lg"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-amber-500 mb-4">Hyble</h3>
              <p className="text-zinc-500 text-sm">
                UK-registered premium hosting provider.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Servisler</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link href="/services/web-hosting" className="hover:text-white">Web Hosting</Link></li>
                <li><Link href="/services/vps" className="hover:text-white">VPS</Link></li>
                <li><Link href="/services/dedicated" className="hover:text-white">Dedicated Server</Link></li>
                <li><Link href="/services/domain" className="hover:text-white">Domain</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link href="/about" className="hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/contact" className="hover:text-white">İletişim</Link></li>
                <li><Link href="/careers" className="hover:text-white">Kariyer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link href="/terms" className="hover:text-white">Kullanım Şartları</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Gizlilik Politikası</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-zinc-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Hyble. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

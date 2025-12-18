import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Shield, Key, CreditCard, Cloud, Gamepad2, Server,
  Activity, Wrench, ArrowRight, Zap, Lock, Globe,
  CheckCircle2, Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Çözümler | Hyble Ekosistemi",
  description: "Hyble ekosisteminin sunduğu tüm çözümleri keşfedin. Kimlik yönetimi, ödeme sistemleri, hosting altyapısı ve daha fazlası.",
};

const solutions = [
  {
    slug: "id",
    icon: Shield,
    name: "Hyble ID",
    tagline: "Tek kimlik, tüm erişim",
    description: "OAuth 2.0, OpenID Connect, MFA ve SSO desteği ile güvenli kimlik doğrulama. Kullanıcılarınızı tek bir yerden yönetin.",
    features: ["OAuth 2.0 & OpenID Connect", "Multi-Factor Authentication", "Single Sign-On (SSO)", "Rol tabanlı erişim kontrolü"],
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    status: "active",
  },
  {
    slug: "license",
    icon: Key,
    name: "Hyble License",
    tagline: "Yazılımınızı koruyun",
    description: "Yazılım lisanslama ve aktivasyon sistemi. Ürünlerinizi koruyun, lisans anahtarları oluşturun ve yönetin.",
    features: ["Lisans anahtarı oluşturma", "Aktivasyon kontrolü", "Abonelik yönetimi", "API entegrasyonu"],
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    status: "active",
  },
  {
    slug: "wallet",
    icon: CreditCard,
    name: "Hyble Wallet",
    tagline: "Ödemeler kolaylaştı",
    description: "Entegre ödeme ve cüzdan sistemi. Bakiye yönetimi, bonus kredileri ve çoklu ödeme yöntemleri desteği.",
    features: ["Bakiye yönetimi", "Bonus & promosyon kredileri", "Stripe entegrasyonu", "Otomatik faturalama"],
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    status: "active",
  },
  {
    slug: "cloud",
    icon: Cloud,
    name: "Hyble Cloud",
    tagline: "Güçlü altyapı",
    description: "Yüksek performanslı VPS ve web hosting çözümleri. Hetzner altyapısı ile Avrupa'da düşük gecikme süresi.",
    features: ["VPS sunucular", "Web hosting", "Otomatik yedekleme", "99.9% uptime garantisi"],
    color: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    status: "coming_soon",
  },
  {
    slug: "gaming",
    icon: Gamepad2,
    name: "Hyble Gaming",
    tagline: "Oyun sunucuları",
    description: "Minecraft, FiveM, Rust ve daha fazlası için optimize edilmiş oyun sunucuları. Tek tıkla kurulum.",
    features: ["Minecraft sunucular", "FiveM sunucular", "Mod desteği", "DDoS koruması"],
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    status: "active",
  },
  {
    slug: "cdn",
    icon: Server,
    name: "Hyble CDN",
    tagline: "Hızlı içerik dağıtımı",
    description: "Global CDN ağı ile içeriklerinizi dünya genelinde hızlıca sunun. Edge caching ve optimizasyon.",
    features: ["Global PoP noktaları", "Edge caching", "SSL/TLS", "Real-time analytics"],
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    status: "coming_soon",
  },
  {
    slug: "status",
    icon: Activity,
    name: "Hyble Status",
    tagline: "Her zaman izleyin",
    description: "Uptime monitoring ve durum sayfası. Servislerinizin durumunu gerçek zamanlı takip edin.",
    features: ["Uptime monitoring", "Durum sayfası", "Uyarı bildirimleri", "SLA raporları"],
    color: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    status: "active",
  },
  {
    slug: "tools",
    icon: Wrench,
    name: "Hyble Tools",
    tagline: "Geliştirici araçları",
    description: "Ücretsiz geliştirici araçları. DNS lookup, SSL checker, port scanner ve daha fazlası.",
    features: ["DNS araçları", "SSL kontrolü", "Port tarayıcı", "Hız testi"],
    color: "from-slate-500 to-zinc-600",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    status: "active",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime garantisi" },
  { value: "10K+", label: "Aktif kullanıcı" },
  { value: "<50ms", label: "API yanıt süresi" },
  { value: "7/24", label: "Destek" },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Hyble Ekosistemi
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Tüm ihtiyaçlarınız için
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              tek platform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
            Kimlik doğrulama, ödeme sistemleri, hosting altyapısı ve geliştirici araçları -
            hepsi entegre, hepsi Hyble'da.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution) => (
              <Link
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                className="group"
              >
                <Card className={`p-6 h-full ${solution.bgColor} border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <solution.icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {solution.name}
                        </h3>
                        {solution.status === "coming_soon" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Yakında
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                        {solution.tagline}
                      </p>

                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                        {solution.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {solution.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 group-hover:translate-x-1 duration-300" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Tüm servisler birbiriyle entegre
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Hyble ID ile giriş yapın, Wallet ile ödeme alın, Cloud ile barındırın.
            Tüm servisler tek API, tek panel, tek hesap.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tek Kimlik</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Hyble ID ile tüm servislere tek hesapla erişin. SSO ile sorunsuz geçiş.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Hızlı API</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                tRPC tabanlı tip-güvenli API. TypeScript ile tam entegrasyon.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Global Altyapı</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Avrupa merkezli sunucular, düşük gecikme süresi, yüksek güvenilirlik.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Hemen başlayın
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Ücretsiz hesap oluşturun ve Hyble ekosistemini keşfedin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Ücretsiz Başla
            </a>
            <Link
              href="/contact"
              className="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

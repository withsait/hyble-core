import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ShoppingBag, Package, Cloud, Globe, Database, Shield,
  Gamepad2, Server, Layout, ShoppingCart, Rocket, Zap,
  ChevronRight, Search, Filter, Star, ArrowRight, Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ürün Mağazası | Hyble",
  description: "Hyble hosting, şablonlar, SSL sertifikaları ve daha fazlasını keşfedin. Profesyonel altyapı ile projelerinizi hayata geçirin.",
};

// Statik kategoriler
const categories = [
  {
    slug: "website-templates",
    name: "Web Sitesi Şablonları",
    description: "Kurumsal ve kişisel web siteleri",
    icon: Layout,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    count: 12,
  },
  {
    slug: "ecommerce",
    name: "E-ticaret Şablonları",
    description: "Online mağaza çözümleri",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    count: 8,
  },
  {
    slug: "landing-pages",
    name: "Landing Page",
    description: "Dönüşüm odaklı sayfalar",
    icon: Rocket,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    count: 15,
  },
  {
    slug: "vps",
    name: "VPS Sunucular",
    description: "Yüksek performanslı sanal sunucular",
    icon: Server,
    color: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    count: 6,
  },
  {
    slug: "web-hosting",
    name: "Web Hosting",
    description: "Paylaşımlı hosting paketleri",
    icon: Globe,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    count: 4,
  },
  {
    slug: "game-servers",
    name: "Oyun Sunucuları",
    description: "Minecraft, FiveM ve daha fazlası",
    icon: Gamepad2,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    count: 10,
    badge: "Popüler",
  },
  {
    slug: "ssl",
    name: "SSL Sertifikaları",
    description: "DV, OV, EV sertifikalar",
    icon: Shield,
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    count: 5,
  },
  {
    slug: "database",
    name: "Veritabanı",
    description: "Managed database çözümleri",
    icon: Database,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    count: 3,
    badge: "Yakında",
  },
];

// Örnek ürünler (API'den gelecek)
const featuredProducts = [
  {
    slug: "starter-business-website",
    name: "Business Starter",
    description: "Küçük işletmeler için profesyonel web sitesi şablonu",
    category: "website-templates",
    price: 49,
    originalPrice: 79,
    image: null,
    badge: "En Çok Satan",
    features: ["Responsive tasarım", "SEO optimizasyonu", "5 sayfa"],
  },
  {
    slug: "ecommerce-starter",
    name: "E-commerce Starter",
    description: "Hızlı başlangıç için e-ticaret şablonu",
    category: "ecommerce",
    price: 89,
    originalPrice: 129,
    image: null,
    badge: "Yeni",
    features: ["Ödeme entegrasyonu", "Ürün yönetimi", "Stok takibi"],
  },
  {
    slug: "vps-basic",
    name: "VPS Basic",
    description: "2 vCPU, 4GB RAM, 80GB SSD",
    category: "vps",
    price: 9.99,
    billingPeriod: "monthly",
    image: null,
    features: ["99.9% Uptime", "DDoS koruması", "Root erişimi"],
  },
  {
    slug: "minecraft-starter",
    name: "Minecraft Starter",
    description: "10 slot, 2GB RAM",
    category: "game-servers",
    price: 2.99,
    billingPeriod: "monthly",
    image: null,
    badge: "Popüler",
    features: ["Tek tıkla kurulum", "Mod desteği", "DDoS koruması"],
  },
  {
    slug: "saas-landing",
    name: "SaaS Landing",
    description: "SaaS ürünleri için modern landing page",
    category: "landing-pages",
    price: 39,
    originalPrice: 59,
    image: null,
    features: ["Animasyonlar", "Dark mode", "CTA optimize"],
  },
  {
    slug: "web-hosting-pro",
    name: "Web Hosting Pro",
    description: "50GB SSD, Sınırsız bandwidth",
    category: "web-hosting",
    price: 4.99,
    billingPeriod: "monthly",
    image: null,
    features: ["cPanel", "Ücretsiz SSL", "E-posta hesapları"],
  },
];

export default function StorePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <ShoppingBag className="w-4 h-4" />
            Ürün Mağazası
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            İhtiyacınız olan her şey
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              tek platformda
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Web sitesi şablonları, hosting paketleri, SSL sertifikaları ve daha fazlası.
            Projelerinizi profesyonel altyapı ile hayata geçirin.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Kategoriler
            </h2>
            <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
              <Filter className="w-4 h-4" />
              Filtrele
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/store/category/${category.slug}`}
                className="group"
              >
                <Card className={`p-5 h-full ${category.bgColor} border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    {category.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        category.badge === "Popüler"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {category.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {category.description}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {category.count} ürün
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                En popüler ve çok satan ürünlerimiz
              </p>
            </div>
            <Link
              href="/store/all"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Tümünü Gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/store/${product.slug}`}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    {product.badge && (
                      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
                        product.badge === "Popüler" || product.badge === "En Çok Satan"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {categories.find(c => c.slug === product.category)?.name}
                        </p>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Features */}
                    {product.features && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          €{product.price}
                        </span>
                        {product.billingPeriod && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            /{product.billingPeriod === "monthly" ? "ay" : "yıl"}
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            €{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/store/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Tüm Ürünleri Gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Neden Hyble?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Binlerce müşterinin tercih ettiği güvenilir altyapı
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Anında Aktivasyon", desc: "Siparişleriniz saniyeler içinde aktif" },
              { icon: Shield, title: "Güvenli Ödeme", desc: "Stripe ile güvenli işlemler" },
              { icon: Star, title: "7/24 Destek", desc: "Her zaman yanınızdayız" },
              { icon: Sparkles, title: "Para İade", desc: "30 gün koşulsuz iade" },
            ].map((item, i) => (
              <Card key={i} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Özel bir çözüm mü arıyorsunuz?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            İhtiyaçlarınıza özel yapılandırılmış çözümler için bizimle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              İletişime Geç
            </Link>
            <Link
              href="/solutions"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              Çözümlerimiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

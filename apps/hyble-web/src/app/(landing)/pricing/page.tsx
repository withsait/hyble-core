import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Check, X, HelpCircle, Zap, Shield, Star,
  Cloud, Server, Globe, Gamepad2, Layout, ShoppingCart,
  CreditCard, Key, Activity, Sparkles, ArrowRight,
  ChevronDown, Info
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlandırma | Hyble",
  description: "Hyble hosting, şablonlar ve ekosistem hizmetlerinin fiyatlandırması. Şeffaf ve uygun fiyatlarla profesyonel altyapı.",
};

// Hosting Fiyatları
const hostingPlans = {
  vps: [
    {
      name: "VPS Starter",
      price: 4.99,
      period: "ay",
      specs: { cpu: "1 vCPU", ram: "2 GB RAM", storage: "40 GB SSD", bandwidth: "2 TB" },
      features: ["Root erişimi", "99.9% Uptime", "DDoS koruması"],
      popular: false,
    },
    {
      name: "VPS Basic",
      price: 9.99,
      period: "ay",
      specs: { cpu: "2 vCPU", ram: "4 GB RAM", storage: "80 GB SSD", bandwidth: "4 TB" },
      features: ["Root erişimi", "99.9% Uptime", "DDoS koruması", "Snapshot yedekleme"],
      popular: true,
    },
    {
      name: "VPS Pro",
      price: 19.99,
      period: "ay",
      specs: { cpu: "4 vCPU", ram: "8 GB RAM", storage: "160 GB SSD", bandwidth: "8 TB" },
      features: ["Root erişimi", "99.9% Uptime", "DDoS koruması", "Günlük yedekleme", "Öncelikli destek"],
      popular: false,
    },
    {
      name: "VPS Enterprise",
      price: 49.99,
      period: "ay",
      specs: { cpu: "8 vCPU", ram: "16 GB RAM", storage: "320 GB SSD", bandwidth: "16 TB" },
      features: ["Root erişimi", "99.99% Uptime", "DDoS koruması", "Saatlik yedekleme", "Dedicated destek"],
      popular: false,
    },
  ],
  webHosting: [
    {
      name: "Starter",
      price: 1.99,
      period: "ay",
      specs: { storage: "10 GB SSD", bandwidth: "Sınırsız", domains: "1 Domain", emails: "5 E-posta" },
      features: ["cPanel", "Ücretsiz SSL", "1-Tık WordPress"],
      popular: false,
    },
    {
      name: "Basic",
      price: 3.99,
      period: "ay",
      specs: { storage: "30 GB SSD", bandwidth: "Sınırsız", domains: "3 Domain", emails: "Sınırsız" },
      features: ["cPanel", "Ücretsiz SSL", "1-Tık Kurulum", "Günlük yedekleme"],
      popular: true,
    },
    {
      name: "Pro",
      price: 7.99,
      period: "ay",
      specs: { storage: "100 GB SSD", bandwidth: "Sınırsız", domains: "Sınırsız", emails: "Sınırsız" },
      features: ["cPanel", "Ücretsiz SSL", "Staging ortamı", "Öncelikli destek"],
      popular: false,
    },
  ],
  gameServers: [
    {
      name: "Minecraft Starter",
      price: 2.99,
      period: "ay",
      specs: { ram: "2 GB RAM", slots: "10 Slot", storage: "10 GB SSD" },
      features: ["Tek tıkla kurulum", "Mod desteği", "DDoS koruması"],
      popular: false,
    },
    {
      name: "Minecraft Basic",
      price: 5.99,
      period: "ay",
      specs: { ram: "4 GB RAM", slots: "25 Slot", storage: "20 GB SSD" },
      features: ["Tek tıkla kurulum", "Plugin manager", "DDoS koruması", "Yedekleme"],
      popular: true,
    },
    {
      name: "Minecraft Pro",
      price: 11.99,
      period: "ay",
      specs: { ram: "8 GB RAM", slots: "50 Slot", storage: "50 GB SSD" },
      features: ["Tek tıkla kurulum", "Modpack desteği", "DDoS Pro", "Öncelikli destek"],
      popular: false,
    },
    {
      name: "FiveM Starter",
      price: 9.99,
      period: "ay",
      specs: { ram: "4 GB RAM", slots: "32 Slot", storage: "30 GB SSD" },
      features: ["txAdmin dahil", "Script desteği", "DDoS koruması"],
      popular: false,
    },
  ],
};

// Ekosistem Hizmetleri
const ecosystemServices = [
  {
    name: "Hyble ID",
    description: "OAuth 2.0, MFA, SSO ile kimlik yönetimi",
    icon: Shield,
    tiers: [
      { name: "Free", price: 0, users: "1.000 kullanıcı", requests: "10K istek/ay" },
      { name: "Pro", price: 29, users: "10.000 kullanıcı", requests: "100K istek/ay" },
      { name: "Enterprise", price: "Özel", users: "Sınırsız", requests: "Sınırsız" },
    ],
  },
  {
    name: "Hyble Wallet",
    description: "Ödeme ve cüzdan entegrasyonu",
    icon: CreditCard,
    tiers: [
      { name: "Free", price: 0, commission: "3% komisyon", features: "Temel özellikler" },
      { name: "Pro", price: 49, commission: "1.5% komisyon", features: "Gelişmiş analitik" },
      { name: "Enterprise", price: "Özel", commission: "Özel oran", features: "Tam özelleştirme" },
    ],
  },
  {
    name: "Hyble License",
    description: "Yazılım lisanslama ve aktivasyon",
    icon: Key,
    tiers: [
      { name: "Free", price: 0, licenses: "100 lisans", validations: "1K doğrulama/ay" },
      { name: "Pro", price: 19, licenses: "1.000 lisans", validations: "10K doğrulama/ay" },
      { name: "Enterprise", price: "Özel", licenses: "Sınırsız", validations: "Sınırsız" },
    ],
  },
  {
    name: "Hyble Status",
    description: "Uptime monitoring ve durum sayfası",
    icon: Activity,
    tiers: [
      { name: "Free", price: 0, monitors: "5 monitör", checks: "5 dk aralık" },
      { name: "Pro", price: 9, monitors: "50 monitör", checks: "1 dk aralık" },
      { name: "Enterprise", price: "Özel", monitors: "Sınırsız", checks: "10 sn aralık" },
    ],
  },
];

// Şablon Fiyatları
const templatePricing = [
  { category: "Web Sitesi Şablonları", priceRange: "€29 - €99", count: 12 },
  { category: "E-ticaret Şablonları", priceRange: "€49 - €149", count: 8 },
  { category: "Landing Page", priceRange: "€19 - €59", count: 15 },
  { category: "SaaS Şablonları", priceRange: "€39 - €129", count: 6 },
];

// FAQ
const faqs = [
  {
    q: "Ödeme yöntemleri nelerdir?",
    a: "Kredi kartı, banka kartı ve Hyble Wallet ile ödeme yapabilirsiniz. Kurumsal müşteriler için fatura ile ödeme seçeneği mevcuttur.",
  },
  {
    q: "İptal ve iade politikası nasıl?",
    a: "Hosting hizmetlerinde 30 gün içinde koşulsuz para iade garantisi sunuyoruz. Şablonlarda ise indirme öncesi önizleme imkanı sağlıyoruz.",
  },
  {
    q: "Yıllık ödeme indirimi var mı?",
    a: "Evet, yıllık ödemelerde 2 ay ücretsiz (yaklaşık %17 indirim) sunuyoruz. Ayrıca uzun dönem taahhütlerde ek indirimler mevcuttur.",
  },
  {
    q: "Ücretsiz deneme süresi var mı?",
    a: "VPS ve oyun sunucularında 7 gün ücretsiz deneme, ekosistem hizmetlerinde ise ücretsiz tier ile başlayabilirsiniz.",
  },
  {
    q: "Planlar arası geçiş yapabilir miyim?",
    a: "Evet, dilediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Fark kalan süreye göre hesaplanır.",
  },
  {
    q: "Kurumsal fiyatlandırma nasıl belirleniyor?",
    a: "Kurumsal müşterilerimiz için özel fiyatlandırma, SLA ve destek seçenekleri sunuyoruz. Detaylı bilgi için satış ekibimizle iletişime geçin.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Yıllık ödemede 2 ay ücretsiz
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Şeffaf ve uygun
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              fiyatlandırma
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
            Gizli ücret yok, sürpriz fatura yok. İhtiyacınız olan hizmetler için sadece kullandığınız kadar ödeyin.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { value: "€1.99", label: "Hosting başlangıç" },
              { value: "€2.99", label: "Oyun sunucuları" },
              { value: "€0", label: "Ekosistem başlangıç" },
              { value: "30 gün", label: "Para iade garantisi" },
            ].map((stat) => (
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

      {/* VPS Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="vps">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">VPS Sunucular</h2>
              <p className="text-slate-600 dark:text-slate-400">Yüksek performanslı sanal sunucular</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hostingPlans.vps.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${plan.popular ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Popüler
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.cpu}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.ram}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.storage}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.bandwidth} transfer</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/store/category/vps"
                  className={`block w-full py-2.5 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                  }`}
                >
                  Seç
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Web Hosting Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="web-hosting">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Web Hosting</h2>
              <p className="text-slate-600 dark:text-slate-400">Paylaşımlı hosting paketleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hostingPlans.webHosting.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${plan.popular ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Popüler
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.storage}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.bandwidth} bandwidth</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.domains}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.emails}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/store/category/web-hosting"
                  className={`block w-full py-2.5 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                  }`}
                >
                  Seç
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Servers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="game-servers">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Oyun Sunucuları</h2>
              <p className="text-slate-600 dark:text-slate-400">Minecraft, FiveM ve daha fazlası</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hostingPlans.gameServers.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${plan.popular ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Popüler
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.ram}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.slots}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{plan.specs.storage}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/store/category/game-servers"
                  className={`block w-full py-2.5 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                  }`}
                >
                  Seç
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="ecosystem">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ekosistem Hizmetleri</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Kimlik, ödeme, lisanslama ve izleme çözümleri. Ücretsiz tier ile başlayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecosystemServices.map((service) => (
              <Card key={service.name} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {service.tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`p-3 rounded-lg ${
                        tier.name === "Pro"
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-50 dark:bg-slate-700/50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{tier.name}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {typeof tier.price === "number" ? (tier.price === 0 ? "Ücretsiz" : `€${tier.price}`) : tier.price}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {"users" in tier && tier.users}
                        {"licenses" in tier && tier.licenses}
                        {"monitors" in tier && tier.monitors}
                        {"commission" in tier && tier.commission}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
            >
              Tüm ekosistem hizmetlerini keşfet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Templates Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="templates">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Layout className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hazır Şablonlar</h2>
              <p className="text-slate-600 dark:text-slate-400">Tek seferlik ödeme, ömür boyu erişim</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templatePricing.map((category) => (
              <Card key={category.category} className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{category.category}</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{category.priceRange}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{category.count} şablon mevcut</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Mağazayı Keşfet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sık Sorulan Sorular</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Fiyatlandırma hakkında merak ettikleriniz
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Özel ihtiyaçlarınız mı var?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Kurumsal fiyatlandırma, özel yapılandırma ve toplu indirimler için satış ekibimizle görüşün.
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
              Satışla Görüşün
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

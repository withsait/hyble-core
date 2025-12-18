import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Check, HelpCircle, Server, Globe, Gamepad2, Layout,
  CreditCard, Key, Activity, ArrowRight, Shield,
  Cpu, HardDrive, Users, Zap, RefreshCw, Headphones
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlandırma | Hyble",
  description: "Hyble hosting, şablonlar ve ekosistem hizmetlerinin fiyatlandırması. Şeffaf ve uygun fiyatlarla profesyonel altyapı.",
};

// VPS Planları - Özelleştirilebilir yapıya yönlendirme
const vpsHighlights = [
  { spec: "1-16 vCPU", desc: "İşlemci" },
  { spec: "1-32 GB", desc: "RAM" },
  { spec: "20-640 GB", desc: "NVMe SSD" },
  { spec: "4 Lokasyon", desc: "Almanya, Finlandiya, ABD, Singapur" },
];

// Web Hosting Planları
const webHostingPlans = [
  {
    name: "Starter",
    price: 1.99,
    specs: ["10 GB SSD", "1 Domain", "5 E-posta", "Ücretsiz SSL"],
  },
  {
    name: "Basic",
    price: 3.99,
    specs: ["30 GB SSD", "3 Domain", "Sınırsız E-posta", "Günlük Yedekleme"],
    popular: true,
  },
  {
    name: "Pro",
    price: 7.99,
    specs: ["100 GB SSD", "Sınırsız Domain", "Staging Ortamı", "Öncelikli Destek"],
  },
];

// Oyun Sunucuları
const gameHighlights = [
  { game: "Minecraft", price: "€2.99" },
  { game: "FiveM", price: "€9.99" },
  { game: "Rust", price: "€14.99" },
  { game: "CS2", price: "€4.99" },
  { game: "ARK", price: "€12.99" },
  { game: "Valheim", price: "€6.99" },
];

// Ekosistem Hizmetleri - Minimal
const ecosystemServices = [
  {
    name: "Hyble ID",
    desc: "Kimlik yönetimi",
    icon: Shield,
    free: "1K kullanıcı",
    pro: "€29/ay - 10K kullanıcı",
  },
  {
    name: "Hyble Wallet",
    desc: "Ödeme sistemi",
    icon: CreditCard,
    free: "3% komisyon",
    pro: "€49/ay - 1.5% komisyon",
  },
  {
    name: "Hyble License",
    desc: "Lisanslama",
    icon: Key,
    free: "100 lisans",
    pro: "€19/ay - 1K lisans",
  },
  {
    name: "Hyble Status",
    desc: "Monitoring",
    icon: Activity,
    free: "5 monitör",
    pro: "€9/ay - 50 monitör",
  },
];

// Şablon kategorileri
const templateCategories = [
  { name: "Web Sitesi", range: "€29 - €99", count: 12 },
  { name: "E-ticaret", range: "€49 - €149", count: 8 },
  { name: "Landing Page", range: "€19 - €59", count: 15 },
  { name: "SaaS", range: "€39 - €129", count: 6 },
];

// FAQ
const faqs = [
  {
    q: "Ödeme yöntemleri nelerdir?",
    a: "Kredi kartı, banka kartı ve Hyble Wallet ile ödeme yapabilirsiniz.",
  },
  {
    q: "Para iade garantisi var mı?",
    a: "Hosting hizmetlerinde 30 gün içinde koşulsuz para iade garantisi.",
  },
  {
    q: "Yıllık ödeme indirimi var mı?",
    a: "Yıllık ödemelerde 2 ay ücretsiz (yaklaşık %17 indirim).",
  },
  {
    q: "Ücretsiz deneme var mı?",
    a: "VPS'te 7 gün deneme, ekosistem hizmetlerinde ücretsiz tier mevcut.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero - Minimal */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Şeffaf Fiyatlandırma
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Gizli ücret yok. Kullandığınız kadar ödeyin.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { value: "€1.99", label: "Hosting" },
              { value: "€2.99", label: "Oyun Sunucusu" },
              { value: "€0", label: "Ekosistem" },
              { value: "30 gün", label: "İade Garantisi" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VPS - Configurator CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" id="vps">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 md:p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Server className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">VPS Sunucular</h2>
                    <p className="text-sm text-slate-500">€4.99'dan başlayan fiyatlarla</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {vpsHighlights.map((item) => (
                    <div key={item.desc}>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.spec}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/store"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                >
                  Yapılandır
                </Link>
                <p className="text-xs text-slate-500 text-center">Özel konfigürasyon</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Web Hosting */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="hosting">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Web Hosting</h2>
              <p className="text-sm text-slate-500">Paylaşımlı hosting paketleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {webHostingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-5 border ${plan.popular ? "border-blue-500 dark:border-blue-400" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                      Popüler
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-sm text-slate-500">/ay</span>
                </div>
                <ul className="space-y-2">
                  {plan.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-slate-400" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Servers - Configurator CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" id="games">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 md:p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Oyun Sunucuları</h2>
                    <p className="text-sm text-slate-500">€2.99'dan başlayan fiyatlarla</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {gameHighlights.map((item) => (
                    <div key={item.game} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.game}</p>
                      <p className="text-xs text-slate-500">{item.price}/ay</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/store"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                >
                  Yapılandır
                </Link>
                <p className="text-xs text-slate-500 text-center">Oyun + RAM + Slot seç</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Ecosystem Services */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="ecosystem">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ekosistem Hizmetleri</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Ücretsiz tier ile başlayın</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecosystemServices.map((service) => (
              <Card key={service.name} className="p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <service.icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">{service.name}</h3>
                    <p className="text-xs text-slate-500">{service.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Free</span>
                    <span className="text-slate-700 dark:text-slate-300">{service.free}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pro</span>
                    <span className="text-slate-700 dark:text-slate-300">{service.pro}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/solutions"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Detaylı bilgi →
            </Link>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" id="templates">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Layout className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Hazır Şablonlar</h2>
              <p className="text-sm text-slate-500">Tek seferlik ödeme</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templateCategories.map((cat) => (
              <Card key={cat.name} className="p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{cat.name}</h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{cat.range}</p>
                <p className="text-xs text-slate-500">{cat.count} şablon</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/store"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Mağazaya git →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, text: "Anında aktivasyon" },
              { icon: Shield, text: "DDoS koruması" },
              { icon: RefreshCw, text: "Günlük yedekleme" },
              { icon: Headphones, text: "7/24 destek" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <item.icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Compact */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-6">SSS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{faq.q}</h3>
                <p className="text-xs text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Minimal */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Kurumsal ihtiyaçlarınız mı var?</h2>
          <p className="text-slate-400 mb-6">Özel fiyatlandırma ve SLA için iletişime geçin.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Ücretsiz Başla
            </a>
            <Link
              href="/contact"
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Satışla Görüşün
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

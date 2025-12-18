import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Check, Server, Globe, Layout, Database,
  CreditCard, Key, Activity, Shield, Cloud,
  Cpu, HardDrive, Zap, RefreshCw, Headphones,
  Building2, Layers, ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlandırma | Hyble",
  description: "Hyble Cloud hosting, şablonlar ve ekosistem hizmetlerinin fiyatlandırması. Şeffaf ve uygun fiyatlarla profesyonel altyapı.",
};

// Cloud VPS Planları
const cloudVpsPlans = [
  {
    name: "Cloud Starter",
    price: 4.99,
    specs: [
      { label: "vCPU", value: "1 Core" },
      { label: "RAM", value: "2 GB" },
      { label: "Depolama", value: "40 GB NVMe" },
      { label: "Trafik", value: "2 TB" },
    ],
    features: ["IPv4 + IPv6", "DDoS Koruması", "Günlük Yedekleme"],
  },
  {
    name: "Cloud Pro",
    price: 9.99,
    popular: true,
    specs: [
      { label: "vCPU", value: "2 Core" },
      { label: "RAM", value: "4 GB" },
      { label: "Depolama", value: "80 GB NVMe" },
      { label: "Trafik", value: "4 TB" },
    ],
    features: ["IPv4 + IPv6", "DDoS Koruması", "Günlük Yedekleme", "Snapshot"],
  },
  {
    name: "Cloud Business",
    price: 19.99,
    specs: [
      { label: "vCPU", value: "4 Core" },
      { label: "RAM", value: "8 GB" },
      { label: "Depolama", value: "160 GB NVMe" },
      { label: "Trafik", value: "8 TB" },
    ],
    features: ["IPv4 + IPv6", "DDoS Koruması", "Günlük Yedekleme", "Snapshot", "Öncelikli Destek"],
  },
  {
    name: "Cloud Enterprise",
    price: 39.99,
    specs: [
      { label: "vCPU", value: "8 Core" },
      { label: "RAM", value: "16 GB" },
      { label: "Depolama", value: "320 GB NVMe" },
      { label: "Trafik", value: "16 TB" },
    ],
    features: ["IPv4 + IPv6", "DDoS Koruması", "Günlük Yedekleme", "Snapshot", "7/24 Öncelikli Destek", "SLA Garantisi"],
  },
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

// Managed Database
const databasePlans = [
  { name: "PostgreSQL", from: "€9.99", desc: "ACID uyumlu, güçlü sorgulama" },
  { name: "MySQL", from: "€7.99", desc: "Yaygın kullanım, kolay yönetim" },
  { name: "Redis", from: "€4.99", desc: "In-memory cache & sessions" },
  { name: "MongoDB", from: "€11.99", desc: "NoSQL, esnek şema" },
];

// Ekosistem Hizmetleri
const ecosystemServices = [
  {
    name: "Hyble ID",
    desc: "Merkezi kimlik doğrulama ve kullanıcı yönetimi",
    icon: Shield,
    tiers: [
      { name: "Free", price: "€0", features: ["1.000 MAU", "OAuth 2.0", "Temel SSO"] },
      { name: "Pro", price: "€29/ay", features: ["10.000 MAU", "SAML", "MFA", "Özel Domain"] },
      { name: "Enterprise", price: "Özel", features: ["Sınırsız MAU", "SLA", "Dedicated Support"] },
    ],
  },
  {
    name: "Hyble Wallet",
    desc: "Entegre ödeme ve cüzdan altyapısı",
    icon: CreditCard,
    tiers: [
      { name: "Free", price: "3%", features: ["Temel ödemeler", "EUR desteği", "Dashboard"] },
      { name: "Pro", price: "€49/ay + 1.5%", features: ["Düşük komisyon", "Multi-currency", "API erişimi"] },
      { name: "Enterprise", price: "Özel", features: ["Özel komisyon", "White-label", "SLA"] },
    ],
  },
  {
    name: "Hyble License",
    desc: "Yazılım lisans yönetimi ve aktivasyon",
    icon: Key,
    tiers: [
      { name: "Free", price: "€0", features: ["100 lisans", "Temel validasyon", "Dashboard"] },
      { name: "Pro", price: "€19/ay", features: ["1.000 lisans", "Offline aktivasyon", "Analytics"] },
      { name: "Enterprise", price: "Özel", features: ["Sınırsız lisans", "Hardware binding", "API"] },
    ],
  },
  {
    name: "Hyble Status",
    desc: "Uptime monitoring ve durum sayfası",
    icon: Activity,
    tiers: [
      { name: "Free", price: "€0", features: ["5 monitör", "5 dakika aralık", "E-posta bildirimi"] },
      { name: "Pro", price: "€9/ay", features: ["50 monitör", "1 dakika aralık", "SMS + Slack"] },
      { name: "Enterprise", price: "Özel", features: ["Sınırsız", "30 sn aralık", "Özel entegrasyon"] },
    ],
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
    a: "Cloud ve hosting hizmetlerinde 30 gün içinde koşulsuz para iade garantisi.",
  },
  {
    q: "Yıllık ödeme indirimi var mı?",
    a: "Yıllık ödemelerde 2 ay ücretsiz (yaklaşık %17 indirim).",
  },
  {
    q: "Ücretsiz deneme var mı?",
    a: "Cloud VPS'te 7 gün deneme, ekosistem hizmetlerinde ücretsiz tier mevcut.",
  },
  {
    q: "Özel konfigürasyon yapabilir miyim?",
    a: "Evet, Cloud VPS'lerde CPU, RAM ve disk özel olarak yapılandırılabilir.",
  },
  {
    q: "Oyun sunucusu arıyorum?",
    a: "Oyun sunucuları için game.hyble.co adresini ziyaret edebilirsiniz.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 mb-6">
            <Cloud className="w-4 h-4" />
            Cloud & Ecosystem Pricing
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Şeffaf Fiyatlandırma
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Gizli ücret yok. İhtiyacınıza göre ölçeklendirin. Tüm ekosistem hizmetlerinde ücretsiz tier.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: "€1.99", label: "Web Hosting", sub: "/aydan" },
              { value: "€4.99", label: "Cloud VPS", sub: "/aydan" },
              { value: "€0", label: "Ekosistem", sub: "Free tier" },
              { value: "30 gün", label: "İade Garantisi", sub: "Koşulsuz" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud VPS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="cloud">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Server className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cloud VPS</h2>
                <p className="text-sm text-slate-500">Yüksek performanslı sanal sunucular</p>
              </div>
            </div>
            <Link
              href="/cloud"
              className="hidden md:flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Tüm seçenekler <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cloudVpsPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 border ${plan.popular ? "border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/20" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      Popüler
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-sm text-slate-500">/ay</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{spec.label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Daha fazla kaynak mı gerekiyor? Özel konfigürasyon için iletişime geçin.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Building2 className="w-4 h-4" />
              Enterprise çözümler
            </Link>
          </div>
        </div>
      </section>

      {/* Web Hosting */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="hosting">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Globe className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Web Hosting</h2>
              <p className="text-sm text-slate-500">Paylaşımlı hosting paketleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webHostingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 border ${plan.popular ? "border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/20" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      Popüler
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">€{plan.price}</span>
                  <span className="text-sm text-slate-500">/ay</span>
                </div>
                <ul className="space-y-3">
                  {plan.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Managed Database */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="database">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Database className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Managed Database</h2>
              <p className="text-sm text-slate-500">Yönetilen veritabanı hizmetleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {databasePlans.map((db) => (
              <Card key={db.name} className="p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{db.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{db.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{db.from}</span>
                  <span className="text-sm text-slate-500">/aydan</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" id="ecosystem">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 mb-4">
              <Layers className="w-4 h-4" />
              Ekosistem Hizmetleri
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Özel Çözümler</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Her hizmette ücretsiz tier ile başlayın, ihtiyaçlarınıza göre ölçeklendirin
            </p>
          </div>

          <div className="space-y-8">
            {ecosystemServices.map((service) => (
              <Card key={service.name} className="p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-slate-500">{service.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.tiers.map((tier, i) => (
                    <div
                      key={tier.name}
                      className={`p-4 rounded-lg ${
                        i === 1
                          ? "bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
                          : "bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-900 dark:text-white">{tier.name}</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{tier.price}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Tüm çözümleri incele <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="templates">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Layout className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hazır Şablonlar</h2>
                <p className="text-sm text-slate-500">Tek seferlik ödeme, ömür boyu kullanım</p>
              </div>
            </div>
            <Link
              href="/store"
              className="hidden md:flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Mağazaya git <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {templateCategories.map((cat) => (
              <Card key={cat.name} className="p-6 border border-slate-200 dark:border-slate-700 text-center">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{cat.name}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{cat.range}</p>
                <p className="text-sm text-slate-500">{cat.count} şablon</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, text: "Anında Aktivasyon", sub: "Otomatik kurulum" },
              { icon: Shield, text: "DDoS Koruması", sub: "Tüm planlarda dahil" },
              { icon: RefreshCw, text: "Günlük Yedekleme", sub: "7 gün saklama" },
              { icon: Headphones, text: "7/24 Destek", sub: "Türkçe destek" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.text}</p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Kurumsal ihtiyaçlarınız mı var?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Özel fiyatlandırma, SLA garantisi ve dedicated kaynaklar için satış ekibimizle görüşün.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Ücretsiz Başla
            </a>
            <Link
              href="/contact"
              className="px-8 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Satışla Görüşün
            </Link>
          </div>

          {/* Game Server Note */}
          <p className="mt-8 text-sm text-slate-500">
            Oyun sunucusu mu arıyorsunuz?{" "}
            <a href="https://game.hyble.co" className="text-slate-400 hover:text-white underline">
              game.hyble.co
            </a>
            {" "}adresini ziyaret edin.
          </p>
        </div>
      </section>
    </div>
  );
}

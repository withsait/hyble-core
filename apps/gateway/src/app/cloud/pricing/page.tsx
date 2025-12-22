import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Check, Server, Globe, Database, Shield, Cloud,
  Zap, RefreshCw, Headphones, Building2, ArrowLeft
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud Fiyatlandırma | Hyble",
  description: "Hyble Cloud VPS, Web Hosting ve Managed Database fiyatlandırması. Şeffaf fiyatlar, gizli ücret yok.",
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
    a: "Cloud VPS'te 7 gün deneme mevcut, kredi kartı gerekmez.",
  },
  {
    q: "Özel konfigürasyon yapabilir miyim?",
    a: "Evet, Cloud VPS'lerde CPU, RAM ve disk özel olarak yapılandırılabilir.",
  },
  {
    q: "Oyun sunucusu arıyorum?",
    a: "Oyun sunucuları için gaming.hyble.co adresini ziyaret edebilirsiniz.",
  },
];

export default function CloudPricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/cloud"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Cloud
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-6">
            <Cloud className="w-4 h-4" />
            Cloud Fiyatlandırma
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Şeffaf Fiyatlandırma
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Gizli ücret yok. Kullandığınız kadar ödeyin. 30 gün para iade garantisi.
          </p>
        </div>
      </section>

      {/* Cloud VPS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="vps">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cloud VPS</h2>
              <p className="text-sm text-slate-500">Yüksek performanslı sanal sunucular</p>
            </div>
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
      <section className="py-12 px-4 sm:px-6 lg:px-8" id="hosting">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
                className={`p-6 border ${plan.popular ? "border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/20" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50" id="database">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            7 gün ücretsiz deneme ile Cloud VPS'i test edin.
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

          <p className="mt-8 text-sm text-slate-500">
            Oyun sunucusu mu arıyorsunuz?{" "}
            <a href="https://gaming.hyble.co" className="text-slate-400 hover:text-white underline">
              gaming.hyble.co
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

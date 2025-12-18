import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Server, Globe, Database, Shield, Zap, RefreshCw,
  Headphones, ArrowRight, Check, Cloud, MapPin,
  Cpu, HardDrive, Network, Lock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud Hosting | Hyble",
  description: "Hyble Cloud ile yüksek performanslı VPS sunucular, web hosting ve managed database hizmetleri. Hetzner altyapısı, DDoS koruması ve 7/24 destek.",
};

const cloudFeatures = [
  {
    icon: Cpu,
    title: "Yüksek Performans",
    description: "AMD EPYC işlemciler ve NVMe SSD depolama ile maksimum hız",
  },
  {
    icon: Shield,
    title: "DDoS Koruması",
    description: "Tüm sunucularda dahil, ek ücret yok",
  },
  {
    icon: RefreshCw,
    title: "Günlük Yedekleme",
    description: "Otomatik yedekleme ve tek tıkla geri yükleme",
  },
  {
    icon: Network,
    title: "Yüksek Bant Genişliği",
    description: "1 Gbps bağlantı, adil kullanım politikası",
  },
  {
    icon: MapPin,
    title: "4 Lokasyon",
    description: "Almanya, Finlandiya, ABD ve Singapur",
  },
  {
    icon: Lock,
    title: "Tam Kontrol",
    description: "Root erişimi, SSH ve tam yönetim yetkisi",
  },
];

const services = [
  {
    icon: Server,
    name: "Cloud VPS",
    description: "Yüksek performanslı sanal sunucular",
    price: "€4.99",
    features: ["1-16 vCPU", "2-32 GB RAM", "40-640 GB NVMe", "DDoS Koruması"],
    href: "/cloud/pricing#vps",
    color: "blue",
  },
  {
    icon: Globe,
    name: "Web Hosting",
    description: "Paylaşımlı hosting paketleri",
    price: "€1.99",
    features: ["10-100 GB SSD", "Sınırsız E-posta", "Ücretsiz SSL", "cPanel"],
    href: "/cloud/pricing#hosting",
    color: "emerald",
  },
  {
    icon: Database,
    name: "Managed Database",
    description: "Yönetilen veritabanı hizmetleri",
    price: "€4.99",
    features: ["PostgreSQL, MySQL, Redis", "Otomatik Yedekleme", "Scaling", "Monitoring"],
    href: "/cloud/pricing#database",
    color: "amber",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<20ms", label: "Network Latency" },
  { value: "4", label: "Veri Merkezi" },
  { value: "7/24", label: "Türkçe Destek" },
];

export default function CloudPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-6">
              <Cloud className="w-4 h-4" />
              Hyble Cloud
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Güçlü Cloud Altyapısı
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Hetzner veri merkezleri üzerinde yüksek performanslı VPS, web hosting ve managed database hizmetleri.
              Şeffaf fiyatlandırma, DDoS koruması ve 7/24 Türkçe destek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cloud/pricing"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Fiyatları İncele
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Satışla Görüşün
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Cloud Hizmetlerimiz
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              İhtiyacınıza göre en uygun hosting çözümünü seçin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.name}
                className="p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  service.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : service.color === "emerald"
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  <service.icon className={`w-7 h-7 ${
                    service.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : service.color === "emerald"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-slate-500 mb-4">{service.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {service.price}
                  </span>
                  <span className="text-slate-500">/aydan</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-slate-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.href}
                  className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-500/50"
                >
                  Planları Gör
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Neden Hyble Cloud?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Kurumsal düzeyde altyapı, startup-dostu fiyatlandırma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cloudFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            7 gün ücretsiz deneme ile Cloud VPS'i test edin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cloud/pricing"
              className="px-8 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Fiyatları İncele
            </Link>
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ücretsiz Dene
            </a>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Oyun sunucusu mu arıyorsunuz?{" "}
            <a href="https://game.hyble.co" className="text-slate-400 hover:text-white underline">
              game.hyble.co
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

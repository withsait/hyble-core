import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Globe, Palette, Code, Wrench, ArrowRight, Check,
  Sparkles, Layout, Zap, Shield, Clock, Users
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hyble Digital - Corporate Solutions",
  description: "Kurumsal web siteleri, temalar, araclar ve ozel siparisler. Isletmeniz icin profesyonel dijital cozumler.",
};

const services = [
  {
    name: "Web Sablonlari",
    description: "Hazir kullanima uygun temalar",
    href: "/templates",
    icon: Layout,
    features: ["Responsive Tasarim", "SEO Optimize", "Kolay Ozellestirme"],
  },
  {
    name: "Cozumler",
    description: "Entegre ekosistem servisleri",
    href: "/solutions",
    icon: Globe,
    features: ["Hyble ID", "Hyble Wallet", "Hyble Cloud"],
  },
  {
    name: "Demo",
    description: "Canli onizlemeler",
    href: "/demo",
    icon: Sparkles,
    features: ["Interaktif Demo", "Gercek Zamanli", "Test Ortami"],
  },
];

const features = [
  {
    icon: Zap,
    title: "Hizli Kurulum",
    description: "Dakikalar icinde online olun. Tek tikla deploy.",
  },
  {
    icon: Shield,
    title: "Guvenli Altyapi",
    description: "SSL, DDoS korumasi ve gunluk yedekleme dahil.",
  },
  {
    icon: Code,
    title: "Modern Teknoloji",
    description: "Next.js, React, TypeScript ile gelistirildi.",
  },
  {
    icon: Clock,
    title: "7/24 Destek",
    description: "Turkce destek ekibi her zaman yaninda.",
  },
  {
    icon: Palette,
    title: "Ozellestirilebilir",
    description: "Markaniza uygun renk ve tasarim secenekleri.",
  },
  {
    icon: Users,
    title: "Coklu Kullanici",
    description: "Ekip yonetimi ve rol tabanli erisim kontrolu.",
  },
];

const stats = [
  { value: "500+", label: "Aktif Site" },
  { value: "99.9%", label: "Uptime" },
  { value: "<1s", label: "Yukleme Suresi" },
  { value: "7/24", label: "Destek" },
];

export default function DigitalHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300 mb-8">
            <Globe className="w-4 h-4" />
            Hyble Digital
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Kurumsal Dijital
            <span className="block text-blue-600 dark:text-blue-400">Cozumler</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Web siteleri, sablonlar, araclar ve ozel projeler.
            Isletmenizi dijital dunyada one cikarin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Hemen Basla
            </a>
            <Link
              href="/templates"
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
            >
              Sablonlari Incele
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Hizmetlerimiz</h2>
            <p className="text-slate-600 dark:text-slate-400">Isletmeniz icin ihtiyaciniz olan her sey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.name} href={service.href} className="group">
                <Card className="p-6 h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {service.description}
                  </p>

                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Check className="w-4 h-4 text-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    Incele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Neden Hyble Digital?</h2>
            <p className="text-slate-600 dark:text-slate-400">Isletmeler icin tasarlanmis profesyonel cozumler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-blue-600 to-blue-700 text-white">
            <Globe className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              Dijital Donusumunuzu Baslatın
            </h2>
            <p className="opacity-90 mb-8 max-w-xl mx-auto">
              Ucretsiz hesap olusturun, sablonlari inceleyin ve isletmenizi dijitallestirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://id.hyble.co/auth/register"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Ucretsiz Baslayın
              </a>
              <Link
                href="/solutions"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
              >
                Cozumleri Kesfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 px-4 text-center border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500">
          Oyun sunuculari ve gaming cozumleri icin{" "}
          <a href="https://studios.hyble.co" className="text-blue-600 dark:text-blue-400 hover:underline">
            studios.hyble.co
          </a>
          {" "}adresini ziyaret edin.
        </p>
      </section>
    </div>
  );
}

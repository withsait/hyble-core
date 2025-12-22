"use client";

import Link from "next/link";
import {
  Globe,
  Server,
  Shield,
  Zap,
  Clock,
  Headphones,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
  Database,
  Mail,
  HardDrive,
} from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Server,
    title: "Web Hosting",
    description: "SSD depolama, otomatik yedekleme ve %99.9 uptime garantisi.",
    price: "£4.99/ay",
  },
  {
    icon: Globe,
    title: "Domain Kayıt",
    description: "Yüzlerce TLD seçeneği ve ücretsiz WHOIS gizliliği.",
    price: "£9.99/yıl",
  },
  {
    icon: Shield,
    title: "SSL Sertifikaları",
    description: "Ücretsiz Let's Encrypt veya premium SSL seçenekleri.",
    price: "Ücretsiz - £99/yıl",
  },
  {
    icon: Mail,
    title: "Kurumsal E-posta",
    description: "Profesyonel e-posta çözümleri, spam koruması dahil.",
    price: "£2.99/ay",
  },
  {
    icon: Database,
    title: "Managed Database",
    description: "PostgreSQL, MySQL, Redis için yönetilen veritabanı.",
    price: "£9.99/ay",
  },
  {
    icon: HardDrive,
    title: "Cloud VPS",
    description: "Yüksek performanslı sanal sunucu çözümleri.",
    price: "£14.99/ay",
  },
];

const features = [
  {
    icon: Zap,
    title: "Hızlı Altyapı",
    description: "SSD tabanlı sunucular ve global CDN ile maksimum hız.",
  },
  {
    icon: Shield,
    title: "Güvenlik",
    description: "DDoS koruması, firewall ve otomatik yedekleme.",
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "SLA garantili kesintisiz hizmet.",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Uzman teknik ekibimiz her zaman yanınızda.",
  },
];

const trustItems = [
  { icon: Shield, label: "256-bit SSL", sublabel: "Tüm verileriniz şifreli" },
  { icon: Building2, label: "UK Kayıtlı Şirket", sublabel: "Companies House #15872841" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Avrupa veri koruma standartları" },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "7/24", label: "Destek" },
  { value: "EU", label: "Sunucu" },
];

export default function DigitalHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cross-sell Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
          <Server className="w-4 h-4 text-white" />
          <span className="text-white">
            <strong>Oyun sunucusu mu arıyorsunuz?</strong> Hyble Studios'a göz atın
          </span>
          <Link
            href="https://studios.hyble.co"
            className="flex items-center gap-1 text-white font-medium hover:underline"
          >
            Studios'a Git
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Hyble<span className="text-amber-600">Digital</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-slate-600 hover:text-amber-600 transition font-medium">
              Servisler
            </Link>
            <Link href="#features" className="text-slate-600 hover:text-amber-600 transition font-medium">
              Özellikler
            </Link>
            <Link href="https://hyble.co" className="text-slate-600 hover:text-amber-600 transition font-medium">
              Hyble.co
            </Link>
            <Link href="https://id.hyble.co/auth/login" className="text-slate-600 hover:text-amber-600 transition font-medium">
              Giriş Yap
            </Link>
          </nav>

          <Link
            href="https://id.hyble.co/auth/register?redirect=digital"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            Başla
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-4 min-h-screen flex items-center overflow-hidden">
        {/* Premium Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50/50">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(245, 158, 11, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(245, 158, 11, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/50 rounded-full mb-8 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Enterprise Web Services
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
              >
                <span className="text-slate-900">Dijital </span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Varlığınızı
                </span>
                <br />
                <span className="text-slate-900">Oluşturun</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 max-w-xl mb-8 leading-relaxed"
              >
                Profesyonel web hosting, domain kayıt, SSL sertifikaları ve güvenilirlik
                talep eden işletmeler için tasarlanmış yönetilen hizmetler.
              </motion.p>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: Zap, label: "Hızlı Altyapı" },
                  { icon: Shield, label: "99.9% Uptime" },
                  { icon: Headphones, label: "7/24 Destek" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-amber-200 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link
                  href="https://console.hyble.co/digital"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5"
                >
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-lg transition-all border border-slate-200 shadow-sm"
                >
                  Servisleri Gör
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500"
              >
                Kredi kartı gerekmez • 14 gün ücretsiz deneme
              </motion.p>
            </div>

            {/* Right Content - Trust Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 p-8 backdrop-blur-sm">
                <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-tr-3xl rounded-bl-3xl opacity-10" />

                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
                  Güvenilir Altyapı
                </h3>
                <p className="text-slate-500 text-sm text-center mb-8">
                  İşletmeniz için kurumsal seviye güvenlik
                </p>

                <div className="space-y-4 mb-8">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.label}</div>
                        <div className="text-sm text-slate-500">{item.sublabel}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Servislerimiz</h2>
            <p className="text-slate-600">Online varlığınızı kurmak ve büyütmek için ihtiyacınız olan her şey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg transition group"
              >
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition">
                  <service.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{service.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                <p className="text-xl font-bold text-amber-600">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Neden Hyble Digital?</h2>
            <p className="text-slate-600">İşletmeniz için en iyi altyapı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg transition group text-center"
              >
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-amber-200 transition">
                  <feature.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Hemen Başlayın</h2>
          <p className="text-amber-100 mb-8">
            Profesyonel web hosting ile dijital varlığınızı güçlendirin.
          </p>
          <Link
            href="https://console.hyble.co/digital"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-amber-600 px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl"
          >
            <Globe className="h-5 w-5" />
            Ücretsiz Başla
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                Hyble<span className="text-amber-600">Digital</span>
              </span>
            </div>

            <p className="text-slate-500 text-sm">
              Hyble Ltd. bir markasıdır. UK Company No: 15872841
            </p>

            <div className="flex items-center gap-4 text-slate-500">
              <Link href="https://hyble.co" className="hover:text-amber-600 transition">
                Hyble
              </Link>
              <Link href="https://hyble.co/legal/privacy" className="hover:text-amber-600 transition">
                Gizlilik
              </Link>
              <Link href="https://hyble.co/legal/terms" className="hover:text-amber-600 transition">
                Şartlar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

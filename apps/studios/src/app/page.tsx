import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Gamepad2, Server, Users, Shield, Zap, Globe,
  Clock, HardDrive, ArrowRight, Check, Play,
  Settings, Terminal, ChevronRight, Star
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hyble Studios - Gaming Solutions",
  description: "Minecraft, FiveM, Rust ve daha fazlası için düşük ping, yüksek performans oyun sunucuları. DDoS koruması, otomatik yedekleme ve tek tıkla kurulum.",
};

const games = [
  {
    name: "Minecraft",
    description: "Java & Bedrock Edition",
    price: "€2.99",
    icon: "🎮",
    features: ["Paper, Spigot, Forge", "Mod & Plugin Desteği", "Bedrock Crossplay"],
    popular: true,
  },
  {
    name: "FiveM",
    description: "GTA V Roleplay",
    price: "€9.99",
    icon: "🚗",
    features: ["ESX/QBCore Ready", "txAdmin Dahil", "Custom Scripts"],
  },
  {
    name: "Rust",
    description: "Survival Multiplayer",
    price: "€14.99",
    icon: "🔫",
    features: ["Oxide Mod Desteği", "Wipe Scheduling", "RCON Erişimi"],
  },
  {
    name: "CS2",
    description: "Counter-Strike 2",
    price: "€7.99",
    icon: "💣",
    features: ["128 Tick", "Competitive Ready", "Custom Maps"],
    badge: "Yakında",
  },
  {
    name: "ARK",
    description: "Survival Evolved",
    price: "€12.99",
    icon: "🦖",
    features: ["Mod Desteği", "Cluster Kurulumu", "Auto Updates"],
    badge: "Yakında",
  },
  {
    name: "Palworld",
    description: "Creature Multiplayer",
    price: "€9.99",
    icon: "🐾",
    features: ["Dedicated Server", "Auto Restart", "Easy Config"],
    badge: "Yakında",
  },
];

const features = [
  {
    icon: Zap,
    title: "Anında Kurulum",
    description: "Sunucunuz 60 saniyede hazır. Tek tıkla kurulum, hemen oynamaya başlayın.",
  },
  {
    icon: Shield,
    title: "DDoS Koruması",
    description: "Tüm sunucularda dahil. Oyununuzu kesintisiz deneyimleyin.",
  },
  {
    icon: Globe,
    title: "Düşük Ping",
    description: "Almanya ve Finlandiya veri merkezlerinde düşük gecikme süresi.",
  },
  {
    icon: HardDrive,
    title: "NVMe SSD",
    description: "Yüksek performanslı NVMe depolama ile hızlı yükleme.",
  },
  {
    icon: Clock,
    title: "Otomatik Yedekleme",
    description: "Günlük otomatik yedekleme, tek tıkla geri yükleme.",
  },
  {
    icon: Terminal,
    title: "Web Konsol",
    description: "Tarayıcıdan sunucu konsoluna erişim, SSH gerekmez.",
  },
];

const plans = [
  {
    name: "Starter",
    ram: "2 GB",
    slots: "10",
    price: "€2.99",
    features: ["NVMe SSD", "DDoS Koruması", "Günlük Yedekleme"],
  },
  {
    name: "Standard",
    ram: "4 GB",
    slots: "20",
    price: "€5.99",
    features: ["NVMe SSD", "DDoS Koruması", "Günlük Yedekleme", "Mod Desteği"],
    popular: true,
  },
  {
    name: "Pro",
    ram: "8 GB",
    slots: "50",
    price: "€9.99",
    features: ["NVMe SSD", "DDoS Koruması", "Günlük Yedekleme", "Mod Desteği", "Öncelikli Destek"],
  },
  {
    name: "Enterprise",
    ram: "16 GB",
    slots: "100+",
    price: "€19.99",
    features: ["NVMe SSD", "DDoS Koruması", "Günlük Yedekleme", "Mod Desteği", "7/24 Destek", "SLA Garantisi"],
  },
];

export default function GameLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-8">
            <Gamepad2 className="w-4 h-4" />
            Hyble Gaming
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Oyun Sunucusu
            <span className="block text-emerald-400">Hosting</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Minecraft, FiveM, Rust ve daha fazlası. Düşük ping, yüksek performans,
            DDoS koruması ve 7/24 Türkçe destek.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
            >
              Hemen Başla
            </a>
            <a
              href="#plans"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Planları İncele
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "€2.99", label: "/aydan" },
              { value: "<10ms", label: "Ping" },
              { value: "99.9%", label: "Uptime" },
              { value: "7/24", label: "Destek" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Desteklenen Oyunlar</h2>
            <p className="text-slate-400">Favori oyununuz için optimize edilmiş sunucular</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.name}
                className={`p-6 bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all group ${
                  game.popular ? "ring-1 ring-emerald-500/30" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-sm text-slate-500">{game.description}</p>
                    </div>
                  </div>
                  {game.popular && (
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Popüler
                    </span>
                  )}
                  {game.badge && (
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded-full">
                      {game.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-white">{game.price}</span>
                  <span className="text-slate-500">/aydan</span>
                </div>

                <ul className="space-y-2">
                  {game.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Neden Hyble Gaming?</h2>
            <p className="text-slate-400">Oyuncular için tasarlanmış altyapı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50" id="plans">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Minecraft Planları</h2>
            <p className="text-slate-400">İhtiyacınıza uygun planı seçin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 bg-slate-900 border-slate-800 ${
                  plan.popular ? "ring-2 ring-emerald-500 border-emerald-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-medium text-emerald-400 mb-4">En Popüler</div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{plan.ram} RAM</span>
                  <span>•</span>
                  <span>{plan.slots} Slot</span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500">/ay</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://id.hyble.co/auth/register"
                  className={`block w-full py-3 text-center font-medium rounded-lg transition-colors ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  Başla
                </a>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Özel ihtiyaçlarınız için{" "}
              <Link href="/contact" className="text-emerald-400 hover:text-emerald-300">
                satış ekibiyle görüşün
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-emerald-950/50 to-slate-900 border border-emerald-500/20">
            <Gamepad2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Oyun Sunucunuzu Başlatın
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              60 saniyede kurulum, 7 gün ücretsiz deneme. Kredi kartı gerekmez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://id.hyble.co/auth/register"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
              >
                Ücretsiz Dene
              </a>
              <Link
                href="/contact"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Bize Ulaşın
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 px-4 text-center border-t border-slate-800">
        <p className="text-sm text-slate-500">
          Cloud hosting, şablonlar ve ekosistem hizmetleri için{" "}
          <a href="https://hyble.co" className="text-emerald-400 hover:text-emerald-300">
            hyble.co
          </a>
          {" "}adresini ziyaret edin.
        </p>
      </section>
    </div>
  );
}

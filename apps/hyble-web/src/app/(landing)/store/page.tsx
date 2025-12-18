"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ShoppingBag, Cloud, Globe, Database, Shield,
  Gamepad2, Server, Layout, ShoppingCart, Rocket, Zap,
  ChevronRight, Search, ArrowRight, Sparkles, Check,
  Cpu, HardDrive, MemoryStick, MapPin, Plus, Minus,
  Play, Users, Settings, Terminal, Lock, Headphones,
  Clock, RefreshCw, Star
} from "lucide-react";

// Statik kategoriler - Minimal ve profesyonel renkler
const categories = [
  {
    slug: "website-templates",
    name: "Web Sitesi Şablonları",
    description: "Kurumsal ve kişisel web siteleri",
    icon: Layout,
    count: 12,
  },
  {
    slug: "ecommerce",
    name: "E-ticaret Şablonları",
    description: "Online mağaza çözümleri",
    icon: ShoppingCart,
    count: 8,
  },
  {
    slug: "landing-pages",
    name: "Landing Page",
    description: "Dönüşüm odaklı sayfalar",
    icon: Rocket,
    count: 15,
  },
  {
    slug: "ssl",
    name: "SSL Sertifikaları",
    description: "DV, OV, EV sertifikalar",
    icon: Shield,
    count: 5,
  },
];

// VPS Konfigürasyon seçenekleri
const vpsOptions = {
  cpu: [
    { value: 1, label: "1 vCPU", price: 0 },
    { value: 2, label: "2 vCPU", price: 5 },
    { value: 4, label: "4 vCPU", price: 15 },
    { value: 8, label: "8 vCPU", price: 35 },
    { value: 16, label: "16 vCPU", price: 75 },
  ],
  ram: [
    { value: 1, label: "1 GB", price: 0 },
    { value: 2, label: "2 GB", price: 2 },
    { value: 4, label: "4 GB", price: 6 },
    { value: 8, label: "8 GB", price: 14 },
    { value: 16, label: "16 GB", price: 30 },
    { value: 32, label: "32 GB", price: 62 },
  ],
  storage: [
    { value: 20, label: "20 GB SSD", price: 0 },
    { value: 40, label: "40 GB SSD", price: 2 },
    { value: 80, label: "80 GB SSD", price: 6 },
    { value: 160, label: "160 GB SSD", price: 14 },
    { value: 320, label: "320 GB SSD", price: 30 },
    { value: 640, label: "640 GB SSD", price: 62 },
  ],
  locations: [
    { value: "germany", label: "Almanya", flag: "🇩🇪", latency: "8ms" },
    { value: "finland", label: "Finlandiya", flag: "🇫🇮", latency: "15ms" },
    { value: "usa", label: "ABD (Ashburn)", flag: "🇺🇸", latency: "85ms" },
    { value: "singapore", label: "Singapur", flag: "🇸🇬", latency: "145ms" },
  ],
};

// Oyun Sunucusu Konfigürasyon seçenekleri
const gameServerOptions = {
  games: [
    { value: "minecraft", label: "Minecraft", icon: "⛏️", basePrice: 2.99, ramMultiplier: 1 },
    { value: "fivem", label: "FiveM", icon: "🚗", basePrice: 9.99, ramMultiplier: 1.5 },
    { value: "rust", label: "Rust", icon: "🔧", basePrice: 14.99, ramMultiplier: 2 },
    { value: "ark", label: "ARK", icon: "🦖", basePrice: 12.99, ramMultiplier: 1.8 },
    { value: "csgo", label: "CS2", icon: "🔫", basePrice: 4.99, ramMultiplier: 0.8 },
    { value: "valheim", label: "Valheim", icon: "⚔️", basePrice: 6.99, ramMultiplier: 1.2 },
  ],
  ram: [
    { value: 2, label: "2 GB", price: 0 },
    { value: 4, label: "4 GB", price: 3 },
    { value: 8, label: "8 GB", price: 8 },
    { value: 16, label: "16 GB", price: 18 },
    { value: 32, label: "32 GB", price: 38 },
  ],
  slots: [
    { value: 10, label: "10 Slot", price: 0 },
    { value: 25, label: "25 Slot", price: 2 },
    { value: 50, label: "50 Slot", price: 5 },
    { value: 100, label: "100 Slot", price: 10 },
    { value: 200, label: "200 Slot", price: 20 },
  ],
  locations: [
    { value: "germany", label: "Almanya", flag: "🇩🇪", latency: "8ms" },
    { value: "finland", label: "Finlandiya", flag: "🇫🇮", latency: "15ms" },
    { value: "france", label: "Fransa", flag: "🇫🇷", latency: "12ms" },
  ],
};

// VPS Configurator Component
function VPSConfigurator() {
  const [cpuIndex, setCpuIndex] = useState(1);
  const [ramIndex, setRamIndex] = useState(2);
  const [storageIndex, setStorageIndex] = useState(2);
  const [location, setLocation] = useState("germany");

  const basePrice = 4.99;
  const totalPrice = useMemo(() => {
    const cpuPrice = vpsOptions.cpu[cpuIndex]?.price ?? 0;
    const ramPrice = vpsOptions.ram[ramIndex]?.price ?? 0;
    const storagePrice = vpsOptions.storage[storageIndex]?.price ?? 0;
    return basePrice + cpuPrice + ramPrice + storagePrice;
  }, [cpuIndex, ramIndex, storageIndex]);

  return (
    <div className="space-y-6">
      {/* CPU */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">İşlemci</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {vpsOptions.cpu[cpuIndex]?.label ?? ""}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={vpsOptions.cpu.length - 1}
          value={cpuIndex}
          onChange={(e) => setCpuIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          {vpsOptions.cpu.map((opt, i) => (
            <span key={opt.value} className={`text-xs ${i === cpuIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
              {opt.value}
            </span>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bellek (RAM)</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {vpsOptions.ram[ramIndex]?.label ?? ""}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={vpsOptions.ram.length - 1}
          value={ramIndex}
          onChange={(e) => setRamIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          {vpsOptions.ram.map((opt, i) => (
            <span key={opt.value} className={`text-xs ${i === ramIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
              {opt.value}GB
            </span>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Depolama (NVMe SSD)</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {vpsOptions.storage[storageIndex]?.label ?? ""}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={vpsOptions.storage.length - 1}
          value={storageIndex}
          onChange={(e) => setStorageIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          {vpsOptions.storage.map((opt, i) => (
            <span key={opt.value} className={`text-xs ${i === storageIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
              {opt.value}GB
            </span>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lokasyon</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {vpsOptions.locations.map((loc) => (
            <button
              key={loc.value}
              onClick={() => setLocation(loc.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                location === loc.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{loc.flag}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{loc.label}</p>
                  <p className="text-xs text-slate-500">{loc.latency}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aylık fiyat</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              €{totalPrice.toFixed(2)}
              <span className="text-sm font-normal text-slate-500">/ay</span>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p>Yıllık ödemede</p>
            <p className="text-green-600 font-medium">2 ay ücretsiz</p>
          </div>
        </div>
        <Link
          href={`/store/configure/vps?cpu=${vpsOptions.cpu[cpuIndex]?.value ?? 1}&ram=${vpsOptions.ram[ramIndex]?.value ?? 1}&storage=${vpsOptions.storage[storageIndex]?.value ?? 20}&location=${location}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Server className="w-4 h-4" />
          VPS Oluştur
        </Link>
      </div>
    </div>
  );
}

// Game Server Configurator Component
function GameServerConfigurator() {
  const [selectedGame, setSelectedGame] = useState(0);
  const [ramIndex, setRamIndex] = useState(1);
  const [slotsIndex, setSlotsIndex] = useState(1);
  const [location, setLocation] = useState("germany");

  const game = gameServerOptions.games[selectedGame] ?? gameServerOptions.games[0]!;
  const totalPrice = useMemo(() => {
    const ramOption = gameServerOptions.ram[ramIndex];
    const slotsOption = gameServerOptions.slots[slotsIndex];
    const currentGame = game ?? gameServerOptions.games[0]!;
    const ramPrice = (ramOption?.price ?? 0) * currentGame.ramMultiplier;
    const slotsPrice = slotsOption?.price ?? 0;
    return currentGame.basePrice + ramPrice + slotsPrice;
  }, [selectedGame, ramIndex, slotsIndex, game]);

  return (
    <div className="space-y-6">
      {/* Game Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Oyun Seçin</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {gameServerOptions.games.map((g, i) => (
            <button
              key={g.value}
              onClick={() => setSelectedGame(i)}
              className={`p-3 rounded-lg border text-center transition-all ${
                selectedGame === i
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <span className="text-2xl block mb-1">{g.icon}</span>
              <p className="text-xs font-medium text-slate-900 dark:text-white">{g.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bellek (RAM)</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {gameServerOptions.ram[ramIndex]?.label ?? ""}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={gameServerOptions.ram.length - 1}
          value={ramIndex}
          onChange={(e) => setRamIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          {gameServerOptions.ram.map((opt, i) => (
            <span key={opt.value} className={`text-xs ${i === ramIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
              {opt.value}GB
            </span>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Oyuncu Slotu</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {gameServerOptions.slots[slotsIndex]?.label ?? ""}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={gameServerOptions.slots.length - 1}
          value={slotsIndex}
          onChange={(e) => setSlotsIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          {gameServerOptions.slots.map((opt, i) => (
            <span key={opt.value} className={`text-xs ${i === slotsIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
              {opt.value}
            </span>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lokasyon</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {gameServerOptions.locations.map((loc) => (
            <button
              key={loc.value}
              onClick={() => setLocation(loc.value)}
              className={`p-2 rounded-lg border text-center transition-all ${
                location === loc.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <span className="text-lg">{loc.flag}</span>
              <p className="text-xs text-slate-500 mt-1">{loc.latency}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aylık fiyat</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              €{totalPrice.toFixed(2)}
              <span className="text-sm font-normal text-slate-500">/ay</span>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p>{game.label} Sunucusu</p>
            <p className="text-green-600 font-medium">Anında kurulum</p>
          </div>
        </div>
        <Link
          href={`/store/configure/game-server?game=${game.value}&ram=${gameServerOptions.ram[ramIndex]?.value ?? 2}&slots=${gameServerOptions.slots[slotsIndex]?.value ?? 10}&location=${location}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          Sunucu Oluştur
        </Link>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [activeConfigurator, setActiveConfigurator] = useState<"vps" | "game">("vps");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section - Minimal */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Altyapınızı Özelleştirin
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              İhtiyacınıza göre yapılandırın, sadece kullandığınız kadar ödeyin.
            </p>
          </div>
        </div>
      </section>

      {/* Server Configurators */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* VPS Configurator */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Server className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">VPS Sunucu</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sanal özel sunucu yapılandırın</p>
                </div>
              </div>
              <VPSConfigurator />
            </Card>

            {/* Game Server Configurator */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Oyun Sunucusu</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Oyun sunucunuzu yapılandırın</p>
                </div>
              </div>
              <GameServerConfigurator />
            </Card>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, text: "Anında aktivasyon" },
              { icon: Shield, text: "DDoS koruması dahil" },
              { icon: RefreshCw, text: "Günlük yedekleme" },
              { icon: Headphones, text: "7/24 teknik destek" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <item.icon className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Diğer Ürünler
            </h2>
            <Link
              href="/store/all"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              Tümünü gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/store/category/${category.slug}`}
                className="group"
              >
                <Card className="p-4 h-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      <category.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {category.count} ürün
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hyble - Minimal */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-8">
            Neden Hyble?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Terminal,
                title: "Tam Kontrol",
                desc: "Root erişimi, özel IP, tam yönetim paneli. Sunucunuz tamamen sizin kontrolünüzde.",
              },
              {
                icon: Lock,
                title: "Güvenli Altyapı",
                desc: "Hetzner veri merkezleri, GDPR uyumlu, enterprise seviye güvenlik.",
              },
              {
                icon: Clock,
                title: "Anında Başlangıç",
                desc: "Siparişiniz saniyeler içinde aktif. Hemen kullanmaya başlayın.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Özel çözüm mü gerekiyor?
          </h2>
          <p className="text-slate-400 mb-6">
            Kurumsal altyapı, özel yapılandırma ve toplu indirimler için iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              İletişime Geç
            </Link>
            <Link
              href="/solutions"
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Ekosistem Çözümleri
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

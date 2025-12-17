// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, Button } from "@hyble/ui";
import {
  Gamepad2,
  Server,
  Users,
  Cpu,
  HardDrive,
  Clock,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Settings,
  ChevronRight,
  Zap,
  Globe,
  Shield,
  Construction,
} from "lucide-react";
import Link from "next/link";

export default function GameServersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Gamepad2 className="h-7 w-7 text-emerald-500" />
            Game Sunucuları
          </h1>
          <p className="text-muted-foreground mt-1">
            Minecraft ve oyun sunucularınızı yönetin
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="p-12 text-center">
        <div className="max-w-lg mx-auto">
          <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Construction className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold mb-2">Yakında Geliyor!</h2>
          <p className="text-muted-foreground mb-6">
            HybleGaming ile Minecraft ve diğer oyun sunucularınızı kolayca yönetebileceksiniz.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Server className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Minecraft Sunucuları</p>
                <p className="text-xs text-muted-foreground">Java & Bedrock</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Anında Kurulum</p>
                <p className="text-xs text-muted-foreground">1 dakikada hazır</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">DDoS Koruması</p>
                <p className="text-xs text-muted-foreground">Ücretsiz dahil</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Yedekleme</p>
                <p className="text-xs text-muted-foreground">Otomatik yedekleme</p>
              </div>
            </div>
          </div>

          {/* Planned Features */}
          <div className="text-left p-4 rounded-lg border bg-card mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Planlanan Özellikler
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Tek tıkla sunucu kurulumu
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Web tabanlı konsol erişimi
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Plugin/mod yönetimi
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Dosya yöneticisi (SFTP)
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Oyuncu istatistikleri
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                Zamanlı görevler (cron)
              </li>
            </ul>
          </div>

          {/* Support */}
          <p className="text-sm text-muted-foreground mb-4">
            Şu anda oyun sunucusu ihtiyaçlarınız için:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://www.apex-hosting.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Apex Hosting
              </Button>
            </a>
            <a href="https://www.shockbyte.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Shockbyte
              </Button>
            </a>
            <a href="https://www.pebblehost.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                PebbleHost
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Mock Server List (Preview) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 opacity-50">
          <Server className="h-5 w-5" />
          Sunucularınız (Önizleme)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none">
          {/* Mock Server Cards */}
          {[
            { name: "Survival Server", players: "12/50", status: "online", type: "Paper 1.20.4" },
            { name: "Creative Build", players: "3/20", status: "online", type: "Vanilla 1.20.4" },
            { name: "Modded SMP", players: "0/30", status: "offline", type: "Forge 1.19.2" },
          ].map((server, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{server.name}</h4>
                  <p className="text-xs text-muted-foreground">{server.type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  server.status === "online"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {server.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {server.players}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  2 GB
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Terminal className="h-3 w-3 mr-1" />
                  Konsol
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

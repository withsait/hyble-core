"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Globe,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Shield,
  ExternalLink,
  Trash2,
  Copy,
  Info,
  RefreshCw,
  Search,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  ShoppingCart,
  X,
  Check,
  Server,
  Zap,
  Calendar,
  ArrowRight,
  Crown,
} from "lucide-react";

// Mock data - Genişletilmiş domain verileri
const mockDomains = [
  {
    id: "1",
    domain: "mybusiness.hyble.co",
    type: "subdomain",
    isPrimary: true,
    status: "active",
    ssl: {
      status: "active",
      issuer: "Let's Encrypt",
      expiresAt: "2025-03-15",
      autoRenew: true,
    },
    dns: {
      configured: true,
      records: [
        { type: "A", name: "@", value: "178.63.138.97", status: "verified" },
        { type: "CNAME", name: "www", value: "proxy.hyble.co", status: "verified" },
      ],
    },
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    domain: "www.mybusiness.com",
    type: "custom",
    isPrimary: false,
    status: "pending",
    ssl: {
      status: "pending",
      issuer: null,
      expiresAt: null,
      autoRenew: true,
    },
    dns: {
      configured: false,
      records: [
        { type: "A", name: "@", value: "178.63.138.97", status: "pending" },
        { type: "CNAME", name: "www", value: "proxy.hyble.co", status: "pending" },
      ],
    },
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    domain: "shop.mybusiness.com",
    type: "custom",
    isPrimary: false,
    status: "active",
    ssl: {
      status: "expiring",
      issuer: "Let's Encrypt",
      expiresAt: "2025-01-05",
      autoRenew: false,
    },
    dns: {
      configured: true,
      records: [
        { type: "A", name: "@", value: "178.63.138.97", status: "verified" },
        { type: "CNAME", name: "www", value: "proxy.hyble.co", status: "verified" },
      ],
    },
    createdAt: "2024-03-10",
  },
];

// Satın alınabilir domain önerileri
const availableDomains = [
  { domain: "mybusiness.com", price: 12.99, premium: false },
  { domain: "mybusiness.co.uk", price: 9.99, premium: false },
  { domain: "mybusiness.io", price: 39.99, premium: true },
  { domain: "mybusiness.net", price: 11.99, premium: false },
  { domain: "mybusiness.shop", price: 29.99, premium: false },
];

type TabType = "domains" | "ssl" | "dns" | "purchase";

export default function WebsiteDomainsPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("domains");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainSearch, setDomainSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");

  const domains = mockDomains;

  const tabs = [
    { id: "domains" as TabType, name: "Alan Adları", icon: Globe },
    { id: "ssl" as TabType, name: "SSL Sertifikaları", icon: Shield },
    { id: "dns" as TabType, name: "DNS Kayıtları", icon: Server },
    { id: "purchase" as TabType, name: "Domain Satın Al", icon: ShoppingCart },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Aktif
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Beklemede
          </span>
        );
      case "expiring":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Süresi Doluyor
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
            <X className="w-3 h-3" />
            Hata
          </span>
        );
      default:
        return null;
    }
  };

  const renderDomainsTab = () => (
    <div className="space-y-6">
      {/* DNS Bilgi Kartı */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Özel alan adınızı bağlamak için
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              DNS kayıtlarınızı aşağıdaki değerlere yönlendirin:
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                <code className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  A Record: 178.63.138.97
                </code>
                <button className="text-blue-500 hover:text-blue-600">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                <code className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  CNAME: proxy.hyble.co
                </code>
                <button className="text-blue-500 hover:text-blue-600">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Domain Listesi */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <Card
            key={domain.id}
            className={`p-6 transition-all ${
              selectedDomain === domain.id
                ? "ring-2 ring-blue-500"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  domain.status === "active"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : domain.status === "pending"
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}>
                  <Globe className={`w-6 h-6 ${
                    domain.status === "active"
                      ? "text-green-600"
                      : domain.status === "pending"
                      ? "text-amber-600"
                      : "text-slate-600"
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {domain.domain}
                    </h3>
                    {domain.isPrimary && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                        Birincil
                      </span>
                    )}
                    {domain.type === "subdomain" && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                        Alt Alan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {getStatusBadge(domain.status)}
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      domain.ssl.status === "active"
                        ? "text-green-600"
                        : domain.ssl.status === "expiring"
                        ? "text-orange-600"
                        : "text-amber-600"
                    }`}>
                      <Shield className="w-3 h-3" />
                      SSL: {domain.ssl.status === "active" ? "Aktif" : domain.ssl.status === "expiring" ? "Süresi Doluyor" : "Beklemede"}
                    </span>
                    {domain.ssl.expiresAt && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {domain.ssl.expiresAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Yenile">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <a
                  href={`https://${domain.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Siteyi Aç"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" title="Kopyala">
                  <Copy className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" title="Ayarlar">
                  <Settings className="w-5 h-5" />
                </button>
                {!domain.isPrimary && (
                  <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sil">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Genişletilmiş DNS Detayları */}
            {selectedDomain === domain.id && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                  DNS Kayıtları
                </h4>
                <div className="space-y-3">
                  {domain.dns.records.map((record, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-16 px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono rounded text-center">
                          {record.type}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {record.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-mono text-slate-900 dark:text-white">
                          {record.value}
                        </span>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  {!domain.isPrimary && (
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Birincil Yap
                    </button>
                  )}
                  <button className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400 font-medium">
                    DNS Kontrol Et
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSSLTab = () => (
    <div className="space-y-6">
      {/* SSL Özet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aktif SSL</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Süresi Doluyor</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Beklemede</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SSL Listesi */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <Card key={domain.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  domain.ssl.status === "active"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : domain.ssl.status === "expiring"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  {domain.ssl.status === "active" ? (
                    <Lock className="w-6 h-6 text-green-600" />
                  ) : domain.ssl.status === "expiring" ? (
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  ) : (
                    <Unlock className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {domain.domain}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    {getStatusBadge(domain.ssl.status)}
                    {domain.ssl.issuer && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Sağlayıcı: {domain.ssl.issuer}
                      </span>
                    )}
                    {domain.ssl.expiresAt && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Bitiş: {domain.ssl.expiresAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Otomatik Yenileme</span>
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    domain.ssl.autoRenew ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      domain.ssl.autoRenew ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                {domain.ssl.status !== "active" && (
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
                    SSL Oluştur
                  </button>
                )}
                {domain.ssl.status === "expiring" && (
                  <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg">
                    Şimdi Yenile
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SSL Bilgi */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Ücretsiz SSL Sertifikası
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Tüm alan adlarınız için Let's Encrypt üzerinden ücretsiz SSL sertifikası sağlıyoruz.
              SSL sertifikaları otomatik olarak yenilenir ve HTTPS bağlantıları güvence altına alınır.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDNSTab = () => (
    <div className="space-y-6">
      {/* DNS Yönetimi */}
      {domains.map((domain) => (
        <Card key={domain.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {domain.domain}
              </h3>
              {domain.dns.configured ? (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Yapılandırıldı
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                  Yapılandırma Gerekli
                </span>
              )}
            </div>
            <button className="px-3 py-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              DNS Kontrol Et
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Tür</th>
                  <th className="pb-3">Ad</th>
                  <th className="pb-3">Değer</th>
                  <th className="pb-3">TTL</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {domain.dns.records.map((record, idx) => (
                  <tr key={idx}>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono rounded">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-300">
                      {record.name}
                    </td>
                    <td className="py-3 text-sm font-mono text-slate-900 dark:text-white">
                      {record.value}
                    </td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                      3600
                    </td>
                    <td className="py-3">
                      {record.status === "verified" ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!domain.dns.configured && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                DNS kayıtları henüz doğrulanmadı. Lütfen alan adı sağlayıcınızdan yukarıdaki DNS kayıtlarını ekleyin.
                Propagasyon 24-48 saat sürebilir.
              </p>
            </div>
          )}
        </Card>
      ))}

      {/* DNS Kayıt Ekleme */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Özel DNS Kaydı Ekle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tür
            </label>
            <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm">
              <option>A</option>
              <option>AAAA</option>
              <option>CNAME</option>
              <option>MX</option>
              <option>TXT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ad
            </label>
            <input
              type="text"
              placeholder="@"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Değer
            </label>
            <input
              type="text"
              placeholder="IP adresi veya hostname"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">
              Kayıt Ekle
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPurchaseTab = () => (
    <div className="space-y-6">
      {/* Domain Arama */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Domain Ara
        </h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={domainSearch}
              onChange={(e) => setDomainSearch(e.target.value)}
              placeholder="İstediğiniz domain adını yazın..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
            />
          </div>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
            Ara
          </button>
        </div>
      </Card>

      {/* Önerilen Domainler */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Önerilen Alan Adları
        </h3>
        <div className="space-y-3">
          {availableDomains.map((domain, idx) => (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {domain.domain}
                      </span>
                      {domain.premium && (
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Müsait
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${domain.price}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">/yıl</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Satın Al
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Domain Transfer */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Domain Transfer
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Mevcut alan adınızı başka bir sağlayıcıdan Hyble'a transfer edin.
              Transfer işlemi süresince web siteniz çalışmaya devam eder.
            </p>
            <button className="mt-4 px-4 py-2 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20">
              Domain Transfer Et
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/websites"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Domain & SSL Yönetimi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Alan adlarınızı ve SSL sertifikalarınızı yönetin
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Alan Adı Bağla
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "domains" && renderDomainsTab()}
        {activeTab === "ssl" && renderSSLTab()}
        {activeTab === "dns" && renderDNSTab()}
        {activeTab === "purchase" && renderPurchaseTab()}

        {/* Add Domain Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Alan Adı Bağla
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Alan Adı
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <Info className="w-4 h-4 inline mr-1" />
                    Alan adınızı bağladıktan sonra DNS kayıtlarını güncellemeniz gerekecek.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    İptal
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                    Bağla
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

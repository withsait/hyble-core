"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Users, Globe, DollarSign, TrendingUp, Plus, Search, Filter,
  MoreHorizontal, Eye, Edit, Trash2, ExternalLink, ChevronDown,
  Building2, Mail, Phone, Calendar, Activity, BarChart3, Settings,
  Copy, Check, Loader2, Download, Upload, RefreshCw, Shield,
  Star, Clock, Package, Zap, Crown, UserPlus, Send, ArrowRight,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  websites: number;
  totalSpent: number;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
  lastActivity: string;
  plan: "starter" | "business" | "enterprise";
}

interface Website {
  id: string;
  name: string;
  domain: string;
  clientId: string;
  clientName: string;
  status: "active" | "maintenance" | "suspended";
  plan: string;
  monthlyRevenue: number;
  createdAt: string;
}

// Mock data
const mockClients: Client[] = [
  {
    id: "1",
    name: "Mehmet Yilmaz",
    email: "mehmet@techcorp.com",
    phone: "+90 532 123 4567",
    company: "Tech Corp",
    websites: 3,
    totalSpent: 2450,
    status: "active",
    joinedAt: "2023-06-15",
    lastActivity: "2024-01-15",
    plan: "business",
  },
  {
    id: "2",
    name: "Ayse Kaya",
    email: "ayse@designstudio.com",
    phone: "+90 533 234 5678",
    company: "Design Studio",
    websites: 5,
    totalSpent: 4200,
    status: "active",
    joinedAt: "2023-03-20",
    lastActivity: "2024-01-14",
    plan: "enterprise",
  },
  {
    id: "3",
    name: "Ali Demir",
    email: "ali@startup.io",
    phone: "+90 534 345 6789",
    company: "Startup IO",
    websites: 1,
    totalSpent: 890,
    status: "active",
    joinedAt: "2023-09-10",
    lastActivity: "2024-01-13",
    plan: "starter",
  },
  {
    id: "4",
    name: "Zeynep Ozturk",
    email: "zeynep@ecommerce.com",
    phone: "+90 535 456 7890",
    company: "E-Commerce Plus",
    websites: 2,
    totalSpent: 1680,
    status: "pending",
    joinedAt: "2024-01-01",
    lastActivity: "2024-01-12",
    plan: "business",
  },
];

const mockWebsites: Website[] = [
  { id: "1", name: "Tech Corp Website", domain: "techcorp.com", clientId: "1", clientName: "Mehmet Yilmaz", status: "active", plan: "Business", monthlyRevenue: 99, createdAt: "2023-06-15" },
  { id: "2", name: "Tech Corp Blog", domain: "blog.techcorp.com", clientId: "1", clientName: "Mehmet Yilmaz", status: "active", plan: "Starter", monthlyRevenue: 29, createdAt: "2023-08-20" },
  { id: "3", name: "Design Studio", domain: "designstudio.com", clientId: "2", clientName: "Ayse Kaya", status: "active", plan: "Enterprise", monthlyRevenue: 199, createdAt: "2023-03-20" },
  { id: "4", name: "Startup Landing", domain: "startup.io", clientId: "3", clientName: "Ali Demir", status: "active", plan: "Starter", monthlyRevenue: 29, createdAt: "2023-09-10" },
  { id: "5", name: "E-Shop", domain: "eshop.com", clientId: "4", clientName: "Zeynep Ozturk", status: "maintenance", plan: "Business", monthlyRevenue: 99, createdAt: "2024-01-01" },
];

const agencyStats = {
  totalClients: 4,
  activeClients: 3,
  totalWebsites: 11,
  activeWebsites: 10,
  monthlyRevenue: 3245,
  revenueGrowth: 15,
  totalRevenue: 42560,
  avgClientValue: 1850,
};

export default function AgencyPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "websites" | "billing" | "settings">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "inactive": return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
      case "pending": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "maintenance": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "suspended": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise": return <Crown className="w-4 h-4 text-purple-500" />;
      case "business": return <Star className="w-4 h-4 text-amber-500" />;
      default: return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Ajans Paneli
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Musterilerinizi ve web sitelerini tek panelden yonetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Rapor Indir
          </button>
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Musteri Ekle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "clients", label: "Musteriler", icon: Users },
          { id: "websites", label: "Web Siteleri", icon: Globe },
          { id: "billing", label: "Faturalandirma", icon: DollarSign },
          { id: "settings", label: "Ayarlar", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Toplam Musteri</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{agencyStats.totalClients}</p>
              <p className="text-sm text-green-600 mt-1">+2 bu ay</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Aktif Web Sitesi</span>
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{agencyStats.activeWebsites}</p>
              <p className="text-sm text-green-600 mt-1">+3 bu ay</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Aylik Gelir</span>
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">${agencyStats.monthlyRevenue}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{agencyStats.revenueGrowth}%
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Toplam Gelir</span>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">${agencyStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Tum zamanlar</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Clients */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Son Musteriler</h3>
                <button
                  onClick={() => setActiveTab("clients")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tumunu Gor
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {mockClients.slice(0, 4).map((client) => (
                  <div key={client.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {client.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{client.name}</p>
                      <p className="text-sm text-slate-500 truncate">{client.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-white">{client.websites} site</p>
                      <p className="text-sm text-slate-500">${client.totalSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Websites */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Son Web Siteleri</h3>
                <button
                  onClick={() => setActiveTab("websites")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tumunu Gor
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {mockWebsites.slice(0, 4).map((website) => (
                  <div key={website.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{website.name}</p>
                      <p className="text-sm text-slate-500 truncate">{website.domain}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(website.status)}`}>
                      {website.status === "active" ? "Aktif" : website.status === "maintenance" ? "Bakim" : "Askida"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Hizli Islemler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: UserPlus, label: "Musteri Ekle", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
                { icon: Globe, label: "Site Olustur", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" },
                { icon: Send, label: "Fatura Gonder", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30" },
                { icon: BarChart3, label: "Rapor Olustur", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Musteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="w-4 h-4" />
              Filtrele
            </button>
          </div>

          {/* Clients Table */}
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Musteri</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Sirket</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Web Siteleri</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Plan</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Harcama</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Durum</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {mockClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{client.name}</p>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{client.company}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-slate-900 dark:text-white">{client.websites}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm capitalize">
                        {getPlanIcon(client.plan)}
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-slate-900 dark:text-white">
                      ${client.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(client.status)}`}>
                        {client.status === "active" ? "Aktif" : client.status === "pending" ? "Beklemede" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Edit className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Mail className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Websites Tab */}
      {activeTab === "websites" && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Web sitesi ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              <Plus className="w-4 h-4" />
              Yeni Site
            </button>
          </div>

          {/* Websites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWebsites.map((website) => (
              <Card key={website.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{website.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(website.status)}`}>
                      {website.status === "active" ? "Aktif" : website.status === "maintenance" ? "Bakim" : "Askida"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{website.domain}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {website.clientName}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">${website.monthlyRevenue}/ay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2 text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-sm transition-colors">
                      Yonet
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-sm text-slate-500 mb-2">Bu Ayin Geliri</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">${agencyStats.monthlyRevenue}</p>
              <p className="text-sm text-green-600 mt-1">+{agencyStats.revenueGrowth}% gecen aya gore</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm text-slate-500 mb-2">Bekleyen Odemeler</h3>
              <p className="text-3xl font-bold text-amber-600">$425</p>
              <p className="text-sm text-slate-500 mt-1">3 musteri</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm text-slate-500 mb-2">Komisyon Orani</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">15%</p>
              <p className="text-sm text-slate-500 mt-1">Standart oran</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Son Faturalar</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Fatura Olustur
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Fatura No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Musteri</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Tarih</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Tutar</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  { id: "INV-2024-001", client: "Tech Corp", date: "2024-01-15", amount: 299, status: "paid" },
                  { id: "INV-2024-002", client: "Design Studio", date: "2024-01-14", amount: 599, status: "paid" },
                  { id: "INV-2024-003", client: "Startup IO", date: "2024-01-10", amount: 89, status: "pending" },
                  { id: "INV-2024-004", client: "E-Commerce Plus", date: "2024-01-05", amount: 198, status: "paid" },
                ].map((invoice, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{invoice.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{invoice.client}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{invoice.date}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white">${invoice.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {invoice.status === "paid" ? "Odendi" : "Bekliyor"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* White Label Settings */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              White Label Ayarlari
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ajans Adi
                </label>
                <input
                  type="text"
                  defaultValue="My Agency"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    Logo Yukle
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ozel Domain
                </label>
                <input
                  type="text"
                  placeholder="panel.myagency.com"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
                <p className="text-sm text-slate-500 mt-1">Musterileriniz bu domain uzerinden panele erisecek</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tema Rengi
                </label>
                <div className="flex gap-2">
                  {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Commission Settings */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Komisyon Ayarlari
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kar Marji (%)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
                <p className="text-sm text-slate-500 mt-1">Musterilerinize fiyatlar bu oranda artirılarak gosterilecek</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              Ayarlari Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Yeni Musteri Ekle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sirket
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Plan
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <option value="starter">Starter</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Iptal
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Musteri Ekle
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

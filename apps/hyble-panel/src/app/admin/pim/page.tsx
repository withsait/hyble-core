"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Tag,
  Image,
  LayoutGrid,
} from "lucide-react";

type Tab = "products" | "categories" | "media";

export default function AdminPIMPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "products" as Tab, label: "Ürünler", icon: <Package className="h-4 w-4" /> },
    { id: "categories" as Tab, label: "Kategoriler", icon: <Tag className="h-4 w-4" /> },
    { id: "media" as Tab, label: "Medya", icon: <Image className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Package className="h-7 w-7 text-primary" />
            Ürün Yönetimi (PIM)
          </h1>
          <p className="text-muted-foreground mt-1">
            Ürünleri, kategorileri ve medyayı yönetin
          </p>
        </div>
        <Link href="/admin/pim/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtrele
        </Button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Ürün</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Tip</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Fiyat</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample row */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded" />
                      <div>
                        <p className="font-medium">Cloud Hosting Pro</p>
                        <p className="text-xs text-muted-foreground">SUBSCRIPTION</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">Abonelik</td>
                  <td className="px-4 py-3 text-sm font-medium">€29.99/ay</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Aktif
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Kategori Ağacı</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Yeni Kategori
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Ürün kategorilerini hiyerarşik olarak yönetin
          </p>
        </Card>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Medya Kütüphanesi</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Yükle
            </Button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

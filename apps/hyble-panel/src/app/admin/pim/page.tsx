// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Loader2,
  Tag,
  Image,
  Eye,
  EyeOff,
  X,
  AlertCircle,
} from "lucide-react";

type Tab = "products" | "categories" | "media";

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  ARCHIVED: { label: "Arşiv", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

export default function AdminPIMPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [searchTerm, setSearchTerm] = useState("");

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nameTr: "",
    nameEn: "",
    slug: "",
    icon: "",
    description: "",
  });
  const [categoryError, setCategoryError] = useState("");

  // tRPC queries
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = trpc.pim.listProducts.useQuery({
    search: searchTerm || undefined,
    limit: 50,
  });

  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = trpc.pim.listCategories.useQuery({
    includeInactive: true,
  });

  // tRPC mutations
  const deleteProduct = trpc.pim.deleteProduct.useMutation({
    onSuccess: () => refetchProducts(),
  });

  const deleteCategory = trpc.pim.deleteCategory.useMutation({
    onSuccess: () => refetchCategories(),
  });

  const createCategory = trpc.pim.createCategory.useMutation({
    onSuccess: () => {
      setShowCategoryModal(false);
      setCategoryForm({ nameTr: "", nameEn: "", slug: "", icon: "", description: "" });
      setCategoryError("");
      refetchCategories();
    },
    onError: (error) => {
      setCategoryError(error.message);
    },
  });

  const tabs = [
    { id: "products" as Tab, label: "Ürünler", icon: <Package className="h-4 w-4" />, count: productsData?.products.length },
    { id: "categories" as Tab, label: "Kategoriler", icon: <Tag className="h-4 w-4" />, count: categoriesData?.length },
    { id: "media" as Tab, label: "Medya", icon: <Image className="h-4 w-4" /> },
  ];

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      deleteProduct.mutate({ id });
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteCategory.mutate({ id });
    }
  };

  // Auto-generate slug from Turkish name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleCategoryNameChange = (value: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      nameTr: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleCreateCategory = () => {
    if (!categoryForm.nameTr || !categoryForm.nameEn || !categoryForm.slug) {
      setCategoryError("Tüm zorunlu alanları doldurun");
      return;
    }
    createCategory.mutate(categoryForm);
  };

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
        <div className="flex items-center gap-2">
          {activeTab === "categories" && (
            <Button variant="outline" onClick={() => setShowCategoryModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kategori
            </Button>
          )}
          <Link href="/admin/pim/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ürün
            </Button>
          </Link>
        </div>
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
              {tab.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 bg-muted rounded text-xs">{tab.count}</span>
              )}
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
          {productsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Yükleniyor...</p>
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Henüz ürün yok</p>
              <p className="text-sm text-muted-foreground mb-4">İlk ürününüzü oluşturarak başlayın</p>
              <Link href="/admin/pim/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Ürünü Oluştur
                </Button>
              </Link>
            </div>
          ) : (
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
                  {productsData?.products.map((product: any) => {
                    const status = statusConfig[product.status] || statusConfig.DRAFT;
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link href={`/admin/pim/products/${product.id}`} className="flex items-center gap-3 hover:opacity-80">
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              {product.primaryImage ? (
                                <img src={product.primaryImage} alt="" className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.nameTr}</p>
                              <p className="text-xs text-muted-foreground">{product.slug}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">{typeLabels[product.type] || product.type}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {product.lowestPrice ? `€${Number(product.lowestPrice).toFixed(2)}` : product.basePrice ? `€${Number(product.basePrice).toFixed(2)}` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/pim/products/${product.id}`}>
                              <Button variant="ghost" size="icon" title="Düzenle">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteProduct(product.id, product.nameTr)}
                              disabled={deleteProduct.isPending}
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card>
          {categoriesLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Yükleniyor...</p>
            </div>
          ) : categoriesData?.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Henüz kategori yok</p>
              <p className="text-sm text-muted-foreground mb-4">Ürünlerinizi organize etmek için kategori oluşturun</p>
              <Button onClick={() => setShowCategoryModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Kategoriyi Oluştur
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold">Kategori</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Slug</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Ürün Sayısı</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesData?.map((category: any) => (
                    <tr key={category.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{category.nameTr}</p>
                            <p className="text-xs text-muted-foreground">{category.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{category.slug}</td>
                      <td className="px-4 py-3 text-sm">{category._count?.products || 0}</td>
                      <td className="px-4 py-3">
                        {category.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                            <Eye className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded">
                            <EyeOff className="h-3 w-3" /> Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title="Düzenle">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id, category.nameTr)}
                            disabled={deleteCategory.isPending || (category._count?.products || 0) > 0}
                            title={category._count?.products > 0 ? "Önce ürünleri taşıyın" : "Sil"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          <div className="text-center py-12 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Medya kütüphanesi ürün sayfalarından yönetilir</p>
            <p className="text-sm mt-1">Bir ürüne görsel eklemek için ürün detay sayfasını kullanın</p>
          </div>
        </Card>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Yeni Kategori</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {categoryError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {categoryError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Kategori Adı (TR) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={categoryForm.nameTr}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="Web Hosting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Kategori Adı (EN) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, nameEn: e.target.value }))}
                  placeholder="Web Hosting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                  placeholder="web-hosting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">İkon (Lucide)</label>
                <Input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="server, cloud, globe..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Kategori açıklaması..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>
                {createCategory.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Oluştur
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

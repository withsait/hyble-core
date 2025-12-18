// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
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
  TrendingUp,
  DollarSign,
  Layers,
  BarChart3,
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  Check,
  Zap,
  Archive,
  RefreshCw,
  Grid3X3,
  List,
  ChevronDown,
  Star,
  StarOff,
  ExternalLink,
  Settings2,
  Server,
  Globe,
  Cloud,
  Shield,
  Cpu,
  Database,
  HardDrive,
} from "lucide-react";

type Tab = "overview" | "products" | "categories" | "media";
type ViewMode = "grid" | "list";
type ProductFilter = "all" | "active" | "draft" | "archived" | "featured";
type ProductType = "all" | "DIGITAL" | "SUBSCRIPTION" | "BUNDLE" | "SERVICE";

const typeLabels: Record<string, { label: string; color: string }> = {
  DIGITAL: { label: "Dijital", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  SUBSCRIPTION: { label: "Abonelik", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  BUNDLE: { label: "Paket", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  SERVICE: { label: "Hizmet", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Edit },
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Eye },
  ARCHIVED: { label: "Arşiv", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: Archive },
};

const iconMap: Record<string, any> = {
  server: Server,
  globe: Globe,
  cloud: Cloud,
  shield: Shield,
  cpu: Cpu,
  database: Database,
  "hard-drive": HardDrive,
  package: Package,
};

export default function AdminPIMPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>("all");
  const [typeFilter, setTypeFilter] = useState<ProductType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    nameTr: "",
    nameEn: "",
    slug: "",
    icon: "",
    description: "",
    parentId: "",
  });
  const [categoryError, setCategoryError] = useState("");

  // tRPC queries
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = trpc.pim.listProducts.useQuery({
    search: searchTerm || undefined,
    status: statusFilter !== "all" && statusFilter !== "featured" ? statusFilter.toUpperCase() as any : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    isFeatured: statusFilter === "featured" ? true : undefined,
    limit: 100,
  });

  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = trpc.pim.listCategories.useQuery({
    includeInactive: true,
  });

  // tRPC mutations
  const deleteProduct = trpc.pim.deleteProduct.useMutation({
    onSuccess: () => {
      refetchProducts();
      setSelectedProducts([]);
    },
  });

  const updateProduct = trpc.pim.updateProduct.useMutation({
    onSuccess: () => refetchProducts(),
  });

  const duplicateProduct = trpc.pim.duplicateProduct.useMutation({
    onSuccess: (product) => {
      refetchProducts();
      // Show success message (could use toast in the future)
      alert(`"${product.nameTr}" oluşturuldu. Düzenlemek için yönlendiriliyorsunuz...`);
      window.location.href = `/admin/pim/products/${product.id}`;
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const bulkUpdateProducts = trpc.pim.bulkUpdateProducts.useMutation({
    onSuccess: (result) => {
      refetchProducts();
      setSelectedProducts([]);
      alert(`${result.count} ürün başarıyla güncellendi`);
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const deleteCategory = trpc.pim.deleteCategory.useMutation({
    onSuccess: () => refetchCategories(),
  });

  const createCategory = trpc.pim.createCategory.useMutation({
    onSuccess: () => {
      setShowCategoryModal(false);
      setCategoryForm({ nameTr: "", nameEn: "", slug: "", icon: "", description: "", parentId: "" });
      setCategoryError("");
      setEditingCategory(null);
      refetchCategories();
    },
    onError: (error) => {
      setCategoryError(error.message);
    },
  });

  const updateCategory = trpc.pim.updateCategory.useMutation({
    onSuccess: () => {
      setShowCategoryModal(false);
      setCategoryForm({ nameTr: "", nameEn: "", slug: "", icon: "", description: "", parentId: "" });
      setCategoryError("");
      setEditingCategory(null);
      refetchCategories();
    },
    onError: (error) => {
      setCategoryError(error.message);
    },
  });

  // Computed stats
  const stats = useMemo(() => {
    if (!productsData?.products) return { total: 0, active: 0, draft: 0, featured: 0, revenue: 0 };

    const products = productsData.products;
    return {
      total: products.length,
      active: products.filter((p: any) => p.status === "ACTIVE").length,
      draft: products.filter((p: any) => p.status === "DRAFT").length,
      featured: products.filter((p: any) => p.isFeatured).length,
      revenue: products.reduce((sum: number, p: any) => {
        const price = p.lowestPrice || p.basePrice || 0;
        return sum + Number(price);
      }, 0),
    };
  }, [productsData]);

  const tabs = [
    { id: "overview" as Tab, label: "Genel Bakış", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "products" as Tab, label: "Ürünler", icon: <Package className="h-4 w-4" />, count: stats.total },
    { id: "categories" as Tab, label: "Kategoriler", icon: <Tag className="h-4 w-4" />, count: categoriesData?.length },
    { id: "media" as Tab, label: "Medya", icon: <Image className="h-4 w-4" /> },
  ];

  // Handlers
  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      deleteProduct.mutate({ id });
    }
  };

  const handleDuplicateProduct = (id: string, name: string) => {
    if (window.confirm(`"${name}" ürününü kopyalamak istediğinize emin misiniz?`)) {
      duplicateProduct.mutate({ id });
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`${selectedProducts.length} ürünü silmek istediğinize emin misiniz?`)) {
      selectedProducts.forEach((id) => deleteProduct.mutate({ id }));
    }
  };

  const handleBulkStatusChange = (status: "DRAFT" | "ACTIVE" | "ARCHIVED") => {
    if (selectedProducts.length === 0) return;
    bulkUpdateProducts.mutate({ ids: selectedProducts, status });
  };

  const handleBulkCategoryChange = (categoryId: string | null) => {
    if (selectedProducts.length === 0) return;
    bulkUpdateProducts.mutate({ ids: selectedProducts, categoryId });
  };

  const handleBulkFeaturedToggle = (isFeatured: boolean) => {
    if (selectedProducts.length === 0) return;
    bulkUpdateProducts.mutate({ ids: selectedProducts, isFeatured });
  };

  const handleToggleFeatured = (id: string, currentState: boolean) => {
    updateProduct.mutate({ id, isFeatured: !currentState });
  };

  const handleQuickStatusChange = (id: string, newStatus: "DRAFT" | "ACTIVE" | "ARCHIVED") => {
    updateProduct.mutate({ id, status: newStatus });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteCategory.mutate({ id });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      nameTr: category.nameTr,
      nameEn: category.nameEn,
      slug: category.slug,
      icon: category.icon || "",
      description: category.description || "",
      parentId: category.parentId || "",
    });
    setShowCategoryModal(true);
  };

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

  const handleSaveCategory = () => {
    if (!categoryForm.nameTr || !categoryForm.nameEn || !categoryForm.slug) {
      setCategoryError("Tüm zorunlu alanları doldurun");
      return;
    }

    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        ...categoryForm,
        parentId: categoryForm.parentId || undefined,
      });
    } else {
      createCategory.mutate({
        ...categoryForm,
        parentId: categoryForm.parentId || undefined,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(text);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === productsData?.products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsData?.products.map((p: any) => p.id) || []);
    }
  };

  const CategoryIcon = ({ name }: { name?: string }) => {
    const Icon = iconMap[name || "package"] || Package;
    return <Icon className="h-5 w-5" />;
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
            Ürünleri, kategorileri ve medyayı merkezi olarak yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetchProducts(); refetchCategories(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          {activeTab === "categories" && (
            <Button variant="outline" onClick={() => { setEditingCategory(null); setCategoryForm({ nameTr: "", nameEn: "", slug: "", icon: "", description: "", parentId: "" }); setShowCategoryModal(true); }}>
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
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-primary/20" : "bg-muted"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Link href="#" onClick={() => setActiveTab("products")} className="flex items-center gap-1 text-sm text-primary mt-3 hover:underline">
                Tümünü gör <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Ürün</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% yayında
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taslak</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.draft}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Edit className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Yayınlanmayı bekliyor</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kategoriler</p>
                  <p className="text-3xl font-bold mt-1">{categoriesData?.length || 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <Link href="#" onClick={() => setActiveTab("categories")} className="flex items-center gap-1 text-sm text-primary mt-3 hover:underline">
                Yönet <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Hızlı İşlemler
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/pim/products/new">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Plus className="h-5 w-5 mr-3 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Yeni Ürün</p>
                    <p className="text-xs text-muted-foreground">Ürün ekle</p>
                  </div>
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}>
                <Tag className="h-5 w-5 mr-3 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Yeni Kategori</p>
                  <p className="text-xs text-muted-foreground">Kategori oluştur</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => { setActiveTab("products"); setStatusFilter("draft"); }}>
                <Edit className="h-5 w-5 mr-3 text-yellow-500" />
                <div className="text-left">
                  <p className="font-medium">Taslakları Gör</p>
                  <p className="text-xs text-muted-foreground">{stats.draft} taslak</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => { setActiveTab("products"); setStatusFilter("featured"); }}>
                <Star className="h-5 w-5 mr-3 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium">Öne Çıkanlar</p>
                  <p className="text-xs text-muted-foreground">{stats.featured} ürün</p>
                </div>
              </Button>
            </div>
          </Card>

          {/* Recent Products */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Son Eklenen Ürünler</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("products")}>
                Tümünü Gör
              </Button>
            </div>
            {productsLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Henüz ürün yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {productsData?.products.slice(0, 5).map((product: any) => {
                  const status = statusConfig[product.status] || statusConfig.DRAFT;
                  const type = typeLabels[product.type] || { label: product.type, color: "bg-gray-100 text-gray-700" };
                  return (
                    <Link
                      key={product.id}
                      href={`/admin/pim/products/${product.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                          {product.primaryImage ? (
                            <img src={product.primaryImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.nameTr}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${type.color}`}>{type.label}</span>
                            <span className="text-xs text-muted-foreground">/{product.slug}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {product.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                        <span className="font-medium">
                          {product.lowestPrice ? `€${Number(product.lowestPrice).toFixed(2)}` : product.basePrice ? `€${Number(product.basePrice).toFixed(2)}` : "-"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün ara (isim, slug, etiket)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProductFilter)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşiv</option>
                <option value="featured">Öne Çıkan</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ProductType)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tüm Tipler</option>
                <option value="SUBSCRIPTION">Abonelik</option>
                <option value="DIGITAL">Dijital</option>
                <option value="SERVICE">Hizmet</option>
                <option value="BUNDLE">Paket</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <p className="text-sm font-medium">{selectedProducts.length} ürün seçildi</p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Change */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkStatusChange(e.target.value as any);
                      e.target.value = "";
                    }}
                    className="h-8 px-2 rounded-md border border-input bg-background text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Durum değiştir</option>
                    <option value="DRAFT">Taslak yap</option>
                    <option value="ACTIVE">Aktif yap</option>
                    <option value="ARCHIVED">Arşivle</option>
                  </select>

                  {/* Category Change */}
                  <select
                    onChange={(e) => {
                      if (e.target.value === "none") {
                        handleBulkCategoryChange(null);
                      } else if (e.target.value) {
                        handleBulkCategoryChange(e.target.value);
                      }
                      e.target.value = "";
                    }}
                    className="h-8 px-2 rounded-md border border-input bg-background text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Kategori değiştir</option>
                    <option value="none">Kategorisiz yap</option>
                    {categoriesData?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.nameTr}</option>
                    ))}
                  </select>

                  {/* Featured Toggle */}
                  <Button size="sm" variant="outline" onClick={() => handleBulkFeaturedToggle(true)}>
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    Öne Çıkar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkFeaturedToggle(false)}>
                    <StarOff className="h-4 w-4 mr-1" />
                    Çıkar
                  </Button>

                  <div className="h-4 w-px bg-border mx-1" />

                  <Button size="sm" variant="outline" onClick={() => setSelectedProducts([])}>
                    Seçimi Temizle
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Products List/Grid */}
          <Card>
            {productsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Yükleniyor...</p>
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Ürün bulunamadı</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Filtrelerinize uygun ürün yok"
                    : "İlk ürününüzü oluşturarak başlayın"}
                </p>
                {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                  <Link href="/admin/pim/products/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Ürünü Oluştur
                    </Button>
                  </Link>
                )}
              </div>
            ) : viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === productsData?.products.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Ürün</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Tip</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Kategori</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Fiyat</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">Durum</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData?.products.map((product: any) => {
                      const status = statusConfig[product.status] || statusConfig.DRAFT;
                      const type = typeLabels[product.type] || { label: product.type, color: "bg-gray-100 text-gray-700" };
                      const isSelected = selectedProducts.includes(product.id);

                      return (
                        <tr key={product.id} className={`border-b hover:bg-muted/30 ${isSelected ? "bg-primary/5" : ""}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(product.id)}
                              className="h-4 w-4 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/pim/products/${product.id}`} className="flex items-center gap-3 hover:opacity-80">
                              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.primaryImage ? (
                                  <img src={product.primaryImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium truncate">{product.nameTr}</p>
                                  {product.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    /{product.slug}
                                  </code>
                                  <button
                                    onClick={(e) => { e.preventDefault(); copyToClipboard(product.slug); }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {copiedSlug === product.slug ? (
                                      <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${type.color}`}>
                              {type.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {product.category?.nameTr || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold">
                              {product.lowestPrice ? `€${Number(product.lowestPrice).toFixed(2)}` : product.basePrice ? `€${Number(product.basePrice).toFixed(2)}` : "-"}
                            </span>
                            {product.variantCount > 1 && (
                              <span className="text-xs text-muted-foreground ml-1">({product.variantCount} varyant)</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={product.status}
                              onChange={(e) => handleQuickStatusChange(product.id, e.target.value as any)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${status.color}`}
                            >
                              <option value="DRAFT">Taslak</option>
                              <option value="ACTIVE">Aktif</option>
                              <option value="ARCHIVED">Arşiv</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                                title={product.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                              >
                                {product.isFeatured ? (
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDuplicateProduct(product.id, product.nameTr)}
                                disabled={duplicateProduct.isPending}
                                title="Kopyala"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
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
            ) : (
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsData?.products.map((product: any) => {
                  const status = statusConfig[product.status] || statusConfig.DRAFT;
                  const type = typeLabels[product.type] || { label: product.type, color: "bg-gray-100 text-gray-700" };

                  return (
                    <Card key={product.id} className="overflow-hidden group">
                      <div className="aspect-video bg-muted relative">
                        {product.primaryImage ? (
                          <img src={product.primaryImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {product.isFeatured && (
                            <span className="bg-amber-500 text-white p-1 rounded">
                              <Star className="h-3 w-3 fill-white" />
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${status.color}`}>{status.label}</span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDuplicateProduct(product.id, product.nameTr)}
                            disabled={duplicateProduct.isPending}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Kopyala
                          </Button>
                          <Link href={`/admin/pim/products/${product.id}`}>
                            <Button size="sm" variant="secondary">
                              <Edit className="h-4 w-4 mr-1" />
                              Düzenle
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${type.color}`}>{type.label}</span>
                        </div>
                        <h4 className="font-medium truncate">{product.nameTr}</h4>
                        <p className="text-lg font-bold text-primary mt-1">
                          {product.lowestPrice ? `€${Number(product.lowestPrice).toFixed(2)}` : product.basePrice ? `€${Number(product.basePrice).toFixed(2)}` : "-"}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories List */}
          <div className="lg:col-span-2">
            <Card>
              {categoriesLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Yükleniyor...</p>
                </div>
              ) : categoriesData?.length === 0 ? (
                <div className="p-12 text-center">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-1">Henüz kategori yok</p>
                  <p className="text-sm text-muted-foreground mb-4">Ürünlerinizi organize etmek için kategori oluşturun</p>
                  <Button onClick={() => setShowCategoryModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Kategoriyi Oluştur
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {categoriesData?.map((category: any) => (
                    <div key={category.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${category.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <CategoryIcon name={category.icon} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{category.nameTr}</p>
                              {!category.isActive && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Pasif</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <code className="text-xs text-muted-foreground">/{category.slug}</code>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{category._count?.products || 0} ürün</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
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
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-2 ml-13">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Category Tips */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Kategori İpuçları
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Kategoriler ürünlerinizi organize etmenizi sağlar
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  İkon ekleyerek görsel çekicilik kazandırın
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Alt kategoriler oluşturabilirsiniz
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Ürün varken kategori silinemez
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Kullanılabilir İkonlar</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(iconMap).map(([name, Icon]) => (
                  <button
                    key={name}
                    onClick={() => setCategoryForm((p) => ({ ...p, icon: name }))}
                    className="p-2 border rounded-lg hover:bg-muted transition-colors"
                    title={name}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Medya Kütüphanesi</h3>
              <p className="text-sm text-muted-foreground mt-1">Ürünlerinize ait görselleri yönetin</p>
            </div>
            <Button size="sm" disabled>
              <Plus className="h-4 w-4 mr-1" />
              Yükle (Yakında)
            </Button>
          </div>
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="font-medium mb-1">Medya kütüphanesi</p>
            <p className="text-sm text-muted-foreground mb-4">
              Şu anda medyalar ürün sayfalarından yönetilmektedir.<br />
              Merkezi medya yönetimi yakında eklenecek.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("products")}>
              Ürünlere Git
            </Button>
          </div>
        </Card>
      )}

      {/* Category Creation/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/store/category/</span>
                  <Input
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                    placeholder="web-hosting"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">İkon</label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">İkon seçin</option>
                    {Object.keys(iconMap).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Üst Kategori</label>
                  <select
                    value={categoryForm.parentId}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, parentId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Yok (Ana kategori)</option>
                    {categoriesData?.filter((c: any) => c.id !== editingCategory?.id).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.nameTr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Bu kategori hakkında kısa açıklama..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>

              {categoryForm.icon && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Önizleme:</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <CategoryIcon name={categoryForm.icon} />
                    </div>
                    <div>
                      <p className="font-medium">{categoryForm.nameTr || "Kategori Adı"}</p>
                      <code className="text-xs text-muted-foreground">/{categoryForm.slug || "slug"}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
                İptal
              </Button>
              <Button onClick={handleSaveCategory} disabled={createCategory.isPending || updateCategory.isPending}>
                {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

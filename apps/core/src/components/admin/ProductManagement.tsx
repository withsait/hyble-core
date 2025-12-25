"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image,
  Tag,
  DollarSign,
  Archive,
  Copy,
  Download,
  Upload,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  type: "PHYSICAL" | "DIGITAL" | "SERVICE" | "SUBSCRIPTION";
  category: { id: string; name: string } | null;
  images: { id: string; url: string; alt: string }[];
  inventory: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  _count: { products: number };
}

const statusColors = {
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  ACTIVE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  ARCHIVED: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

const typeLabels = {
  PHYSICAL: "Fiziksel",
  DIGITAL: "Dijital",
  SERVICE: "Hizmet",
  SUBSCRIPTION: "Abonelik",
};

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, searchQuery, statusFilter, categoryFilter, typeFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery,
        status: statusFilter,
        categoryId: categoryFilter,
        type: typeFilter,
      };
      const response = await fetch(`/api/trpc/pim.listProducts?input=${encodeURIComponent(JSON.stringify({ json: params }))}`);
      const data = await response.json();
      if (data.result?.data) {
        setProducts(data.result.data.products);
        setTotalPages(data.result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/trpc/pim.listCategories");
      const data = await response.json();
      if (data.result?.data) {
        setCategories(data.result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      await fetch("/api/trpc/pim.deleteProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id: productId } }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
    setActionMenuOpen(null);
  };

  const duplicateProduct = async (productId: string) => {
    try {
      await fetch("/api/trpc/pim.duplicateProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id: productId } }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to duplicate product:", error);
    }
    setActionMenuOpen(null);
  };

  const updateProductStatus = async (productId: string, status: Product["status"]) => {
    try {
      await fetch("/api/trpc/pim.updateProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id: productId, status } }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
    setActionMenuOpen(null);
  };

  const bulkAction = async (action: "archive" | "activate" | "delete") => {
    if (selectedProducts.length === 0) return;

    try {
      if (action === "delete") {
        if (!confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) return;
      }

      await fetch("/api/trpc/pim.bulkUpdateProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            ids: selectedProducts,
            action,
          },
        }),
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProducts(prev => [...prev, productId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Ürün Yönetimi
              </h3>
              <p className="text-sm text-slate-500">
                Tüm ürünleri yönetin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open("/admin/products/import", "_self")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Upload className="w-4 h-4" />
              İçe Aktar
            </button>
            <button
              onClick={() => window.open("/api/admin/products/export", "_blank")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button
              onClick={() => window.open("/admin/products/new", "_self")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Yeni Ürün
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, SKU veya açıklama ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              showFilters
                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                : "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>
          <button
            onClick={fetchProducts}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="DRAFT">Taslak</option>
                <option value="ACTIVE">Aktif</option>
                <option value="ARCHIVED">Arşivlenmiş</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tür</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="PHYSICAL">Fiziksel</option>
                <option value="DIGITAL">Dijital</option>
                <option value="SERVICE">Hizmet</option>
                <option value="SUBSCRIPTION">Abonelik</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setCategoryFilter("");
                  setTypeFilter("");
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Temizle
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {selectedProducts.length} ürün seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkAction("activate")}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg"
              >
                Aktifleştir
              </button>
              <button
                onClick={() => bulkAction("archive")}
                className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg"
              >
                Arşivle
              </button>
              <button
                onClick={() => bulkAction("delete")}
                className="px-3 py-1.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg"
              >
                Sil
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#0d0d14]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Ürün bulunamadı
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-[#0d0d14]">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          {product.images[0] ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                          {product.category && (
                            <p className="text-xs text-slate-500">{product.category.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                        {product.sku || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(product.price, product.currency)}
                        </p>
                        {product.comparePrice && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatCurrency(product.comparePrice, product.currency)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        product.inventory > 10 ? "text-green-600" :
                        product.inventory > 0 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {product.inventory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[product.status]}`}>
                        {product.status === "DRAFT" ? "Taslak" :
                         product.status === "ACTIVE" ? "Aktif" : "Arşiv"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {typeLabels[product.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === product.id ? null : product.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenuOpen === product.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => window.open(`/admin/products/${product.id}`, "_self")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
                              Görüntüle
                            </button>
                            <button
                              onClick={() => window.open(`/admin/products/${product.id}/edit`, "_self")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => duplicateProduct(product.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Copy className="w-4 h-4" />
                              Kopyala
                            </button>
                            <hr className="my-1 border-slate-200 dark:border-slate-700" />
                            {product.status !== "ARCHIVED" ? (
                              <button
                                onClick={() => updateProductStatus(product.id, "ARCHIVED")}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                <Archive className="w-4 h-4" />
                                Arşivle
                              </button>
                            ) : (
                              <button
                                onClick={() => updateProductStatus(product.id, "ACTIVE")}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <Tag className="w-4 h-4" />
                                Aktifleştir
                              </button>
                            )}
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Toplam {products.length} ürün
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Sayfa {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

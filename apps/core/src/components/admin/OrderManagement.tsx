"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  MoreVertical,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  currency: string;
  userId: string;
  user: { name: string | null; email: string };
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
}

const statusConfig = {
  PENDING: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock, label: "Beklemede" },
  PROCESSING: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package, label: "Hazırlanıyor" },
  SHIPPED: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck, label: "Kargoda" },
  DELIVERED: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Teslim Edildi" },
  CANCELLED: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, label: "İptal" },
  REFUNDED: { color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: RefreshCw, label: "İade" },
};

const paymentStatusColors = {
  PENDING: "text-amber-600",
  PAID: "text-green-600",
  FAILED: "text-red-600",
  REFUNDED: "text-purple-600",
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery,
        status: statusFilter,
        paymentStatus: paymentFilter,
      };
      const response = await fetch(`/api/trpc/order.list?input=${encodeURIComponent(JSON.stringify({ json: params }))}`);
      const data = await response.json();
      if (data.result?.data) {
        setOrders(data.result.data.orders);
        setTotalPages(data.result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await fetch("/api/trpc/order.updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { orderId, status } }),
      });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
    setActionMenuOpen(null);
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const printOrder = (orderId: string) => {
    window.open(`/admin/orders/${orderId}/print`, "_blank");
  };

  const exportOrders = () => {
    window.open("/api/admin/orders/export?format=csv", "_blank");
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Orders List */}
      <div className="flex-1 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Sipariş Yönetimi
                </h3>
                <p className="text-sm text-slate-500">
                  Tüm siparişleri görüntüle ve yönet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportOrders}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <Download className="w-4 h-4" />
                Dışa Aktar
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg ${
                  showFilters
                    ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtreler
              </button>
              <button
                onClick={fetchOrders}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sipariş no, müşteri adı veya email ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Sipariş Durumu</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                >
                  <option value="">Tümü</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="PROCESSING">Hazırlanıyor</option>
                  <option value="SHIPPED">Kargoda</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="CANCELLED">İptal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ödeme Durumu</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                >
                  <option value="">Tümü</option>
                  <option value="PENDING">Bekliyor</option>
                  <option value="PAID">Ödendi</option>
                  <option value="FAILED">Başarısız</option>
                  <option value="REFUNDED">İade</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setPaymentFilter("");
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Temizle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#0d0d14] sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ödeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = statusConfig[order.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50 dark:hover:bg-[#0d0d14] cursor-pointer ${
                        selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {order.user.name || "İsimsiz"}
                        </p>
                        <p className="text-xs text-slate-500">{order.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                          {order.paymentStatus === "PAID" ? "Ödendi" :
                           order.paymentStatus === "PENDING" ? "Bekliyor" :
                           order.paymentStatus === "FAILED" ? "Başarısız" : "İade"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.total, order.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === order.id ? null : order.id)}
                            className="p-2 text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionMenuOpen === order.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => printOrder(order.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <Printer className="w-4 h-4" />
                                Yazdır
                              </button>
                              <hr className="my-1 border-slate-200 dark:border-slate-700" />
                              {order.status === "PENDING" && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Package className="w-4 h-4" />
                                  Hazırlanıyor
                                </button>
                              )}
                              {order.status === "PROCESSING" && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                  <Truck className="w-4 h-4" />
                                  Kargoya Ver
                                </button>
                              )}
                              {order.status === "SHIPPED" && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Teslim Edildi
                                </button>
                              )}
                              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <XCircle className="w-4 h-4" />
                                  İptal Et
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Toplam {orders.length} sipariş
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-slate-600 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Sayfa {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-slate-600 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div className="w-96 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                #{selectedOrder.orderNumber}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <select
              value={selectedOrder.status}
              onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order["status"])}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[selectedOrder.status].color}`}
            >
              <option value="PENDING">Beklemede</option>
              <option value="PROCESSING">Hazırlanıyor</option>
              <option value="SHIPPED">Kargoda</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h5 className="text-sm font-medium text-slate-500 mb-3">Müşteri Bilgileri</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{selectedOrder.user.name || "İsimsiz"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">{selectedOrder.user.email}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div>
                <h5 className="text-sm font-medium text-slate-500 mb-3">Teslimat Adresi</h5>
                <div className="p-3 bg-slate-50 dark:bg-[#0d0d14] rounded-lg text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedOrder.shippingAddress.address1}
                  </p>
                  {selectedOrder.shippingAddress.address2 && (
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedOrder.shippingAddress.address2}
                    </p>
                  )}
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedOrder.shippingAddress.country}
                  </p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Tel: {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h5 className="text-sm font-medium text-slate-500 mb-3">Ürünler</h5>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {formatCurrency(item.unitPrice, selectedOrder.currency)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(item.total, selectedOrder.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h5 className="text-sm font-medium text-slate-500 mb-3">Özet</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ara Toplam</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vergi</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(selectedOrder.tax, selectedOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kargo</span>
                  <span className="text-slate-900 dark:text-white">
                    {selectedOrder.shipping > 0
                      ? formatCurrency(selectedOrder.shipping, selectedOrder.currency)
                      : "Ücretsiz"}
                  </span>
                </div>
                <hr className="border-slate-200 dark:border-slate-700" />
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-900 dark:text-white">Toplam</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(selectedOrder.total, selectedOrder.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <h5 className="text-sm font-medium text-slate-500 mb-3">Notlar</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => printOrder(selectedOrder.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Printer className="w-4 h-4" />
              Yazdır
            </button>
            <button
              onClick={() => window.open(`/admin/orders/${selectedOrder.id}`, "_self")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              <Eye className="w-4 h-4" />
              Detaylar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

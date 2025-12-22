"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";

type PaymentMethod = "card" | "wallet";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  thumbnail?: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    vatNumber: "",
    address: "",
    city: "",
    postalCode: "",
    country: "TR",
  });

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = 0;
  const total = subtotal - discount;
  const walletBalance = 0; // Would come from API
  const canPayWithWallet = walletBalance >= total;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!billingInfo.firstName.trim() || !billingInfo.lastName.trim()) {
      setError("Ad ve soyad zorunludur");
      return false;
    }
    if (!billingInfo.email.trim() || !billingInfo.email.includes("@")) {
      setError("Geçerli bir e-posta adresi girin");
      return false;
    }
    if (!billingInfo.address.trim() || !billingInfo.city.trim() || !billingInfo.postalCode.trim()) {
      setError("Fatura adresi bilgilerini eksiksiz doldurun");
      return false;
    }
    if (!acceptTerms) {
      setError("Kullanım şartlarını kabul etmelisiniz");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate order creation
    setTimeout(() => {
      // Clear cart
      localStorage.removeItem("cart");
      // Redirect to success
      router.push("/store/checkout/success");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-16 text-center">
            <ShoppingBag className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sepetiniz Boş
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Ödeme yapabilmek için sepetinize ürün eklemelisiniz.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Mağazaya Git
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/store/cart"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ödeme
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Billing Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                  Fatura Bilgileri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={billingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Şirket
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={billingInfo.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Vergi No
                    </label>
                    <input
                      type="text"
                      name="vatNumber"
                      value={billingInfo.vatNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Adres *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Şehir *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Posta Kodu *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={billingInfo.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ülke *
                    </label>
                    <select
                      name="country"
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="TR">Türkiye</option>
                      <option value="GB">Birleşik Krallık</option>
                      <option value="DE">Almanya</option>
                      <option value="FR">Fransa</option>
                      <option value="NL">Hollanda</option>
                      <option value="US">Amerika Birleşik Devletleri</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                  Ödeme Yöntemi
                </h2>
                <div className="space-y-3">
                  {/* Credit Card */}
                  <label
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-blue-600" : "text-slate-400"}`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">Kredi / Banka Kartı</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Visa, Mastercard, American Express
                      </p>
                    </div>
                  </label>

                  {/* Wallet */}
                  <label
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "wallet"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    } ${!canPayWithWallet ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={() => canPayWithWallet && setPaymentMethod("wallet")}
                      disabled={!canPayWithWallet}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === "wallet" ? "bg-blue-100 dark:bg-blue-900" : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                      <span className="text-lg">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">Hyble Cüzdan</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Bakiye: €{walletBalance.toFixed(2)}
                        {!canPayWithWallet && " (Yetersiz bakiye)"}
                      </p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Terms */}
              <Card className="p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    <Link href="/legal/terms" className="text-blue-600 hover:underline">Kullanım Şartları</Link>&apos;nı
                    ve <Link href="/legal/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası</Link>&apos;nı
                    okudum ve kabul ediyorum. Dijital ürünler için 14 günlük cayma hakkımdan feragat ediyorum.
                  </span>
                </label>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Sipariş Özeti
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.quantity}x €{item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        €{(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700 mb-4" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Ara Toplam</span>
                    <span className="text-slate-900 dark:text-white">€{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">İndirim</span>
                      <span className="text-green-600 dark:text-green-400">-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Toplam</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !acceptTerms}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Ödemeyi Tamamla
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>256-bit SSL ile korunuyor</span>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

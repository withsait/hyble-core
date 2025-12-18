"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Loader2,
  Package,
  ShoppingCart,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
} from "lucide-react";

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";

interface Product {
  id: string;
  slug: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  demoUrl: string | null;
  lowestPrice: number | null;
  category: {
    nameTr: string;
    slug: string;
  } | null;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceType, { width: string; height: string; label: string }> = {
  desktop: { width: "100%", height: "100%", label: "Masaüstü" },
  tablet: { width: "768px", height: "1024px", label: "Tablet" },
  mobile: { width: "375px", height: "812px", label: "Mobil" },
};

export default function DemoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/public/products/${slug}`);
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Demo yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Refresh iframe
  const refreshPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Demo yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (error === "not_found" || !product) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Ürün Bulunamadı</h1>
        <p className="text-slate-400 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link
          href="/store"
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mağazaya Dön
        </Link>
      </div>
    );
  }

  // No demo URL state
  if (!product.demoUrl) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Monitor className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Demo Mevcut Değil</h1>
        <p className="text-slate-400 mb-6 text-center max-w-md">
          Bu ürün için henüz canlı demo bulunmuyor. Ürün detaylarını inceleyebilir veya satın alabilirsiniz.
        </p>
        <div className="flex gap-3">
          <Link
            href={`/store/${product.slug}`}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ürün Detayları
          </Link>
          <Link
            href="/store"
            className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
          >
            Mağazaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Header Toolbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left - Back & Product Info */}
          <div className="flex items-center gap-4">
            <Link
              href={`/store/${product.slug}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Geri</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-700" />
            <div className="hidden sm:block">
              <h1 className="text-white font-medium text-sm">{product.nameTr}</h1>
              {product.category && (
                <p className="text-slate-500 text-xs">{product.category.nameTr}</p>
              )}
            </div>
          </div>

          {/* Center - Device Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
            {(Object.keys(deviceSizes) as DeviceType[]).map((d) => {
              const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`p-2 rounded-md transition-colors ${
                    device === d
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={deviceSizes[d].label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPreview}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Yenile"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="hidden sm:block h-6 w-px bg-slate-700 mx-2" />
            <Link
              href={`https://id.hyble.co/auth/register?product=${product.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {product.lowestPrice ? `€${product.lowestPrice.toFixed(2)} - Satın Al` : "Satın Al"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 flex items-center justify-center p-4 bg-slate-900 overflow-hidden">
        <div
          className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
            device === "desktop" ? "w-full h-full" : ""
          }`}
          style={{
            width: device !== "desktop" ? deviceSizes[device].width : "100%",
            height: device !== "desktop" ? deviceSizes[device].height : "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Device Frame for Mobile/Tablet */}
          {device !== "desktop" && (
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-center">
              <div className="w-20 h-1 bg-slate-600 rounded-full" />
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={product.demoUrl}
            className="w-full h-full border-0"
            style={{
              height: device !== "desktop" ? `calc(100% - 32px)` : "100%",
            }}
            title={`${product.nameTr} Demo`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </main>

      {/* Bottom Info Bar */}
      <footer className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Görüntüleme: <span className="text-white">{deviceSizes[device].label}</span>
            </span>
            {device !== "desktop" && (
              <span>
                Boyut: <span className="text-white">{deviceSizes[device].width} × {deviceSizes[device].height}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            <span>Demo aktif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  ArrowLeft, ShoppingCart, Package, Check, Star,
  ChevronRight, Info, Zap, Shield, Clock, Globe,
  Server, Gamepad2, Layout, Database, Rocket,
  CheckCircle2, XCircle, HelpCircle, ArrowRight
} from "lucide-react";

// Örnek ürün verileri (gerçekte API'den gelecek)
const productsData: Record<string, {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  billingPeriod?: "monthly" | "annually" | "once";
  image: string | null;
  badge?: string;
  features: string[];
  specs: { label: string; value: string }[];
  variants?: { name: string; price: number; features: string[] }[];
  faqs: { question: string; answer: string }[];
}> = {
  "starter-business-website": {
    slug: "starter-business-website",
    name: "Business Starter",
    description: "Küçük işletmeler için profesyonel web sitesi şablonu",
    longDescription: "Business Starter, küçük ve orta ölçekli işletmeler için tasarlanmış modern ve profesyonel bir web sitesi şablonudur. Responsive tasarımı sayesinde tüm cihazlarda mükemmel görünür. SEO optimizasyonu ile arama motorlarında üst sıralarda yer alın.",
    category: "Web Sitesi Şablonları",
    categorySlug: "website-templates",
    price: 49,
    originalPrice: 79,
    billingPeriod: "once",
    image: null,
    badge: "En Çok Satan",
    features: [
      "Responsive tasarım",
      "SEO optimizasyonu",
      "5 hazır sayfa",
      "İletişim formu",
      "Google Maps entegrasyonu",
      "Sosyal medya ikonları",
      "Blog bölümü",
      "Hızlı yükleme",
    ],
    specs: [
      { label: "Framework", value: "Next.js 14" },
      { label: "Styling", value: "Tailwind CSS" },
      { label: "Dil Desteği", value: "TR, EN" },
      { label: "Destek", value: "6 ay" },
      { label: "Güncellemeler", value: "Ömür boyu" },
    ],
    faqs: [
      { question: "Kurulum desteği var mı?", answer: "Evet, satın alma sonrası ücretsiz kurulum desteği sağlıyoruz." },
      { question: "Özelleştirme yapabilir miyim?", answer: "Evet, tüm kaynak kodlarına erişiminiz olacak ve istediğiniz gibi özelleştirebilirsiniz." },
      { question: "Lisans kaç site için geçerli?", answer: "Her lisans tek bir site için geçerlidir. Birden fazla site için ek lisans satın almanız gerekir." },
    ],
  },
  "ecommerce-starter": {
    slug: "ecommerce-starter",
    name: "E-commerce Starter",
    description: "Hızlı başlangıç için e-ticaret şablonu",
    longDescription: "E-commerce Starter, online mağazanızı hızlıca kurmanız için ihtiyacınız olan her şeyi içerir. Ürün yönetimi, sepet sistemi, ödeme entegrasyonu ve daha fazlası hazır olarak gelir.",
    category: "E-ticaret Şablonları",
    categorySlug: "ecommerce",
    price: 89,
    originalPrice: 129,
    billingPeriod: "once",
    image: null,
    badge: "Yeni",
    features: [
      "Stripe ödeme entegrasyonu",
      "Ürün yönetimi",
      "Stok takibi",
      "Sepet sistemi",
      "Sipariş yönetimi",
      "Müşteri paneli",
      "Admin dashboard",
      "E-posta bildirimleri",
    ],
    specs: [
      { label: "Framework", value: "Next.js 14" },
      { label: "Veritabanı", value: "PostgreSQL" },
      { label: "Ödeme", value: "Stripe" },
      { label: "Destek", value: "6 ay" },
      { label: "Güncellemeler", value: "Ömür boyu" },
    ],
    faqs: [
      { question: "Stripe dışında başka ödeme yöntemi var mı?", answer: "Şu an Stripe desteklenmektedir. İyzico entegrasyonu yakında eklenecek." },
      { question: "Kaç ürün ekleyebilirim?", answer: "Sınırsız ürün ekleyebilirsiniz, hosting planınıza bağlı olarak." },
    ],
  },
  "vps-basic": {
    slug: "vps-basic",
    name: "VPS Basic",
    description: "2 vCPU, 4GB RAM, 80GB SSD",
    longDescription: "VPS Basic, küçük ve orta ölçekli projeler için ideal bir sanal sunucu çözümüdür. Yüksek performanslı SSD depolama, garantili kaynaklar ve tam root erişimi ile projelerinizi güvenle barındırın.",
    category: "VPS Sunucular",
    categorySlug: "vps",
    price: 9.99,
    billingPeriod: "monthly",
    image: null,
    features: [
      "2 vCPU",
      "4GB RAM",
      "80GB NVMe SSD",
      "2TB Bandwidth",
      "1 IPv4 Adres",
      "Root Erişimi",
      "DDoS Koruması",
      "99.9% Uptime",
    ],
    specs: [
      { label: "CPU", value: "2 vCPU (Intel Xeon)" },
      { label: "RAM", value: "4GB DDR4" },
      { label: "Depolama", value: "80GB NVMe SSD" },
      { label: "Bandwidth", value: "2TB / ay" },
      { label: "Lokasyon", value: "Almanya (Hetzner)" },
    ],
    variants: [
      { name: "Basic", price: 9.99, features: ["2 vCPU", "4GB RAM", "80GB SSD"] },
      { name: "Standard", price: 19.99, features: ["4 vCPU", "8GB RAM", "160GB SSD"] },
      { name: "Pro", price: 39.99, features: ["8 vCPU", "16GB RAM", "320GB SSD"] },
    ],
    faqs: [
      { question: "Hangi işletim sistemlerini yükleyebilirim?", answer: "Ubuntu, Debian, CentOS, Rocky Linux ve Windows Server kurabilirsiniz." },
      { question: "Sunucuyu ne kadar sürede teslim alırım?", answer: "Ödeme onayından sonra sunucunuz 1-5 dakika içinde hazır olur." },
    ],
  },
  "minecraft-starter": {
    slug: "minecraft-starter",
    name: "Minecraft Starter",
    description: "10 slot, 2GB RAM",
    longDescription: "Minecraft Starter, arkadaşlarınızla oynamak veya küçük bir topluluk oluşturmak için ideal bir başlangıç paketidir. Tek tıkla kurulum, mod desteği ve 7/24 uptime garantisi ile sorunsuz oyun deneyimi.",
    category: "Oyun Sunucuları",
    categorySlug: "game-servers",
    price: 2.99,
    billingPeriod: "monthly",
    image: null,
    badge: "Popüler",
    features: [
      "10 Oyuncu Slot",
      "2GB RAM",
      "Tek Tıkla Kurulum",
      "Mod Desteği (Forge, Fabric)",
      "Plugin Desteği",
      "DDoS Koruması",
      "Otomatik Yedekleme",
      "Ücretsiz Subdomain",
    ],
    specs: [
      { label: "Oyuncu", value: "10 Slot" },
      { label: "RAM", value: "2GB DDR4" },
      { label: "Depolama", value: "10GB SSD" },
      { label: "Versiyon", value: "Java & Bedrock" },
      { label: "Lokasyon", value: "Almanya" },
    ],
    variants: [
      { name: "Starter", price: 2.99, features: ["10 Slot", "2GB RAM", "10GB SSD"] },
      { name: "Standard", price: 5.99, features: ["20 Slot", "4GB RAM", "20GB SSD"] },
      { name: "Pro", price: 9.99, features: ["50 Slot", "8GB RAM", "40GB SSD"] },
      { name: "Ultimate", price: 19.99, features: ["100 Slot", "16GB RAM", "80GB SSD"] },
    ],
    faqs: [
      { question: "Hangi Minecraft versiyonlarını destekliyorsunuz?", answer: "Java Edition ve Bedrock Edition desteklenmektedir." },
      { question: "Modlu sunucu kurabilir miyim?", answer: "Evet, Forge ve Fabric modloader desteği mevcuttur." },
    ],
  },
  "saas-landing": {
    slug: "saas-landing",
    name: "SaaS Landing",
    description: "SaaS ürünleri için modern landing page",
    longDescription: "SaaS Landing, yazılım ürünlerinizi tanıtmak için tasarlanmış modern ve dönüşüm odaklı bir şablondur. Animasyonlar, dark mode desteği ve optimize edilmiş CTA alanları ile ziyaretçilerinizi müşteriye dönüştürün.",
    category: "Landing Page",
    categorySlug: "landing-pages",
    price: 39,
    originalPrice: 59,
    billingPeriod: "once",
    image: null,
    features: [
      "Modern tasarım",
      "Framer Motion animasyonları",
      "Dark/Light mode",
      "Optimize edilmiş CTA",
      "Testimonial bölümü",
      "Fiyatlandırma tablosu",
      "FAQ bölümü",
      "Newsletter formu",
    ],
    specs: [
      { label: "Framework", value: "Next.js 14" },
      { label: "Styling", value: "Tailwind CSS" },
      { label: "Animasyon", value: "Framer Motion" },
      { label: "Destek", value: "6 ay" },
    ],
    faqs: [
      { question: "Tasarımı değiştirebilir miyim?", answer: "Evet, Tailwind CSS ile kolayca özelleştirebilirsiniz." },
    ],
  },
  "web-hosting-pro": {
    slug: "web-hosting-pro",
    name: "Web Hosting Pro",
    description: "50GB SSD, Sınırsız bandwidth",
    longDescription: "Web Hosting Pro, küçük ve orta ölçekli web siteleri için ideal bir paylaşımlı hosting çözümüdür. cPanel kontrolü, ücretsiz SSL ve sınırsız e-posta hesabı ile web sitenizi kolayca yönetin.",
    category: "Web Hosting",
    categorySlug: "web-hosting",
    price: 4.99,
    billingPeriod: "monthly",
    image: null,
    features: [
      "50GB SSD Depolama",
      "Sınırsız Bandwidth",
      "cPanel Kontrolü",
      "Ücretsiz SSL",
      "10 E-posta Hesabı",
      "5 Veritabanı",
      "Günlük Yedekleme",
      "99.9% Uptime",
    ],
    specs: [
      { label: "Depolama", value: "50GB SSD" },
      { label: "Bandwidth", value: "Sınırsız" },
      { label: "E-posta", value: "10 Hesap" },
      { label: "Veritabanı", value: "5 MySQL" },
      { label: "PHP", value: "8.x" },
    ],
    variants: [
      { name: "Starter", price: 2.99, features: ["20GB SSD", "5 E-posta", "2 Veritabanı"] },
      { name: "Pro", price: 4.99, features: ["50GB SSD", "10 E-posta", "5 Veritabanı"] },
      { name: "Business", price: 9.99, features: ["100GB SSD", "Sınırsız E-posta", "Sınırsız Veritabanı"] },
    ],
    faqs: [
      { question: "WordPress kurabilir miyim?", answer: "Evet, Softaculous ile tek tıkla WordPress kurabilirsiniz." },
      { question: "Site taşıma hizmeti var mı?", answer: "Evet, ücretsiz site taşıma hizmeti sunuyoruz." },
    ],
  },
};

// Kategori ikonları
const categoryIcons: Record<string, typeof Layout> = {
  "website-templates": Layout,
  "ecommerce": Package,
  "landing-pages": Rocket,
  "vps": Server,
  "web-hosting": Globe,
  "game-servers": Gamepad2,
  "ssl": Shield,
  "database": Database,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData[slug];

  if (!product) {
    return { title: "Ürün Bulunamadı | Hyble" };
  }

  return {
    title: `${product.name} | Hyble Mağaza`,
    description: product.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(productsData).map((slug) => ({ slug }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = productsData[slug];

  if (!product) {
    notFound();
  }

  const CategoryIcon = categoryIcons[product.categorySlug] || Package;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/store" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Mağaza
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href={`/store/category/${product.categorySlug}`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Image */}
            <div>
              <Card className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 relative overflow-hidden">
                <Package className="w-24 h-24 text-slate-300 dark:text-slate-600" />
                {product.badge && (
                  <span className={`absolute top-4 right-4 text-sm px-3 py-1 rounded-full font-medium ${
                    product.badge === "Popüler" || product.badge === "En Çok Satan"
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                  }`}>
                    {product.badge}
                  </span>
                )}
              </Card>

              {/* Specs */}
              <Card className="mt-6 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Teknik Özellikler
                </h3>
                <div className="space-y-3">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{spec.label}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right - Info & Purchase */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CategoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                {product.longDescription}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  €{product.price}
                </span>
                {product.billingPeriod && product.billingPeriod !== "once" && (
                  <span className="text-lg text-slate-500 dark:text-slate-400">
                    /{product.billingPeriod === "monthly" ? "ay" : "yıl"}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xl text-slate-400 line-through">
                    €{product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-sm px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    %{Math.round((1 - product.price / product.originalPrice) * 100)} indirim
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Plan Seçin
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant, i) => (
                      <button
                        key={i}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          i === 0
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          {variant.name}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          €{variant.price}
                          {product.billingPeriod && product.billingPeriod !== "once" && (
                            <span className="text-sm font-normal text-slate-500">/ay</span>
                          )}
                        </p>
                        <div className="mt-2 space-y-1">
                          {variant.features.map((f, j) => (
                            <p key={j} className="text-xs text-slate-500 dark:text-slate-400">
                              {f}
                            </p>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href="https://id.hyble.co/auth/register"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Satın Al
                </a>
                <Link
                  href="/contact"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  Soru Sor
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, text: "Anında Aktivasyon" },
                  { icon: Shield, text: "Güvenli Ödeme" },
                  { icon: Clock, text: "7/24 Destek" },
                  { icon: Star, text: "30 Gün İade" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <badge.icon className="w-4 h-4 text-green-500" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Özellikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.features.map((feature, i) => (
              <Card key={i} className="p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {product.faqs.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-4">
              {product.faqs.map((faq, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Diğer ürünlerimizi de keşfedin
          </h2>
          <p className="text-blue-100 mb-8">
            İhtiyaçlarınıza uygun daha fazla ürün ve çözüm bulun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/store"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Mağazaya Dön
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/store/category/${product.categorySlug}`}
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              {product.category}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

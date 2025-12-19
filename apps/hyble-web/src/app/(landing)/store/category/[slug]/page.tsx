import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  ArrowLeft, Package, ChevronRight, Search, SlidersHorizontal,
  Layout, ShoppingCart, Rocket, Server, Globe, Gamepad2,
  Shield, Database, ArrowUpDown, Grid3X3, List, Star
} from "lucide-react";

// Kategori verileri - Şablon odaklı (Oyun sunucuları gaming.hyble.co'da)
const categoriesData: Record<string, {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  icon: typeof Layout;
  products: {
    slug: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    billingPeriod?: "monthly" | "annually" | "once";
    badge?: string;
    features: string[];
    rating?: number;
    reviewCount?: number;
  }[];
}> = {
  "website-templates": {
    slug: "website-templates",
    name: "Web Sitesi Şablonları",
    description: "Kurumsal ve kişisel web siteleri için hazır şablonlar",
    longDescription: "Profesyonel web sitesi şablonlarımız ile dakikalar içinde online olun. SEO optimize, responsive ve modern tasarımlar.",
    icon: Layout,
    products: [
      {
        slug: "starter-business-website",
        name: "Business Starter",
        description: "Küçük işletmeler için profesyonel web sitesi",
        price: 49,
        originalPrice: 79,
        billingPeriod: "once",
        badge: "En Çok Satan",
        features: ["5 Sayfa", "SEO Optimize", "Responsive"],
        rating: 4.8,
        reviewCount: 124,
      },
      {
        slug: "corporate-pro",
        name: "Corporate Pro",
        description: "Büyük firmalar için kurumsal web sitesi",
        price: 149,
        originalPrice: 199,
        billingPeriod: "once",
        features: ["15+ Sayfa", "Blog Sistemi", "Çoklu Dil"],
        rating: 4.9,
        reviewCount: 89,
      },
      {
        slug: "portfolio-starter",
        name: "Portfolio Starter",
        description: "Freelancerlar için portfolio sitesi",
        price: 39,
        billingPeriod: "once",
        features: ["Galeri", "İletişim Formu", "Dark Mode"],
        rating: 4.7,
        reviewCount: 67,
      },
      {
        slug: "agency-starter",
        name: "Agency Template",
        description: "Dijital ajanslar için modern tasarım",
        price: 89,
        originalPrice: 119,
        billingPeriod: "once",
        badge: "Yeni",
        features: ["Case Study", "Team Section", "Animasyonlar"],
        rating: 4.6,
        reviewCount: 45,
      },
    ],
  },
  "ecommerce": {
    slug: "ecommerce",
    name: "E-ticaret Şablonları",
    description: "Online mağaza ve e-ticaret çözümleri",
    longDescription: "Hazır e-ticaret şablonları ile hemen satışa başlayın. Ödeme entegrasyonu, stok yönetimi ve sipariş takibi dahil.",
    icon: ShoppingCart,
    products: [
      {
        slug: "ecommerce-starter",
        name: "E-commerce Starter",
        description: "Hızlı başlangıç için e-ticaret şablonu",
        price: 89,
        originalPrice: 129,
        billingPeriod: "once",
        badge: "Popüler",
        features: ["Stripe Entegrasyonu", "Stok Takibi", "Sipariş Yönetimi"],
        rating: 4.8,
        reviewCount: 156,
      },
      {
        slug: "fashion-store",
        name: "Fashion Store",
        description: "Moda ve giyim mağazaları için",
        price: 129,
        billingPeriod: "once",
        features: ["Lookbook", "Size Guide", "Wishlist"],
        rating: 4.7,
        reviewCount: 78,
      },
      {
        slug: "digital-products",
        name: "Digital Products",
        description: "Dijital ürün satışı için optimize",
        price: 79,
        billingPeriod: "once",
        features: ["Otomatik Teslimat", "Lisans Yönetimi", "Download Portal"],
        rating: 4.6,
        reviewCount: 92,
      },
    ],
  },
  "landing-pages": {
    slug: "landing-pages",
    name: "Landing Page Şablonları",
    description: "Dönüşüm odaklı landing page tasarımları",
    longDescription: "Yüksek dönüşüm oranları için optimize edilmiş landing page şablonları. A/B test ready, hızlı yükleme.",
    icon: Rocket,
    products: [
      {
        slug: "saas-landing",
        name: "SaaS Landing",
        description: "SaaS ürünleri için modern landing page",
        price: 39,
        originalPrice: 59,
        billingPeriod: "once",
        badge: "En Çok Satan",
        features: ["Pricing Table", "Feature Grid", "Testimonials"],
        rating: 4.9,
        reviewCount: 203,
      },
      {
        slug: "app-landing",
        name: "App Landing",
        description: "Mobil uygulamalar için tanıtım sayfası",
        price: 49,
        billingPeriod: "once",
        features: ["App Store Badges", "Screenshots", "Features"],
        rating: 4.7,
        reviewCount: 134,
      },
      {
        slug: "product-launch",
        name: "Product Launch",
        description: "Ürün lansmanları için countdown sayfası",
        price: 29,
        billingPeriod: "once",
        badge: "Yeni",
        features: ["Countdown Timer", "Email Capture", "Social Share"],
        rating: 4.5,
        reviewCount: 56,
      },
      {
        slug: "webinar-landing",
        name: "Webinar Landing",
        description: "Online etkinlikler için kayıt sayfası",
        price: 35,
        billingPeriod: "once",
        features: ["Registration Form", "Calendar Integration", "Reminder"],
        rating: 4.6,
        reviewCount: 67,
      },
    ],
  },
  "saas-templates": {
    slug: "saas-templates",
    name: "SaaS Şablonları",
    description: "Hazır SaaS uygulama şablonları",
    longDescription: "Full-stack SaaS şablonları ile haftalar yerine günler içinde ürününüzü piyasaya sürün. Auth, billing, dashboard dahil.",
    icon: Server,
    products: [
      {
        slug: "saas-starter-kit",
        name: "SaaS Starter Kit",
        description: "Next.js + Prisma + Auth tam paket",
        price: 149,
        originalPrice: 199,
        billingPeriod: "once",
        badge: "En Çok Satan",
        features: ["Next.js 14", "Prisma ORM", "NextAuth.js"],
        rating: 4.9,
        reviewCount: 312,
      },
      {
        slug: "saas-enterprise",
        name: "SaaS Enterprise",
        description: "Multi-tenant mimari ile kurumsal SaaS",
        price: 299,
        originalPrice: 399,
        billingPeriod: "once",
        features: ["Multi-tenant", "Stripe Billing", "Admin Panel"],
        rating: 4.8,
        reviewCount: 145,
      },
      {
        slug: "api-boilerplate",
        name: "API Boilerplate",
        description: "REST & GraphQL API şablonu",
        price: 79,
        billingPeriod: "once",
        features: ["REST + GraphQL", "Rate Limiting", "API Keys"],
        rating: 4.7,
        reviewCount: 89,
      },
      {
        slug: "dashboard-kit",
        name: "Dashboard Kit",
        description: "Admin dashboard şablonu",
        price: 99,
        originalPrice: 129,
        billingPeriod: "once",
        badge: "Popüler",
        features: ["Charts", "Data Tables", "Dark Mode"],
        rating: 4.8,
        reviewCount: 234,
      },
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoriesData[slug];

  if (!category) {
    return { title: "Kategori Bulunamadı | Hyble" };
  }

  return {
    title: `${category.name} | Hyble Mağaza`,
    description: category.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(categoriesData).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoriesData[slug];

  if (!category) {
    notFound();
  }

  const CategoryIcon = category.icon;

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
            <span className="text-slate-900 dark:text-white font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CategoryIcon className="w-7 h-7 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {category.products.length} ürün
              </p>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
            {category.longDescription}
          </p>
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`${category.name} içinde ara...`}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg">
                <SlidersHorizontal className="w-4 h-4" />
                Filtrele
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg">
                <ArrowUpDown className="w-4 h-4" />
                Sırala
              </button>
              <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                <button className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <Link
                key={product.slug}
                href={`/store/${product.slug}`}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    {product.badge && (
                      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
                        product.badge === "Popüler" || product.badge === "En Çok Satan"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                          : product.badge === "Yeni"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {product.rating}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        €{product.price}
                      </span>
                      {product.billingPeriod && (
                        <span className="text-sm text-slate-500">
                          /{product.billingPeriod === "monthly" ? "ay" : product.billingPeriod === "annually" ? "yıl" : ""}
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          €{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Related Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Diğer Kategoriler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(categoriesData)
              .filter((c) => c.slug !== slug)
              .slice(0, 4)
              .map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/store/category/${cat.slug}`}
                    className="group"
                  >
                    <Card className="p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <CatIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {cat.products.length} ürün
                      </p>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}

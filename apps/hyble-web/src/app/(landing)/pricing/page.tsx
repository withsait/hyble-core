import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Server, Layout, Shield, CreditCard, Key, Activity,
  ArrowRight, Cloud, Gamepad2, Check
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlandırma | Hyble",
  description: "Hyble ürün ve hizmetlerinin fiyatlandırması. Cloud hosting, şablonlar ve ekosistem çözümleri.",
};

const pricingCategories = [
  {
    icon: Cloud,
    name: "Cloud Hosting",
    description: "VPS sunucular, web hosting ve managed database",
    price: "€1.99",
    sub: "/aydan",
    href: "/cloud/pricing",
    color: "blue",
    features: ["Cloud VPS", "Web Hosting", "Managed Database"],
  },
  {
    icon: Layout,
    name: "Şablonlar",
    description: "Hazır web sitesi, e-ticaret ve SaaS şablonları",
    price: "€19",
    sub: "tek seferlik",
    href: "/store",
    color: "purple",
    features: ["Web Sitesi", "E-ticaret", "Landing Page", "SaaS"],
  },
  {
    icon: Gamepad2,
    name: "Oyun Sunucuları",
    description: "Minecraft, FiveM ve diğer oyun sunucuları",
    price: "€2.99",
    sub: "/aydan",
    href: "https://game.hyble.co",
    color: "emerald",
    features: ["Minecraft", "FiveM", "Rust", "CS2"],
    external: true,
  },
];

const ecosystemServices = [
  {
    icon: Shield,
    name: "Hyble ID",
    description: "Kimlik yönetimi ve SSO",
    free: "1K MAU",
    pro: "€29/ay",
    href: "/solutions/id",
  },
  {
    icon: CreditCard,
    name: "Hyble Wallet",
    description: "Ödeme altyapısı",
    free: "3% komisyon",
    pro: "€49/ay",
    href: "/solutions/wallet",
  },
  {
    icon: Key,
    name: "Hyble License",
    description: "Lisans yönetimi",
    free: "100 lisans",
    pro: "€19/ay",
    href: "/solutions/license",
  },
  {
    icon: Activity,
    name: "Hyble Status",
    description: "Uptime monitoring",
    free: "5 monitör",
    pro: "€9/ay",
    href: "/solutions/status",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Fiyatlandırma
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Şeffaf fiyatlandırma, gizli ücret yok. İhtiyacınıza göre en uygun planı seçin.
          </p>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingCategories.map((category) => {
              const isExternal = "external" in category && category.external;
              const LinkComponent = isExternal ? "a" : Link;
              const linkProps = isExternal
                ? { href: category.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: category.href };

              return (
                <LinkComponent
                  key={category.name}
                  {...linkProps}
                  className="group"
                >
                  <Card className="p-8 h-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-lg">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      category.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : category.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                    }`}>
                      <category.icon className={`w-7 h-7 ${
                        category.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : category.color === "purple"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`} />
                    </div>

                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-slate-500 mb-4">{category.description}</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {category.price}
                      </span>
                      <span className="text-slate-500">{category.sub}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {category.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Check className="w-4 h-4 text-slate-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                      Fiyatları Gör
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </LinkComponent>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Services */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Ekosistem Hizmetleri
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Tüm hizmetlerde ücretsiz tier ile başlayın
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemServices.map((service) => (
              <Link key={service.name} href={service.href} className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <service.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{service.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Free</span>
                      <span className="text-slate-700 dark:text-slate-300">{service.free}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pro</span>
                      <span className="font-medium text-slate-900 dark:text-white">{service.pro}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Tüm çözümleri incele
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Kurumsal ihtiyaçlarınız mı var?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Özel fiyatlandırma, SLA garantisi ve dedicated kaynaklar için satış ekibimizle görüşün.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ücretsiz Başla
            </a>
            <Link
              href="/contact"
              className="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Satışla Görüşün
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

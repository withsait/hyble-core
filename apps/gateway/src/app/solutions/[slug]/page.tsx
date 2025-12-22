import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Button } from "@hyble/ui";
import {
  Shield, Key, CreditCard, Cloud, Gamepad2, Server,
  Activity, Wrench, ArrowRight, ArrowLeft, CheckCircle2,
  Zap, Lock, Globe, Code, FileCode, Terminal, Sparkles,
  Users, Building2, Rocket, ExternalLink
} from "lucide-react";

// Solutions data
const solutionsData: Record<string, {
  icon: typeof Shield;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  features: { title: string; description: string }[];
  useCases: { icon: typeof Users; title: string; description: string }[];
  integrations: string[];
  pricing: { type: string; price: string; description: string };
  color: string;
  bgColor: string;
  status: "active" | "coming_soon";
  docsUrl?: string;
}> = {
  id: {
    icon: Shield,
    name: "Hyble ID",
    tagline: "Tek kimlik, tüm erişim",
    description: "OAuth 2.0, OpenID Connect, MFA ve SSO desteği ile güvenli kimlik doğrulama.",
    longDescription: "Hyble ID, modern uygulamalar için tasarlanmış kapsamlı bir kimlik doğrulama ve yetkilendirme platformudur. OAuth 2.0 ve OpenID Connect standartlarını destekler, çok faktörlü kimlik doğrulama (MFA) ve Single Sign-On (SSO) özellikleri sunar. Kullanıcılarınızı güvenle yönetin, erişim kontrollerini kolayca yapılandırın.",
    features: [
      { title: "OAuth 2.0 & OpenID Connect", description: "Endüstri standardı protokollerle güvenli kimlik doğrulama" },
      { title: "Multi-Factor Authentication", description: "TOTP, SMS, Email ile ek güvenlik katmanı" },
      { title: "Single Sign-On (SSO)", description: "Tek oturumla tüm uygulamalara erişim" },
      { title: "Rol Tabanlı Erişim", description: "Granüler izin yönetimi ve rol atamaları" },
      { title: "Sosyal Giriş", description: "Google, GitHub, Discord entegrasyonları" },
      { title: "Passwordless", description: "Magic link ve biometrik giriş desteği" },
    ],
    useCases: [
      { icon: Building2, title: "SaaS Uygulamaları", description: "Müşterileriniz için güvenli kimlik doğrulama" },
      { icon: Users, title: "Kurumsal Portallar", description: "Çalışan ve partner erişim yönetimi" },
      { icon: Rocket, title: "Startuplar", description: "Hızlı entegrasyon, ölçeklenebilir altyapı" },
    ],
    integrations: ["Next.js", "React", "Node.js", "Python", "PHP", "REST API"],
    pricing: { type: "Kullanım Bazlı", price: "€0.01", description: "aktif kullanıcı başına / ay" },
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    status: "active",
    docsUrl: "https://docs.hyble.co/id",
  },
  license: {
    icon: Key,
    name: "Hyble License",
    tagline: "Yazılımınızı koruyun",
    description: "Yazılım lisanslama ve aktivasyon sistemi.",
    longDescription: "Hyble License, yazılım ürünlerinizi korumak ve lisanslamak için geliştirilmiş kapsamlı bir sistemdir. Lisans anahtarları oluşturun, aktivasyonları yönetin, abonelik bazlı veya kalıcı lisanslar tanımlayın. API ile kolayca entegre edin.",
    features: [
      { title: "Lisans Anahtarı Oluşturma", description: "Özelleştirilebilir formatlarda güvenli anahtarlar" },
      { title: "Aktivasyon Kontrolü", description: "Online ve offline aktivasyon desteği" },
      { title: "Abonelik Yönetimi", description: "Yenileme, iptal, duraklatma işlemleri" },
      { title: "Özellik Kilitleme", description: "Lisans tipine göre özellik erişimi" },
      { title: "Donanım Kilidi", description: "Cihaza bağlı lisans doğrulama" },
      { title: "Trial Yönetimi", description: "Deneme sürümü süre ve özellik limitleri" },
    ],
    useCases: [
      { icon: Code, title: "Masaüstü Yazılımlar", description: "Windows, Mac, Linux uygulamaları" },
      { icon: Building2, title: "Enterprise Çözümler", description: "Kurumsal yazılım lisanslama" },
      { icon: FileCode, title: "SaaS Ürünler", description: "Tier bazlı özellik yönetimi" },
    ],
    integrations: ["C#/.NET", "Java", "Python", "Node.js", "REST API"],
    pricing: { type: "Sabit", price: "€19", description: "/ ay, 1000 lisansa kadar" },
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    status: "active",
    docsUrl: "https://docs.hyble.co/license",
  },
  wallet: {
    icon: CreditCard,
    name: "Hyble Wallet",
    tagline: "Ödemeler kolaylaştı",
    description: "Entegre ödeme ve cüzdan sistemi.",
    longDescription: "Hyble Wallet, uygulamalarınıza ödeme altyapısı eklemenin en kolay yoludur. Bakiye yönetimi, bonus kredileri, promosyon kodları ve çoklu ödeme yöntemleri ile müşterilerinize sorunsuz bir ödeme deneyimi sunun.",
    features: [
      { title: "Bakiye Yönetimi", description: "Ana bakiye, bonus ve promosyon kredileri" },
      { title: "Stripe Entegrasyonu", description: "Kredi kartı, iDEAL, SEPA ödemeleri" },
      { title: "Otomatik Faturalama", description: "Recurring payments ve invoice oluşturma" },
      { title: "Promosyon Kodları", description: "İndirim ve bonus kampanyaları" },
      { title: "Webhook Bildirimleri", description: "Ödeme durumu güncellemeleri" },
      { title: "Çoklu Para Birimi", description: "EUR, USD, GBP desteği" },
    ],
    useCases: [
      { icon: Rocket, title: "SaaS Billing", description: "Abonelik ve kullanım bazlı faturalandırma" },
      { icon: Gamepad2, title: "Gaming", description: "In-app satın almalar ve krediler" },
      { icon: Building2, title: "Marketplace", description: "Çoklu satıcı ödeme yönetimi" },
    ],
    integrations: ["Stripe", "PayPal", "SEPA", "iDEAL", "REST API", "Webhooks"],
    pricing: { type: "İşlem Bazlı", price: "%1.5", description: "+ €0.25 işlem başına" },
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    status: "active",
    docsUrl: "https://docs.hyble.co/wallet",
  },
  cloud: {
    icon: Cloud,
    name: "Hyble Cloud",
    tagline: "Güçlü altyapı",
    description: "Yüksek performanslı VPS ve web hosting çözümleri.",
    longDescription: "Hyble Cloud, Hetzner'in güçlü altyapısı üzerine kurulu, yüksek performanslı hosting çözümleri sunar. VPS sunucular, web hosting, managed databases ve daha fazlası. Avrupa merkezli sunucularla düşük gecikme süresi.",
    features: [
      { title: "VPS Sunucular", description: "SSD storage, dedicated resources" },
      { title: "Web Hosting", description: "cPanel/Plesk ile kolay yönetim" },
      { title: "Otomatik Yedekleme", description: "Günlük snapshot ve restore" },
      { title: "DDoS Koruması", description: "Enterprise seviye koruma" },
      { title: "Tek Tık Kurulum", description: "WordPress, Node.js, Docker" },
      { title: "Scaling", description: "Anlık kaynak artırma" },
    ],
    useCases: [
      { icon: Globe, title: "Web Siteleri", description: "Kurumsal siteler ve bloglar" },
      { icon: Code, title: "Uygulamalar", description: "Node.js, Python, PHP hosting" },
      { icon: Building2, title: "Enterprise", description: "Özel yapılandırılmış çözümler" },
    ],
    integrations: ["Docker", "Kubernetes", "GitHub Actions", "GitLab CI", "Terraform"],
    pricing: { type: "Başlangıç", price: "€4.99", description: "/ ay'dan itibaren" },
    color: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    status: "coming_soon",
  },
  gaming: {
    icon: Gamepad2,
    name: "Hyble Gaming",
    tagline: "Oyun sunucuları",
    description: "Optimize edilmiş oyun sunucusu hosting.",
    longDescription: "Hyble Gaming, oyun sunucuları için özel olarak optimize edilmiş hosting çözümleri sunar. Minecraft, FiveM, Rust ve daha birçok oyun için tek tıkla kurulum, mod desteği ve DDoS koruması.",
    features: [
      { title: "Minecraft Sunucular", description: "Paper, Spigot, Forge, Fabric desteği" },
      { title: "FiveM Sunucular", description: "GTA V roleplay sunucuları" },
      { title: "Mod Desteği", description: "Tek tıkla mod yükleme" },
      { title: "DDoS Koruması", description: "Oyun trafiği için optimize" },
      { title: "Subdomain", description: "Ücretsiz .hyble.gg subdomain" },
      { title: "Otomatik Yedekleme", description: "World ve config backups" },
    ],
    useCases: [
      { icon: Users, title: "Topluluklar", description: "Discord toplulukları için sunucular" },
      { icon: Rocket, title: "Streamers", description: "İçerik üreticileri için" },
      { icon: Building2, title: "Networks", description: "Çoklu sunucu yönetimi" },
    ],
    integrations: ["Pterodactyl", "Multicraft", "Discord Bot", "RCON"],
    pricing: { type: "Başlangıç", price: "€2.99", description: "/ ay'dan itibaren" },
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    status: "active",
  },
  cdn: {
    icon: Server,
    name: "Hyble CDN",
    tagline: "Hızlı içerik dağıtımı",
    description: "Global CDN ağı ile içerik dağıtımı.",
    longDescription: "Hyble CDN, statik ve dinamik içeriklerinizi dünya genelinde hızlıca sunmanızı sağlar. Edge caching, image optimization, video streaming ve real-time analytics özellikleri ile web sitenizi hızlandırın.",
    features: [
      { title: "Global PoP", description: "50+ lokasyonda edge sunucular" },
      { title: "Edge Caching", description: "Akıllı cache yönetimi" },
      { title: "Image Optimization", description: "WebP dönüşümü, resize" },
      { title: "Video Streaming", description: "HLS ve DASH desteği" },
      { title: "SSL/TLS", description: "Ücretsiz SSL sertifikası" },
      { title: "Analytics", description: "Real-time trafik analizi" },
    ],
    useCases: [
      { icon: Globe, title: "Web Siteleri", description: "Statik site hızlandırma" },
      { icon: Code, title: "API'ler", description: "API response caching" },
      { icon: FileCode, title: "Medya", description: "Video ve resim dağıtımı" },
    ],
    integrations: ["WordPress", "Next.js", "S3", "GCS", "Custom Origin"],
    pricing: { type: "Kullanım Bazlı", price: "€0.01", description: "/ GB transfer" },
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    status: "coming_soon",
  },
  status: {
    icon: Activity,
    name: "Hyble Status",
    tagline: "Her zaman izleyin",
    description: "Uptime monitoring ve durum sayfası.",
    longDescription: "Hyble Status, servislerinizin durumunu 7/24 izler ve anlık bildirimler gönderir. Profesyonel durum sayfaları oluşturun, SLA raporları alın, incident yönetimi yapın.",
    features: [
      { title: "Uptime Monitoring", description: "HTTP, TCP, DNS, SSL kontrolleri" },
      { title: "Durum Sayfası", description: "Özelleştirilebilir public status page" },
      { title: "Uyarı Bildirimleri", description: "Email, Slack, Discord, SMS" },
      { title: "SLA Raporları", description: "Aylık uptime ve performans" },
      { title: "Incident Yönetimi", description: "Arıza kayıtları ve timeline" },
      { title: "Scheduled Maintenance", description: "Planlı bakım duyuruları" },
    ],
    useCases: [
      { icon: Building2, title: "SaaS Şirketleri", description: "Müşteri güvenini artırın" },
      { icon: Code, title: "Geliştiriciler", description: "API ve servis izleme" },
      { icon: Users, title: "DevOps", description: "Infrastructure monitoring" },
    ],
    integrations: ["Slack", "Discord", "PagerDuty", "Opsgenie", "Webhooks"],
    pricing: { type: "Başlangıç", price: "€9", description: "/ ay, 10 monitör" },
    color: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    status: "active",
    docsUrl: "https://docs.hyble.co/status",
  },
  tools: {
    icon: Wrench,
    name: "Hyble Tools",
    tagline: "Geliştirici araçları",
    description: "Ücretsiz geliştirici araçları koleksiyonu.",
    longDescription: "Hyble Tools, geliştiriciler için ücretsiz araçlar sunar. DNS lookup, SSL checker, port scanner, WHOIS, hız testi ve daha fazlası. Kayıt olmadan, ücretsiz kullanın.",
    features: [
      { title: "DNS Araçları", description: "A, MX, TXT, CNAME lookup" },
      { title: "SSL Kontrolü", description: "Sertifika doğrulama ve süre" },
      { title: "Port Tarayıcı", description: "Açık port kontrolü" },
      { title: "WHOIS", description: "Domain bilgi sorgulama" },
      { title: "Hız Testi", description: "Website performance analizi" },
      { title: "HTTP Headers", description: "Response header analizi" },
    ],
    useCases: [
      { icon: Code, title: "Web Geliştiriciler", description: "Debug ve test araçları" },
      { icon: Lock, title: "Güvenlik", description: "SSL ve port kontrolleri" },
      { icon: Globe, title: "SEO", description: "Site performans analizi" },
    ],
    integrations: [],
    pricing: { type: "Ücretsiz", price: "€0", description: "Tüm araçlar ücretsiz" },
    color: "from-slate-500 to-zinc-600",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    status: "active",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutionsData[slug];

  if (!solution) {
    return { title: "Çözüm Bulunamadı | Hyble" };
  }

  return {
    title: `${solution.name} - ${solution.tagline} | Hyble`,
    description: solution.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(solutionsData).map((slug) => ({ slug }));
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const solution = solutionsData[slug];

  if (!solution) {
    notFound();
  }

  const IconComponent = solution.icon;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${solution.bgColor}`}>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tüm Çözümler
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${solution.color} flex items-center justify-center shadow-xl`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                      {solution.name}
                    </h1>
                    {solution.status === "coming_soon" && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                        Yakında
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {solution.tagline}
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl">
                {solution.longDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                {solution.status === "active" ? (
                  <>
                    <a
                      href="https://id.hyble.co/auth/register"
                      className={`px-6 py-3 bg-gradient-to-r ${solution.color} text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                    >
                      Hemen Başla
                    </a>
                    {solution.docsUrl && (
                      <a
                        href={solution.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors inline-flex items-center gap-2"
                      >
                        Dokümantasyon
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold rounded-lg cursor-not-allowed"
                  >
                    Yakında Kullanılabilir
                  </button>
                )}
              </div>
            </div>

            {/* Pricing Card */}
            <Card className="p-6 w-full lg:w-80 flex-shrink-0">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {solution.pricing.type}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {solution.pricing.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {solution.pricing.description}
                </span>
              </div>
              {solution.status === "active" && (
                <a
                  href="https://id.hyble.co/auth/register"
                  className="mt-4 block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-lg transition-colors"
                >
                  Başla
                </a>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Özellikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solution.features.map((feature) => (
              <Card key={feature.title} className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Kullanım Alanları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solution.useCases.map((useCase) => {
              const UseCaseIcon = useCase.icon;
              return (
                <Card key={useCase.title} className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <UseCaseIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {useCase.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      {solution.integrations.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              Entegrasyonlar
            </h2>
            <div className="flex flex-wrap gap-3">
              {solution.integrations.map((integration) => (
                <span
                  key={integration}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {solution.name} ile başlamaya hazır mısınız?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Ücretsiz hesap oluşturun ve hemen kullanmaya başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://id.hyble.co/auth/register"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Ücretsiz Başla
            </a>
            <Link
              href="/solutions"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              Diğer Çözümler
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

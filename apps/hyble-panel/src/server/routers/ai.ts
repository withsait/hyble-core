// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  verifiedProcedure,
} from "../trpc/trpc";

// AI Generation Types
interface GeneratedBlock {
  id: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
}

interface GeneratedPage {
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  blocks: GeneratedBlock[];
}

interface GeneratedWebsite {
  name: string;
  description: string;
  pages: GeneratedPage[];
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Business type templates with detailed content
const businessTemplates: Record<string, {
  pages: string[];
  sections: string[];
  features: string[];
  cta: string;
}> = {
  corporate: {
    pages: ["Ana Sayfa", "Hakkımızda", "Hizmetler", "Ekibimiz", "İletişim"],
    sections: ["hero", "services", "about", "team", "testimonials", "cta", "contact"],
    features: ["Profesyonel Hizmet", "Uzman Ekip", "Müşteri Memnuniyeti", "Kalite Garantisi"],
    cta: "Bizimle İletişime Geçin",
  },
  ecommerce: {
    pages: ["Ana Sayfa", "Ürünler", "Kategoriler", "Hakkımızda", "İletişim"],
    sections: ["hero", "featured-products", "categories", "benefits", "testimonials", "newsletter", "contact"],
    features: ["Hızlı Kargo", "Güvenli Ödeme", "Kolay İade", "7/24 Destek"],
    cta: "Alışverişe Başla",
  },
  portfolio: {
    pages: ["Ana Sayfa", "Projeler", "Hakkımda", "Blog", "İletişim"],
    sections: ["hero", "projects", "skills", "about", "testimonials", "contact"],
    features: ["Yaratıcı Tasarım", "Modern Yaklaşım", "Detaylı Çalışma", "Zamanında Teslimat"],
    cta: "Proje Teklifi Al",
  },
  photography: {
    pages: ["Ana Sayfa", "Galeri", "Hizmetler", "Hakkımda", "İletişim"],
    sections: ["hero", "gallery", "services", "about", "pricing", "testimonials", "contact"],
    features: ["Profesyonel Ekipman", "Yaratıcı Bakış", "Hızlı Teslimat", "Düzenleme Dahil"],
    cta: "Çekim Randevusu Al",
  },
  restaurant: {
    pages: ["Ana Sayfa", "Menü", "Rezervasyon", "Hakkımızda", "İletişim"],
    sections: ["hero", "menu-preview", "specialties", "about", "chef", "testimonials", "reservation", "location"],
    features: ["Taze Malzemeler", "Ödüllü Şef", "Özel Atmosfer", "Online Rezervasyon"],
    cta: "Rezervasyon Yap",
  },
  nonprofit: {
    pages: ["Ana Sayfa", "Misyonumuz", "Projeler", "Nasıl Yardım Edebilirsiniz", "İletişim"],
    sections: ["hero", "mission", "impact", "projects", "team", "donate", "volunteer", "contact"],
    features: ["Şeffaflık", "Güvenilirlik", "Toplumsal Etki", "Gönüllü Desteği"],
    cta: "Bağış Yap",
  },
  blog: {
    pages: ["Ana Sayfa", "Blog", "Kategoriler", "Hakkımda", "İletişim"],
    sections: ["hero", "featured-posts", "categories", "newsletter", "about", "contact"],
    features: ["Güncel İçerik", "Uzman Görüşler", "Kolay Okuma", "Düzenli Yayın"],
    cta: "Bültene Abone Ol",
  },
  agency: {
    pages: ["Ana Sayfa", "Hizmetler", "Portföy", "Ekip", "İletişim"],
    sections: ["hero", "services", "portfolio", "process", "team", "clients", "testimonials", "cta"],
    features: ["Stratejik Planlama", "Yaratıcı Çözümler", "Ölçülebilir Sonuçlar", "Sürekli Destek"],
    cta: "Ücretsiz Danışmanlık",
  },
  medical: {
    pages: ["Ana Sayfa", "Hizmetler", "Doktorlarımız", "Randevu", "İletişim"],
    sections: ["hero", "services", "doctors", "why-us", "testimonials", "appointment", "location"],
    features: ["Uzman Kadro", "Modern Ekipman", "Hijyenik Ortam", "Kolay Randevu"],
    cta: "Online Randevu Al",
  },
  education: {
    pages: ["Ana Sayfa", "Kurslar", "Eğitmenler", "Hakkımızda", "İletişim"],
    sections: ["hero", "courses", "instructors", "features", "testimonials", "pricing", "faq", "contact"],
    features: ["Uzman Eğitmenler", "Interaktif Dersler", "Sertifika", "Ömür Boyu Erişim"],
    cta: "Kurslara Göz At",
  },
  realestate: {
    pages: ["Ana Sayfa", "İlanlar", "Hizmetler", "Hakkımızda", "İletişim"],
    sections: ["hero", "featured-listings", "search", "services", "about", "testimonials", "contact"],
    features: ["Geniş Portföy", "Uzman Danışmanlık", "Hızlı İşlem", "Güvenli Alım"],
    cta: "Ücretsiz Değerleme İste",
  },
  fitness: {
    pages: ["Ana Sayfa", "Programlar", "Eğitmenler", "Fiyatlar", "İletişim"],
    sections: ["hero", "programs", "trainers", "schedule", "pricing", "testimonials", "gallery", "contact"],
    features: ["Profesyonel Eğitmenler", "Modern Ekipman", "Kişisel Programlar", "Esnek Saatler"],
    cta: "Ücretsiz Deneme Dersi",
  },
};

// Color scheme definitions
const colorSchemes: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}> = {
  blue: { primary: "#3B82F6", secondary: "#1E40AF", accent: "#60A5FA", background: "#F8FAFC", text: "#1E293B" },
  green: { primary: "#10B981", secondary: "#047857", accent: "#34D399", background: "#F0FDF4", text: "#1E293B" },
  purple: { primary: "#8B5CF6", secondary: "#6D28D9", accent: "#A78BFA", background: "#FAF5FF", text: "#1E293B" },
  red: { primary: "#EF4444", secondary: "#B91C1C", accent: "#F87171", background: "#FEF2F2", text: "#1E293B" },
  amber: { primary: "#F59E0B", secondary: "#B45309", accent: "#FBBF24", background: "#FFFBEB", text: "#1E293B" },
  slate: { primary: "#475569", secondary: "#1E293B", accent: "#64748B", background: "#F8FAFC", text: "#0F172A" },
  rose: { primary: "#F43F5E", secondary: "#BE123C", accent: "#FB7185", background: "#FFF1F2", text: "#1E293B" },
  cyan: { primary: "#06B6D4", secondary: "#0891B2", accent: "#22D3EE", background: "#ECFEFF", text: "#1E293B" },
  indigo: { primary: "#6366F1", secondary: "#4338CA", accent: "#818CF8", background: "#EEF2FF", text: "#1E293B" },
  teal: { primary: "#14B8A6", secondary: "#0D9488", accent: "#2DD4BF", background: "#F0FDFA", text: "#1E293B" },
};

// Layout style configurations
const layoutStyles: Record<string, {
  fontFamily: string;
  borderRadius: string;
  spacing: string;
  shadow: string;
}> = {
  modern: { fontFamily: "Inter, system-ui, sans-serif", borderRadius: "12px", spacing: "relaxed", shadow: "soft" },
  classic: { fontFamily: "Georgia, serif", borderRadius: "4px", spacing: "normal", shadow: "subtle" },
  bold: { fontFamily: "Poppins, sans-serif", borderRadius: "16px", spacing: "tight", shadow: "strong" },
  minimal: { fontFamily: "Inter, system-ui, sans-serif", borderRadius: "8px", spacing: "generous", shadow: "none" },
};

// Generate unique ID
function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate hero block based on business type
function generateHeroBlock(businessType: string, colorScheme: string, siteName: string, prompt: string): GeneratedBlock {
  const template = businessTemplates[businessType] ?? businessTemplates.corporate!;
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!

  const heroTitles: Record<string, string> = {
    corporate: `${siteName} - Profesyonel Çözümler`,
    ecommerce: `${siteName} - Online Alışverişin Yeni Adresi`,
    portfolio: `Merhaba, Ben ${siteName}`,
    photography: `${siteName} - Anlarınızı Ölümsüzleştirin`,
    restaurant: `${siteName} - Lezzetin Yeni Adresi`,
    nonprofit: `${siteName} - Birlikte Değiştirelim`,
    blog: `${siteName} - Fikirler ve İlham`,
    agency: `${siteName} - Dijital Dönüşümün Ortağı`,
    medical: `${siteName} - Sağlığınız Bizim Önceliğimiz`,
    education: `${siteName} - Geleceğinizi Şekillendirin`,
    realestate: `${siteName} - Hayalinizdeki Eve Kavuşun`,
    fitness: `${siteName} - En İyi Versiyonunuza Ulaşın`,
  };

  const heroSubtitles: Record<string, string> = {
    corporate: "Sektörde lider konumumuzla işletmenize değer katıyoruz.",
    ecommerce: "Binlerce ürün, güvenli ödeme ve hızlı teslimat ile alışverişin keyfini çıkarın.",
    portfolio: "Yaratıcı tasarımlar ve yenilikçi çözümlerle projelerinize hayat veriyorum.",
    photography: "Her anı sanat eserine dönüştürüyorum. Profesyonel fotoğraf hizmetleri.",
    restaurant: "En taze malzemeler, özgün tarifler ve unutulmaz lezzetler sizi bekliyor.",
    nonprofit: "Topluma katkı sağlamak için çalışıyoruz. Siz de bu yolculuğa katılın.",
    blog: "Güncel içerikler, uzman görüşler ve ilham verici hikayeler.",
    agency: "Stratejik planlama, yaratıcı tasarım ve ölçülebilir sonuçlar sunuyoruz.",
    medical: "Uzman kadromuz ve modern ekipmanlarımızla sağlık hizmetinde yanınızdayız.",
    education: "Alanında uzman eğitmenlerle kariyerinize yön verin.",
    realestate: "Geniş portföyümüz ve uzman danışmanlığımızla yanınızdayız.",
    fitness: "Profesyonel eğitmenler ve kişisel programlarla hedeflerinize ulaşın.",
  };

  return {
    id: generateId(),
    type: "hero",
    content: {
      title: heroTitles[businessType] || `${siteName}'e Hoş Geldiniz`,
      subtitle: heroSubtitles[businessType] || "Modern ve profesyonel çözümler sunuyoruz.",
      buttonText: template.cta,
      buttonLink: "#contact",
      secondaryButtonText: "Daha Fazla",
      secondaryButtonLink: "#about",
      backgroundImage: "",
      alignment: "center",
    },
    style: {
      backgroundColor: colors.primary,
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: colors.primary,
      padding: "120px",
      minHeight: "90vh",
      backgroundOverlay: true,
      overlayOpacity: 0.5,
    },
  };
}

// Generate features block
function generateFeaturesBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const template = businessTemplates[businessType] ?? businessTemplates.corporate!;
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  const featureIcons = ["zap", "shield", "users", "clock", "star", "check-circle"];

  return {
    id: generateId(),
    type: "features",
    content: {
      title: "Neden Bizi Tercih Etmelisiniz?",
      subtitle: "Size sunduğumuz avantajlar",
      features: template.features.map((feature, index) => ({
        icon: featureIcons[index % featureIcons.length],
        title: feature,
        description: `${feature} konusunda en iyi hizmeti sunmak için çalışıyoruz.`,
      })),
      columns: 4,
    },
    style: {
      backgroundColor: "#FFFFFF",
      textColor: colors.text,
      iconColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate about block
function generateAboutBlock(businessType: string, colorScheme: string, siteName: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  const aboutTexts: Record<string, string> = {
    corporate: `${siteName} olarak, sektörde uzun yıllara dayanan deneyimimizle müşterilerimize en iyi hizmeti sunmayı hedefliyoruz. Profesyonel ekibimiz ve yenilikçi yaklaşımımızla her zaman yanınızdayız.`,
    ecommerce: `${siteName}, müşteri memnuniyetini ön planda tutan, kaliteli ürünleri uygun fiyatlarla sunan bir e-ticaret platformudur. Güvenli alışveriş deneyimi için bizi tercih edin.`,
    portfolio: `Yaratıcı bir tasarımcı olarak, projelerinize hayat veriyorum. Modern tasarım anlayışı ve detaylara verdiğim önemle markanızı bir adım öne çıkarıyorum.`,
    photography: `Fotoğrafçılık tutkumla, özel anlarınızı ölümsüzleştiriyorum. Profesyonel ekipmanlar ve yaratıcı bakış açısıyla unutulmaz kareler yaratıyorum.`,
    restaurant: `${siteName}, lezzet ve kalitenin buluştuğu nokta. Taze malzemeler, özgün tarifler ve sıcak atmosferimizle sizleri ağırlamaktan mutluluk duyuyoruz.`,
    nonprofit: `${siteName} olarak, topluma fayda sağlamak için çalışıyoruz. Şeffaflık ve güvenilirlik ilkelerimizle her adımda yanınızdayız.`,
    blog: `Bu blogda güncel konular, uzman görüşler ve ilham verici içerikler bulacaksınız. Bilgi paylaştıkça çoğalır.`,
    agency: `${siteName}, dijital dünyada markanızı öne çıkarmak için stratejik çözümler sunan bir ajans. Yaratıcı fikirler ve ölçülebilir sonuçlar için buradayız.`,
    medical: `${siteName}, sağlığınızı korumak ve iyileştirmek için en güncel tedavi yöntemlerini sunar. Uzman kadromuzla güvendesiniz.`,
    education: `${siteName}, kaliteli eğitim ve profesyonel gelişim için doğru adres. Uzman eğitmenlerimizle geleceğinizi şekillendirin.`,
    realestate: `${siteName}, gayrimenkul sektöründe güvenilir partneriniz. Geniş portföyümüz ve uzman ekibimizle hayalinizdeki eve kavuşun.`,
    fitness: `${siteName}, sağlıklı yaşam yolculuğunuzda yanınızda. Profesyonel eğitmenlerimiz ve modern tesislerimizle hedeflerinize ulaşın.`,
  };

  return {
    id: generateId(),
    type: "about",
    content: {
      title: "Hakkımızda",
      subtitle: "Bizi Tanıyın",
      text: aboutTexts[businessType] || `${siteName} hakkında daha fazla bilgi edinin.`,
      image: "",
      stats: [
        { label: "Yıllık Deneyim", value: "10+" },
        { label: "Mutlu Müşteri", value: "500+" },
        { label: "Tamamlanan Proje", value: "1000+" },
      ],
      layout: "image-left",
    },
    style: {
      backgroundColor: colors.background,
      textColor: colors.text,
      accentColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate services block
function generateServicesBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  const servicesByType: Record<string, Array<{ title: string; description: string; icon: string }>> = {
    corporate: [
      { title: "Danışmanlık", description: "Profesyonel iş danışmanlığı hizmetleri", icon: "briefcase" },
      { title: "Strateji", description: "Kurumsal strateji geliştirme", icon: "target" },
      { title: "Analiz", description: "Pazar ve rekabet analizi", icon: "bar-chart" },
      { title: "Yönetim", description: "Proje ve süreç yönetimi", icon: "settings" },
    ],
    ecommerce: [
      { title: "Hızlı Kargo", description: "Aynı gün kargo seçeneği", icon: "truck" },
      { title: "Güvenli Ödeme", description: "256-bit SSL şifreleme", icon: "shield" },
      { title: "Kolay İade", description: "14 gün koşulsuz iade", icon: "refresh-cw" },
      { title: "7/24 Destek", description: "Her zaman yanınızdayız", icon: "headphones" },
    ],
    photography: [
      { title: "Düğün Fotoğrafçılığı", description: "Özel gününüzü ölümsüzleştirin", icon: "heart" },
      { title: "Portre Çekimi", description: "Profesyonel portre fotoğrafları", icon: "user" },
      { title: "Ürün Fotoğrafçılığı", description: "E-ticaret için ürün çekimi", icon: "package" },
      { title: "Etkinlik", description: "Kurumsal etkinlik fotoğrafçılığı", icon: "calendar" },
    ],
    restaurant: [
      { title: "Öğle Menüsü", description: "Günlük taze hazırlanan lezzetler", icon: "sun" },
      { title: "Akşam Menüsü", description: "Özel şef menüleri", icon: "moon" },
      { title: "Catering", description: "Etkinlikleriniz için catering", icon: "truck" },
      { title: "Rezervasyon", description: "Online masa rezervasyonu", icon: "calendar" },
    ],
    medical: [
      { title: "Genel Muayene", description: "Kapsamlı sağlık kontrolü", icon: "stethoscope" },
      { title: "Laboratuvar", description: "Modern laboratuvar hizmetleri", icon: "flask" },
      { title: "Görüntüleme", description: "Röntgen ve ultrason", icon: "scan" },
      { title: "Acil Servis", description: "7/24 acil sağlık hizmeti", icon: "alert-circle" },
    ],
    education: [
      { title: "Online Kurslar", description: "Her yerden erişilebilir eğitim", icon: "monitor" },
      { title: "Canlı Dersler", description: "Interaktif canlı eğitimler", icon: "video" },
      { title: "Sertifika", description: "Uluslararası geçerli sertifikalar", icon: "award" },
      { title: "Mentorluk", description: "Birebir mentorluk desteği", icon: "users" },
    ],
    fitness: [
      { title: "Kişisel Antrenman", description: "Özel eğitmen eşliğinde", icon: "user" },
      { title: "Grup Dersleri", description: "Yoga, pilates, cardio", icon: "users" },
      { title: "Beslenme", description: "Kişiye özel diyet programı", icon: "heart" },
      { title: "Online Antrenman", description: "Evden katılım imkanı", icon: "monitor" },
    ],
  };

  const services = servicesByType[businessType] || servicesByType.corporate;

  return {
    id: generateId(),
    type: "services",
    content: {
      title: "Hizmetlerimiz",
      subtitle: "Size sunduğumuz çözümler",
      services,
      columns: 4,
    },
    style: {
      backgroundColor: "#FFFFFF",
      textColor: colors.text,
      cardBackground: colors.background,
      iconColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate testimonials block
function generateTestimonialsBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "testimonials",
    content: {
      title: "Müşteri Yorumları",
      subtitle: "Müşterilerimiz ne diyor?",
      testimonials: [
        {
          name: "Ahmet Yılmaz",
          role: "İşletme Sahibi",
          avatar: "",
          text: "Harika bir deneyimdi. Profesyonel yaklaşımları ve kaliteli hizmetleri ile beklentilerimin üzerinde bir sonuç aldım.",
          rating: 5,
        },
        {
          name: "Ayşe Kaya",
          role: "Pazarlama Müdürü",
          avatar: "",
          text: "Çok memnun kaldım. Detaylara verdikleri önem ve müşteri odaklı yaklaşımları gerçekten etkileyici.",
          rating: 5,
        },
        {
          name: "Mehmet Demir",
          role: "Girişimci",
          avatar: "",
          text: "İş ortaklığımızdan çok memnunum. Zamanında teslimat ve kaliteli iş anlayışları ile öne çıkıyorlar.",
          rating: 5,
        },
      ],
      layout: "carousel",
    },
    style: {
      backgroundColor: colors.background,
      textColor: colors.text,
      cardBackground: "#FFFFFF",
      starColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate CTA block
function generateCtaBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const template = businessTemplates[businessType] ?? businessTemplates.corporate!;
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "cta",
    content: {
      title: "Hemen Başlayın",
      subtitle: "Sizinle çalışmak için sabırsızlanıyoruz",
      buttonText: template.cta,
      buttonLink: "#contact",
      secondaryText: "Sorularınız mı var?",
      secondaryLink: "#faq",
    },
    style: {
      backgroundColor: colors.primary,
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: colors.primary,
      padding: "100px",
      backgroundPattern: "gradient",
    },
  };
}

// Generate contact block
function generateContactBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "contact",
    content: {
      title: "İletişim",
      subtitle: "Bizimle iletişime geçin",
      email: "info@example.com",
      phone: "+90 (212) 123 45 67",
      address: "İstanbul, Türkiye",
      formFields: [
        { name: "name", label: "Adınız", type: "text", required: true },
        { name: "email", label: "E-posta", type: "email", required: true },
        { name: "phone", label: "Telefon", type: "tel", required: false },
        { name: "message", label: "Mesajınız", type: "textarea", required: true },
      ],
      submitText: "Gönder",
      showMap: true,
      showSocial: true,
      social: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
        linkedin: "#",
      },
    },
    style: {
      backgroundColor: "#FFFFFF",
      textColor: colors.text,
      formBackground: colors.background,
      buttonColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate gallery block
function generateGalleryBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "gallery",
    content: {
      title: "Galeri",
      subtitle: "Çalışmalarımızdan örnekler",
      images: [],
      columns: 3,
      enableLightbox: true,
      enableFilter: true,
      categories: ["Tümü", "Projeler", "Etkinlikler", "Ürünler"],
    },
    style: {
      backgroundColor: colors.background,
      textColor: colors.text,
      padding: "80px",
      gap: "16px",
      borderRadius: "12px",
    },
  };
}

// Generate pricing block
function generatePricingBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  const pricingByType: Record<string, Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
  }>> = {
    education: [
      { name: "Başlangıç", price: "299", period: "/ay", features: ["10 Ders", "Temel Materyaller", "Email Destek"], highlighted: false },
      { name: "Profesyonel", price: "599", period: "/ay", features: ["30 Ders", "Tüm Materyaller", "Öncelikli Destek", "Sertifika"], highlighted: true },
      { name: "Kurumsal", price: "999", period: "/ay", features: ["Sınırsız Ders", "Özel İçerik", "7/24 Destek", "Grup İndirimi"], highlighted: false },
    ],
    fitness: [
      { name: "Temel", price: "199", period: "/ay", features: ["Salon Erişimi", "Duş & Soyunma", "Fitness Alanı"], highlighted: false },
      { name: "Premium", price: "399", period: "/ay", features: ["Tüm Tesisler", "Grup Dersleri", "Beslenme Danışmanlığı"], highlighted: true },
      { name: "VIP", price: "699", period: "/ay", features: ["Özel Antrenör", "Kişisel Program", "Spa & Masaj"], highlighted: false },
    ],
    default: [
      { name: "Başlangıç", price: "99", period: "/ay", features: ["Temel Özellikler", "Email Destek", "5 Kullanıcı"], highlighted: false },
      { name: "Profesyonel", price: "299", period: "/ay", features: ["Tüm Özellikler", "Öncelikli Destek", "25 Kullanıcı"], highlighted: true },
      { name: "Kurumsal", price: "599", period: "/ay", features: ["Özel Çözümler", "7/24 Destek", "Sınırsız Kullanıcı"], highlighted: false },
    ],
  };

  const pricing = pricingByType[businessType] || pricingByType.default;

  return {
    id: generateId(),
    type: "pricing",
    content: {
      title: "Fiyatlandırma",
      subtitle: "Size uygun planı seçin",
      plans: pricing,
      currency: "₺",
      ctaText: "Hemen Başla",
    },
    style: {
      backgroundColor: "#FFFFFF",
      textColor: colors.text,
      cardBackground: colors.background,
      highlightColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate FAQ block
function generateFaqBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  const faqsByType: Record<string, Array<{ question: string; answer: string }>> = {
    ecommerce: [
      { question: "Kargo süresi ne kadar?", answer: "Siparişleriniz 1-3 iş günü içinde kargoya verilir." },
      { question: "İade koşulları nelerdir?", answer: "14 gün içinde koşulsuz iade hakkınız bulunmaktadır." },
      { question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", answer: "Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz." },
    ],
    education: [
      { question: "Kurslara nasıl kayıt olabilirim?", answer: "Web sitemizden istediğiniz kursu seçip hemen kayıt olabilirsiniz." },
      { question: "Sertifika alabilir miyim?", answer: "Tüm kurslarımız sonunda onaylı sertifika verilmektedir." },
      { question: "Dersleri tekrar izleyebilir miyim?", answer: "Evet, tüm derslere ömür boyu erişim hakkınız vardır." },
    ],
    medical: [
      { question: "Randevu nasıl alabilirim?", answer: "Online randevu sistemimizden veya telefon ile randevu alabilirsiniz." },
      { question: "Hangi sigortalarla çalışıyorsunuz?", answer: "Tüm özel sigorta şirketleri ve SGK anlaşmamız mevcuttur." },
      { question: "Acil durumda ne yapmalıyım?", answer: "Acil durumlarda 7/24 acil hattımızı arayabilirsiniz." },
    ],
    default: [
      { question: "Nasıl başvurabilirim?", answer: "İletişim formumuzu doldurarak veya bizi arayarak başvurabilirsiniz." },
      { question: "Fiyatlandırma nasıl yapılıyor?", answer: "Projenizin kapsamına göre özel fiyat teklifi sunuyoruz." },
      { question: "Ne kadar sürede teslim edersiniz?", answer: "Proje büyüklüğüne göre 1-4 hafta içinde teslim ediyoruz." },
    ],
  };

  const faqs = faqsByType[businessType] || faqsByType.default;

  return {
    id: generateId(),
    type: "faq",
    content: {
      title: "Sıkça Sorulan Sorular",
      subtitle: "Merak ettikleriniz",
      faqs,
      layout: "accordion",
    },
    style: {
      backgroundColor: colors.background,
      textColor: colors.text,
      accentColor: colors.primary,
      padding: "80px",
    },
  };
}

// Generate team block
function generateTeamBlock(businessType: string, colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "team",
    content: {
      title: "Ekibimiz",
      subtitle: "Profesyonel kadromuzla tanışın",
      members: [
        { name: "Ali Yıldız", role: "Kurucu & CEO", avatar: "", bio: "10+ yıl sektör deneyimi" },
        { name: "Zeynep Kara", role: "Operasyon Müdürü", avatar: "", bio: "Müşteri memnuniyeti odaklı" },
        { name: "Can Özdemir", role: "Teknik Direktör", avatar: "", bio: "Yenilikçi çözümler uzmanı" },
        { name: "Elif Şahin", role: "Pazarlama Müdürü", avatar: "", bio: "Dijital pazarlama stratejisti" },
      ],
      columns: 4,
      showSocial: true,
    },
    style: {
      backgroundColor: "#FFFFFF",
      textColor: colors.text,
      cardBackground: colors.background,
      padding: "80px",
    },
  };
}

// Generate newsletter block
function generateNewsletterBlock(colorScheme: string): GeneratedBlock {
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;

  return {
    id: generateId(),
    type: "newsletter",
    content: {
      title: "Bültene Abone Olun",
      subtitle: "Güncel haberler ve fırsatlardan haberdar olun",
      placeholder: "E-posta adresiniz",
      buttonText: "Abone Ol",
      privacyText: "Gizlilik politikamızı kabul ediyorum",
    },
    style: {
      backgroundColor: colors.secondary,
      textColor: "#FFFFFF",
      inputBackground: "#FFFFFF",
      buttonColor: colors.primary,
      padding: "60px",
    },
  };
}

// Main generation function
function generateWebsiteContent(
  businessType: string,
  colorScheme: string,
  layoutStyle: string,
  siteName: string,
  prompt: string
): GeneratedWebsite {
  const template = businessTemplates[businessType] ?? businessTemplates.corporate!;
  const colors = colorSchemes[colorScheme] ?? colorSchemes.blue!;
  const layout = layoutStyles[layoutStyle] ?? layoutStyles.modern!;

  // Generate home page blocks based on business type
  const homeBlocks: GeneratedBlock[] = [
    generateHeroBlock(businessType, colorScheme, siteName, prompt),
    generateFeaturesBlock(businessType, colorScheme),
    generateAboutBlock(businessType, colorScheme, siteName),
  ];

  // Add services for certain business types
  if (["corporate", "ecommerce", "medical", "agency", "photography", "fitness", "restaurant"].includes(businessType)) {
    homeBlocks.push(generateServicesBlock(businessType, colorScheme));
  }

  // Add gallery for visual businesses
  if (["photography", "portfolio", "restaurant", "fitness"].includes(businessType)) {
    homeBlocks.push(generateGalleryBlock(businessType, colorScheme));
  }

  // Add team for professional services
  if (["corporate", "agency", "medical", "education"].includes(businessType)) {
    homeBlocks.push(generateTeamBlock(businessType, colorScheme));
  }

  // Add pricing for service businesses
  if (["education", "fitness", "agency"].includes(businessType)) {
    homeBlocks.push(generatePricingBlock(businessType, colorScheme));
  }

  homeBlocks.push(generateTestimonialsBlock(businessType, colorScheme));
  homeBlocks.push(generateFaqBlock(businessType, colorScheme));
  homeBlocks.push(generateCtaBlock(businessType, colorScheme));
  homeBlocks.push(generateNewsletterBlock(colorScheme));
  homeBlocks.push(generateContactBlock(businessType, colorScheme));

  // Generate pages
  const pages: GeneratedPage[] = [
    {
      name: "Ana Sayfa",
      slug: "/",
      title: `${siteName} - Ana Sayfa`,
      metaDescription: `${siteName} resmi web sitesi. ${template.features.slice(0, 2).join(", ")} ve daha fazlası.`,
      blocks: homeBlocks,
    },
    {
      name: "Hakkımızda",
      slug: "/hakkimizda",
      title: `Hakkımızda - ${siteName}`,
      metaDescription: `${siteName} hakkında bilgi edinin. Misyonumuz, vizyonumuz ve değerlerimiz.`,
      blocks: [
        generateHeroBlock(businessType, colorScheme, "Hakkımızda", ""),
        generateAboutBlock(businessType, colorScheme, siteName),
        generateTeamBlock(businessType, colorScheme),
        generateCtaBlock(businessType, colorScheme),
      ],
    },
    {
      name: "Hizmetler",
      slug: "/hizmetler",
      title: `Hizmetlerimiz - ${siteName}`,
      metaDescription: `${siteName} hizmetleri. ${template.features.join(", ")}.`,
      blocks: [
        generateHeroBlock(businessType, colorScheme, "Hizmetlerimiz", ""),
        generateServicesBlock(businessType, colorScheme),
        generateFeaturesBlock(businessType, colorScheme),
        generatePricingBlock(businessType, colorScheme),
        generateCtaBlock(businessType, colorScheme),
      ],
    },
    {
      name: "İletişim",
      slug: "/iletisim",
      title: `İletişim - ${siteName}`,
      metaDescription: `${siteName} ile iletişime geçin. Adres, telefon ve iletişim formu.`,
      blocks: [
        generateHeroBlock(businessType, colorScheme, "İletişim", ""),
        generateContactBlock(businessType, colorScheme),
        generateFaqBlock(businessType, colorScheme),
      ],
    },
  ];

  return {
    name: siteName,
    description: prompt,
    pages,
    globalStyles: {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      fontFamily: layout.fontFamily,
      borderRadius: layout.borderRadius,
    },
    seoMeta: {
      title: siteName,
      description: `${siteName} - ${template.features.slice(0, 3).join(", ")}`,
      keywords: [...template.features, businessType, "profesyonel", "kaliteli"],
    },
  };
}

export const aiRouter = createTRPCRouter({
  // Generate website content
  generateWebsite: verifiedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(2000),
        siteName: z.string().min(2).max(100),
        businessType: z.string(),
        colorScheme: z.string(),
        layoutStyle: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prompt, siteName, businessType, colorScheme, layoutStyle } = input;

      // Generate website content
      const generatedContent = generateWebsiteContent(
        businessType,
        colorScheme,
        layoutStyle,
        siteName,
        prompt
      );

      // In production, this could also call external AI APIs (OpenAI, Claude)
      // for enhanced content generation

      return generatedContent;
    }),

  // Generate single block content
  generateBlock: protectedProcedure
    .input(
      z.object({
        blockType: z.string(),
        businessType: z.string().optional(),
        colorScheme: z.string().optional(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { blockType, businessType = "corporate", colorScheme = "blue", context = "" } = input;

      let block: GeneratedBlock;

      switch (blockType) {
        case "hero":
          block = generateHeroBlock(businessType, colorScheme, "Web Sitesi", context);
          break;
        case "features":
          block = generateFeaturesBlock(businessType, colorScheme);
          break;
        case "about":
          block = generateAboutBlock(businessType, colorScheme, "Web Sitesi");
          break;
        case "services":
          block = generateServicesBlock(businessType, colorScheme);
          break;
        case "testimonials":
          block = generateTestimonialsBlock(businessType, colorScheme);
          break;
        case "cta":
          block = generateCtaBlock(businessType, colorScheme);
          break;
        case "contact":
          block = generateContactBlock(businessType, colorScheme);
          break;
        case "gallery":
          block = generateGalleryBlock(businessType, colorScheme);
          break;
        case "pricing":
          block = generatePricingBlock(businessType, colorScheme);
          break;
        case "faq":
          block = generateFaqBlock(businessType, colorScheme);
          break;
        case "team":
          block = generateTeamBlock(businessType, colorScheme);
          break;
        case "newsletter":
          block = generateNewsletterBlock(colorScheme);
          break;
        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unknown block type: ${blockType}`,
          });
      }

      return block;
    }),

  // Generate SEO content for a page
  generateSEO: protectedProcedure
    .input(
      z.object({
        pageContent: z.string(),
        businessType: z.string().optional(),
        targetKeywords: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { pageContent, businessType = "corporate", targetKeywords = [] } = input;

      // Simple SEO generation (in production, use AI API)
      const seo = {
        title: `${pageContent.slice(0, 60)}...`,
        description: `${pageContent.slice(0, 155)}...`,
        keywords: targetKeywords.length > 0 ? targetKeywords : ["profesyonel", "kaliteli", "güvenilir"],
        ogTitle: pageContent.slice(0, 60),
        ogDescription: pageContent.slice(0, 155),
        structuredData: {
          "@context": "https://schema.org",
          "@type": businessType === "ecommerce" ? "Store" : "Organization",
          name: pageContent.slice(0, 50),
          description: pageContent.slice(0, 155),
        },
      };

      return seo;
    }),

  // Suggest improvements for content
  suggestImprovements: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        contentType: z.enum(["heading", "paragraph", "cta", "description"]),
      })
    )
    .mutation(async ({ input }) => {
      const { content, contentType } = input;

      // Simple suggestions (in production, use AI API)
      const suggestions = {
        heading: [
          "Başlığı daha etkileyici hale getirin",
          "Rakamlar veya güçlü kelimeler ekleyin",
          "Hedef kitlenize hitap edin",
        ],
        paragraph: [
          "Cümleleri kısa tutun",
          "Aktif dil kullanın",
          "Örnekler ekleyin",
        ],
        cta: [
          "Aciliyet hissi yaratın",
          "Değer önerisini vurgulayın",
          "Aksiyon odaklı kelimeler kullanın",
        ],
        description: [
          "Faydaları öne çıkarın",
          "Benzersiz değerinizi vurgulayın",
          "Güven unsurları ekleyin",
        ],
      };

      return {
        original: content,
        suggestions: suggestions[contentType] || suggestions.paragraph,
        improved: content, // In production, AI would generate improved version
      };
    }),

  // Get available business types
  getBusinessTypes: protectedProcedure.query(() => {
    return Object.keys(businessTemplates).map((key) => ({
      id: key,
      ...businessTemplates[key],
    }));
  }),

  // Get available color schemes
  getColorSchemes: protectedProcedure.query(() => {
    return Object.keys(colorSchemes).map((key) => ({
      id: key,
      ...colorSchemes[key],
    }));
  }),

  // Get available layout styles
  getLayoutStyles: protectedProcedure.query(() => {
    return Object.keys(layoutStyles).map((key) => ({
      id: key,
      ...layoutStyles[key],
    }));
  }),
});

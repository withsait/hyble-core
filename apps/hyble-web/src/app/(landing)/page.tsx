import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";

export const metadata: Metadata = {
  title: "Hyble - Kur. Başlat. Büyüt.",
  description: "Web sitenizi, oyun sunucunuzu veya dijital projenizi dakikalar içinde kurun. Kolay yönetim, hızlı kurulum ve profesyonel altyapı — hepsi tek platformda.",
  openGraph: {
    title: "Hyble - Kur. Başlat. Büyüt.",
    description: "Web sitenizi, oyun sunucunuzu veya dijital projenizi dakikalar içinde kurun.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureBento />
      <PricingSection />
      <CTASection />
    </>
  );
}

import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { PricingSection } from "@/components/landing/PricingSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";

export const metadata: Metadata = {
  title: "Hyble - Geliştiriciler için Hepsi Bir Arada Platform",
  description: "Kimlik doğrulama, ödeme ve bulut altyapısını tek bir platformda yönetin. Yazılım işinizi kurmak ve büyütmek için ihtiyacınız olan her şey.",
  openGraph: {
    title: "Hyble - Geliştiriciler için Hepsi Bir Arada Platform",
    description: "Kimlik doğrulama, ödeme ve bulut altyapısını tek bir platformda yönetin.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FeatureBento />
      <PricingSection />
      <StatsSection />
      <CTASection />
    </>
  );
}

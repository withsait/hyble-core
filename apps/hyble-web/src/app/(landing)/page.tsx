import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { AudienceSelector } from "@/components/landing/AudienceSelector";
import { SocialProof } from "@/components/landing/SocialProof";
import { PricingSection } from "@/components/landing/PricingSection";

export const metadata: Metadata = {
  title: "Hyble - Web Sitenizi 5 Dakikada Oluşturun",
  description: "Şablon seçin, özelleştirin, yayınlayın. Hosting dahil. Ücretsiz başlayın.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AudienceSelector />
      <SocialProof />
      <PricingSection />
    </>
  );
}

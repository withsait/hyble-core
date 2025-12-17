import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyHyble } from "@/components/landing/WhyHyble";
import { PricingSection } from "@/components/landing/PricingSection";
import { ScrollCTA } from "@/components/landing/ScrollCTA";

export const metadata: Metadata = {
  title: "Hyble - All in One. All in Hyble.",
  description: "Hızlı kurulum, kolay yönetim. Hosting, ödeme, kimlik doğrulama — hepsi tek platformda. 5 dakikada başlayın!",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationLogos />
      <FeatureBento />
      <HowItWorks />
      <WhyHyble />
      <PricingSection />
      <ScrollCTA />
    </>
  );
}

import { Metadata } from "next";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/HeroSection";
import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyHyble } from "@/components/landing/WhyHyble";
import { PricingSection } from "@/components/landing/PricingSection";
import { ScrollCTA } from "@/components/landing/ScrollCTA";

// Dynamic import for client component that uses tRPC
const FeaturedProducts = dynamic(
  () => import("@/components/landing/FeaturedProducts").then((mod) => mod.FeaturedProducts),
  { ssr: false }
);

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
      <FeaturedProducts />
      <HowItWorks />
      <WhyHyble />
      <PricingSection />
      <ScrollCTA />
    </>
  );
}

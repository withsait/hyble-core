import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonSection } from "@/components/landing/StatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { TrustFloatingBar } from "@/components/landing/TrustFloatingBar";
import { ScrollCTA } from "@/components/landing/ScrollCTA";

export const metadata: Metadata = {
  title: "Hyble - All in One. All in Hyble.",
  description: "Dijital işinizi tek platformdan yönetin. Kimlik doğrulama, ödeme altyapısı, lisanslama, hosting ve daha fazlası.",
  openGraph: {
    title: "Hyble - All in One. All in Hyble.",
    description: "Dijital işinizi tek platformdan yönetin. Kimlik doğrulama, ödeme altyapısı, lisanslama ve hosting.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationLogos />
      <FeatureBento />
      <HowItWorks />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <TrustFloatingBar />
      <ScrollCTA />
    </>
  );
}

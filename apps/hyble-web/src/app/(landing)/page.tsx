import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonSection } from "@/components/landing/StatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { TrustFloatingBar } from "@/components/landing/TrustFloatingBar";

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
      <FeatureBento />
      <HowItWorks />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <TrustFloatingBar />
    </>
  );
}

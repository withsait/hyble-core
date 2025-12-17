import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { TrustFloatingBar } from "@/components/landing/TrustFloatingBar";

export const metadata: Metadata = {
  title: "Hyble - All in One. All in Hyble.",
  description: "Dijital işinizi başlatmak ve büyütmek için ihtiyacınız olan her şey. Kimlik, ödeme, hosting ve araçlar — yapay zeka destekli tek platformda.",
  openGraph: {
    title: "Hyble - All in One. All in Hyble.",
    description: "Dijital işinizi başlatmak ve büyütmek için ihtiyacınız olan her şey.",
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
      <TrustFloatingBar />
    </>
  );
}

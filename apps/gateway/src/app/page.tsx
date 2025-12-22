import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { VerticalShowcase } from "@/components/landing/VerticalShowcase";
import { TrustSection } from "@/components/landing/TrustSection";
import { CTASection } from "@/components/landing/CTASection";

export const metadata: Metadata = {
  title: "Hyble - Build Digital. Play Digital.",
  description: "Kurumsal web cozumleri ve gaming altyapisi tek catida. UK kayitli, 7/24 destek, 99.9% uptime.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EcosystemSection />
      <VerticalShowcase />
      <TrustSection />
      <CTASection />
    </>
  );
}

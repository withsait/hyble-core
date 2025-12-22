import { Metadata } from "next";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { VerticalShowcase } from "@/components/landing/VerticalShowcase";
import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { CTASection } from "@/components/landing/CTASection";
import { StickyCTA } from "@/components/landing/StickyCTA";

// Dynamic import with SSR disabled - BlogPreviewSection uses tRPC hooks that require client-side context
const BlogPreviewSection = dynamic(
  () => import("@/components/landing/BlogPreviewSection").then(mod => mod.BlogPreviewSection),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Hyble - Fikriniz Var, Biz Hayata Gecirelim",
  description: "Web siteniz 24 saatte hazir, sunucunuz 5 dakikada aktif. UK kayitli, 7/24 destek, 99.9% uptime garantisi.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <ComparisonSection />
      <VerticalShowcase />
      <EcosystemSection />
      <TrustSection />
      <BlogPreviewSection />
      <CTASection />
      <StickyCTA />
    </>
  );
}

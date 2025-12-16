import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTASection } from "@/components/landing/CTASection";

export const metadata: Metadata = {
  title: "Hyble - The All-in-One Digital Ecosystem",
  description: "Manage your identity, payments, and cloud infrastructure in one unified platform. Powered by AI.",
  openGraph: {
    title: "Hyble - The All-in-One Digital Ecosystem",
    description: "Manage your identity, payments, and cloud infrastructure in one unified platform.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FeatureBento />
      <HowItWorks />
      <CTASection />
    </>
  );
}

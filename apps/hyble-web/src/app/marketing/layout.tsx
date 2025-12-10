import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyble - Web Hosting & Cloud Services",
  description: "Premium web hosting and cloud services from Hyble",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

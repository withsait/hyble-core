import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

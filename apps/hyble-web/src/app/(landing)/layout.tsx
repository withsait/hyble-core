import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { CartDrawer } from "@/components/cart";
import { CompareBar } from "@/components/compare";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CompareProvider>
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <CompareBar />
        </div>
      </CompareProvider>
    </CartProvider>
  );
}

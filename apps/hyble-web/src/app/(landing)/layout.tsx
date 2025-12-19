import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/cart";
import { CompareBar } from "@/components/compare";
import { WishlistDrawer } from "@/components/wishlist";
import { ExitIntentPopup } from "@/components/conversion";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CompareProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
            <CompareBar />
            <WishlistDrawer />
            <ExitIntentPopup />
          </div>
        </WishlistProvider>
      </CompareProvider>
    </CartProvider>
  );
}

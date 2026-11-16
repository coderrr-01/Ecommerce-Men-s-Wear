import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreUtilities } from "@/components/layout/store-utilities";
import { fontVariables } from "@/components/shared/fonts";
import { StoreRouteTransition } from "@/components/layout/store-route-transition";
import { GuestWishlistProvider } from "@/features/wishlist/components/guest-wishlist-provider";
import { QuickViewProvider } from "@/features/catalog/components/quick-view-provider";
import { Toaster } from "sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fontVariables} flex min-h-dvh flex-col`}>
      <GuestWishlistProvider>
        <QuickViewProvider>
          <SiteHeader />
          <main className="flex-1 pb-20 md:pb-0">
            <StoreRouteTransition>{children}</StoreRouteTransition>
          </main>
          <SiteFooter />
          <StoreUtilities />
          <Toaster position="top-center" />
        </QuickViewProvider>
      </GuestWishlistProvider>
    </div>
  );
}

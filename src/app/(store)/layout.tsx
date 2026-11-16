import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fontVariables } from "@/components/shared/fonts";
import { StoreRouteTransition } from "@/components/layout/store-route-transition";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fontVariables} flex min-h-dvh flex-col`}>
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <StoreRouteTransition>{children}</StoreRouteTransition>
      </main>
      <SiteFooter />
    </div>
  );
}

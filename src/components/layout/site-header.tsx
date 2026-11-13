import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";
import { getSession } from "@/features/auth/services/session.service";
import { getCartItemCount } from "@/features/cart/services/cart.service";
import { cn, formatPrice, getInitials } from "@/lib/utils";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user;
  const cartCount = user ? await getCartItemCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-[11px] tracking-[0.14em] text-primary-foreground uppercase">
        Complimentary shipping on orders over{" "}
        {formatPrice(siteConfig.shipping.freeShippingThreshold)}
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <details className="group relative">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-secondary [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </summary>
            <nav className="absolute top-12 left-0 z-50 w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </details>
        </div>

        <Logo className="lg:flex-1" />

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1">
          <Link
            href="/shop"
            className="flex size-10 items-center justify-center rounded-md hover:bg-secondary"
            aria-label="Search products"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href={user ? "/account/wishlist" : "/login?redirectTo=/account/wishlist"}
            className="hidden size-10 items-center justify-center rounded-md hover:bg-secondary sm:flex"
            aria-label="Wishlist"
          >
            <Heart className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="flex size-10 items-center justify-center rounded-md hover:bg-secondary"
            aria-label={user ? "Your account" : "Sign in"}
          >
            {user?.name ? (
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold">
                {getInitials(user.name)}
              </span>
            ) : (
              <User className="size-5" aria-hidden="true" />
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex size-10 items-center justify-center rounded-md hover:bg-secondary"
            aria-label={cartCount > 0 ? `Shopping bag, ${cartCount} items` : "Shopping bag"}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-accent-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Link
              href="/admin"
              className={cn(
                "ml-1 hidden rounded-md border border-border px-3 py-1.5 text-xs font-medium",
                "hover:bg-secondary md:inline-flex",
              )}
            >
              Admin
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

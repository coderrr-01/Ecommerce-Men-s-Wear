"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileMenu, SearchOverlay } from "@/components/layout/site-header-overlays";
import type { NavItem } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";
import { cn, formatPrice, getInitials } from "@/lib/utils";

interface SiteHeaderClientProps {
  nav: NavItem[];
  cartCount: number;
  user: { name: string | null; role: string } | null;
}

export function SiteHeaderClient({ nav, cartCount, user }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const isHome = pathname === "/";
  const transparent = isHome && !hasScrolled;

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <>
      <header
        className={cn(
          "z-40 w-full transition-[background-color,box-shadow,color] duration-300",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          transparent
            ? "text-white"
            : "border-b border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-xl",
        )}
      >
        <div className="bg-primary px-4 py-2 text-center text-[10px] tracking-[0.16em] text-primary-foreground uppercase sm:text-[11px]">
          {siteConfig.announcement.shipping}{" "}
          {formatPrice(siteConfig.shipping.freeShippingThreshold)}
        </div>

        <div className="mx-auto grid h-[4.5rem] w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-7 lg:h-[5rem] lg:px-10">
          <div className="flex items-center gap-2">
            <MobileMenu nav={nav} />
            <div className="hidden lg:block">
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-xs tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
                  Shop <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute top-full left-0 z-10 grid min-w-64 gap-1 border border-border/70 bg-background p-3 text-foreground shadow-xl">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
            <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
              {nav.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] tracking-[0.12em] uppercase opacity-75 transition-opacity hover:opacity-100"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <Logo
            textClassName={transparent ? "text-white" : "text-foreground"}
            className="justify-self-center"
          />

          <div className="flex items-center justify-self-end">
            <SearchOverlay />
            <Link
              href={user ? "/account/wishlist" : "/login?redirectTo=/account/wishlist"}
              className="hidden size-10 items-center justify-center rounded-md transition-colors hover:bg-secondary/70 sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              className="hidden size-10 items-center justify-center rounded-md transition-colors hover:bg-secondary/70 sm:flex"
              aria-label={user ? "Your account" : "Sign in"}
            >
              {user?.name ? (
                <span className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-foreground">
                  {getInitials(user.name)}
                </span>
              ) : (
                <User className="size-5" aria-hidden="true" />
              )}
            </Link>
            <CartDrawer cartCount={cartCount} />
            {user?.role === "ADMIN" || user?.role === "STAFF" ? (
              <Link
                href="/admin"
                className="ml-2 hidden rounded-md border border-current/20 px-3 py-2 text-[10px] tracking-wider uppercase hover:bg-secondary/70 md:inline-flex"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}

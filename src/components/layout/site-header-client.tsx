"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/layout/cart-drawer";
import { CategoryNavigation } from "@/components/layout/category-navigation";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenu, SearchOverlay } from "@/components/layout/site-header-overlays";
import { Logo } from "@/components/shared/logo";
import type { NavGroup, NavItem } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";
import type { CartData } from "@/features/cart/types";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import { motionDuration, motionEasing } from "@/lib/motion";

interface SiteHeaderClientProps {
  nav: NavItem[];
  navGroups: NavGroup[];
  cart: CartData | null;
  user: { name: string | null; role: string } | null;
}

export function SiteHeaderClient({ nav, navGroups, cart, user }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const previousScroll = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isHome = pathname === "/";
  const transparent = isHome && !hasScrolled;

  useEffect(() => {
    const updateScrollState = () => {
      const currentScroll = window.scrollY;
      setHasScrolled(currentScroll > 24);
      setHidden((current) => {
        if (currentScroll > 120 && currentScroll > previousScroll.current + 8) return true;
        if (currentScroll < previousScroll.current - 8 || currentScroll <= 24) return false;
        return current;
      });
      previousScroll.current = currentScroll;
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: motionDuration.standard, ease: motionEasing.enter }}
        className={cn(
          "z-40 w-full",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          transparent
            ? "text-primary-foreground"
            : "border-b border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-xl",
        )}
      >
        <div className="announcement-marquee bg-primary px-4 text-primary-foreground">
          <div className="announcement-track flex w-max items-center gap-8 py-2 text-[10px] tracking-[0.16em] uppercase sm:text-[11px]">
            {[0, 1, 2, 3].map((copy) => (
              <span key={copy} aria-hidden={copy > 0} className="flex items-center gap-8">
                <span>
                  {siteConfig.announcement.shipping}{" "}
                  {formatPrice(siteConfig.shipping.freeShippingThreshold)}
                </span>
                <span aria-hidden="true">✦</span>
              </span>
            ))}
          </div>
          <span className="sr-only">
            {siteConfig.announcement.shipping}{" "}
            {formatPrice(siteConfig.shipping.freeShippingThreshold)}
          </span>
        </div>

        <div className="mx-auto grid h-[4.25rem] w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:h-[4.75rem] sm:gap-3 sm:px-7 lg:px-10">
          <div className="flex items-center gap-2">
            <MobileMenu groups={navGroups} />
            <CategoryNavigation groups={navGroups} />
            <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
              <Link
                href="/shop?sort=newest"
                className="nav-underline text-[11px] tracking-[0.12em] uppercase opacity-75 hover:opacity-100"
              >
                New arrivals
              </Link>
              {nav.slice(0, 2).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-underline text-[11px] tracking-[0.12em] uppercase opacity-75 hover:opacity-100"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <Logo
            textClassName={transparent ? "text-primary-foreground" : "text-foreground"}
            className="justify-self-center"
          />

          <div className="flex items-center justify-self-end">
            <SearchOverlay />
            <Link
              href="/wishlist"
              className="hidden size-11 items-center justify-center rounded-md transition-colors hover:bg-secondary/70 sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              className="hidden size-11 items-center justify-center rounded-md transition-colors hover:bg-secondary/70 sm:flex"
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
            <CartDrawer cart={cart} />
            {user?.role === "ADMIN" || user?.role === "STAFF" ? (
              <Link
                href="/admin"
                className="ml-2 hidden min-h-11 items-center rounded-md border border-current/20 px-3 text-[10px] tracking-wider uppercase hover:bg-secondary/70 md:inline-flex"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </div>

        <nav
          aria-label="Shop categories"
          className="flex gap-5 overflow-x-auto border-t border-current/10 px-4 py-2.5 text-xs lg:hidden"
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 py-1">
              {item.title}
            </Link>
          ))}
        </nav>
      </motion.header>
      <MobileBottomNav />
    </>
  );
}

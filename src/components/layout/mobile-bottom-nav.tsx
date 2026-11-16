"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, Search, ShoppingBag, Store } from "lucide-react";
import { motion } from "motion/react";

import { motionDuration, motionEasing } from "@/lib/motion";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: House },
  { label: "Shop", href: "/shop", icon: Store },
  { label: "Search", href: "/shop", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

          return (
            <li key={label}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-accent"
                    transition={{ duration: motionDuration.fast, ease: motionEasing.enter }}
                  />
                ) : null}
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

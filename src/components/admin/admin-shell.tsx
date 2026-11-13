"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronRight,
  LayoutDashboard,
  Layers3,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Warehouse,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { adminNav } from "@/config/navigation";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: Layers3,
  package: Package,
  orders: ShoppingBag,
  inventory: Warehouse,
  customers: Users,
  settings: Settings,
  cart: Boxes,
  user: Users,
  heart: Boxes,
  "map-pin": Boxes,
} as const;

function breadcrumbTitle(path: string): string {
  return (
    adminNav.find((item) => item.href === path)?.title ??
    path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ??
    "Dashboard"
  );
}

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const crumbs = pathname.split("/").filter(Boolean);
  const currentLabel = breadcrumbTitle(pathname);

  return (
    <div className="min-h-dvh bg-secondary/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={menuOpen ? "Close admin navigation" : "Open admin navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
            <Logo href="/admin" />
            <Badge variant="outline" className="hidden sm:inline-flex">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/">View store</Link>
            </Button>
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
                <span className="grid size-8 place-items-center rounded-full bg-secondary font-medium">
                  {userName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-40 truncate sm:block">{userName}</span>
              </summary>
              <div className="absolute right-0 mt-2 w-52 rounded-md border border-border bg-background p-2 shadow-lg">
                <Link
                  href="/"
                  className="block rounded px-3 py-2 text-sm hover:bg-secondary sm:hidden"
                >
                  View store
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside
          className={cn(
            "lg:block",
            menuOpen
              ? "fixed inset-x-0 top-16 bottom-0 z-20 overflow-y-auto border-b border-border bg-background p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0"
              : "hidden",
          )}
        >
          <nav aria-label="Admin navigation" className="space-y-1 lg:sticky lg:top-24">
            {adminNav.map((item) => {
              const Icon = icons[item.icon ?? "dashboard"];
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {item.title}
                  {item.disabled ? <span className="sr-only">(coming soon)</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            {crumbs.length > 1 ? (
              <>
                <ChevronRight aria-hidden="true" className="size-3" />
                <span className="capitalize" aria-current="page">
                  {currentLabel}
                </span>
              </>
            ) : null}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NavGroup } from "@/config/navigation";
import { Logo } from "@/components/shared/logo";

export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Open navigation"
        onClick={() => dialog.current?.showModal()}
        className="lg:hidden"
      >
        <Menu />
      </Button>
      <dialog
        ref={dialog}
        aria-label="Store navigation"
        className="store-menu-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/45"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close menu"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </Button>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="h-[calc(100dvh-4.5rem)] overflow-y-auto px-5 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex gap-4 border-b border-border py-3 text-sm">
            <Link href="/shop" onClick={() => dialog.current?.close()} className="font-medium">
              Shop all
            </Link>
            <Link
              href="/shop?sort=newest"
              onClick={() => dialog.current?.close()}
              className="text-muted-foreground"
            >
              New arrivals
            </Link>
          </div>
          <div className="divide-y divide-border">
            {groups.map((group) => (
              <details key={group.title} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-serif text-xl [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="grid grid-cols-2 gap-1 pb-4">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => dialog.current?.close()}
                        className="flex min-h-11 items-center py-2 text-sm text-muted-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
            <Link
              href="/login"
              onClick={() => dialog.current?.close()}
              className="flex min-h-11 items-center text-sm"
            >
              Account
            </Link>
            <Link
              href="/wishlist"
              onClick={() => dialog.current?.close()}
              className="flex min-h-11 items-center text-sm"
            >
              Wishlist
            </Link>
          </div>
          <Link
            href="/policies/shipping"
            onClick={() => dialog.current?.close()}
            className="mt-4 inline-flex min-h-11 items-center text-sm text-muted-foreground"
          >
            Shipping information
          </Link>
        </nav>
      </dialog>
    </>
  );
}

export function SearchOverlay() {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  function openSearch() {
    dialog.current?.showModal();
    window.requestAnimationFrame(() => searchInput.current?.focus());
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Search products"
        onClick={openSearch}
      >
        <Search />
      </Button>
      <dialog
        ref={dialog}
        aria-label="Search the collection"
        className="search-dialog fixed inset-x-0 top-0 m-0 w-full max-w-none border-0 bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/40"
      >
        <form
          action="/shop"
          method="get"
          className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-8 sm:py-7"
        >
          <label htmlFor="store-search" className="sr-only">
            Search products
          </label>
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={searchInput}
            id="store-search"
            name="q"
            type="search"
            placeholder="Search the collection"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="outline" className="hidden sm:inline-flex">
            Search
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </Button>
        </form>
      </dialog>
    </>
  );
}

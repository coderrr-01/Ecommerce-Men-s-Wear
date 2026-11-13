"use client";

import { useRef } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NavItem } from "@/config/navigation";
import { Logo } from "@/components/shared/logo";

export function MobileMenu({ nav }: { nav: NavItem[] }) {
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
        className="store-menu-dialog fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(22rem,88vw)] border-0 bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/40"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
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
        <nav aria-label="Mobile navigation" className="grid gap-1 p-5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => dialog.current?.close()}
              className="border-b border-border/70 py-4 font-serif text-2xl"
            >
              {item.title}
            </Link>
          ))}
          <Link href="/login" className="border-b border-border/70 py-4 font-serif text-2xl">
            Account
          </Link>
          <Link
            href="/account/wishlist"
            className="border-b border-border/70 py-4 font-serif text-2xl"
          >
            Wishlist
          </Link>
          <Link href="/policies/shipping" className="mt-4 text-sm text-muted-foreground">
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

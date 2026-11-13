"use client";

import { useRef } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export function CartDrawer({ cartCount }: { cartCount: number }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="relative flex size-10 items-center justify-center rounded-md transition-colors hover:bg-secondary/70"
        aria-label={cartCount > 0 ? `Shopping bag, ${cartCount} items` : "Shopping bag"}
      >
        <ShoppingBag className="size-5" aria-hidden="true" />
        {cartCount > 0 ? (
          <span className="badge-pop absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] leading-4 font-semibold text-accent-foreground">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </button>
      <dialog
        ref={dialog}
        aria-label="Shopping bag"
        className="cart-drawer-dialog fixed inset-y-0 right-0 m-0 h-dvh max-h-none w-[min(26rem,92vw)] border-0 bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/40"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-2xl">Shopping bag</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close shopping bag"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </Button>
        </div>
        <div className="flex h-[calc(100%-5rem)] flex-col p-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-serif text-2xl">
              {cartCount === 0
                ? "Your bag is empty"
                : `${cartCount} ${cartCount === 1 ? "piece" : "pieces"} in your bag`}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              {siteConfig.announcement.shipping}{" "}
              {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link
              href={cartCount === 0 ? "/shop" : "/cart"}
              onClick={() => dialog.current?.close()}
            >
              {cartCount === 0 ? "Explore the collection" : "View bag"}
            </Link>
          </Button>
        </div>
      </dialog>
    </>
  );
}

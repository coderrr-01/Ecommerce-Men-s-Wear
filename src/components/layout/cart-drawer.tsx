"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import type { CartData } from "@/features/cart/types";
import { formatPrice } from "@/lib/utils";

export function CartDrawer({ cart }: { cart: CartData | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cartCount = cart?.itemCount ?? 0;

  useEffect(() => {
    const openAfterAdd = () => dialog.current?.showModal();
    window.addEventListener("cart:added", openAfterAdd);
    return () => window.removeEventListener("cart:added", openAfterAdd);
  }, []);

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
          <h2 className="font-serif text-2xl">
            Shopping bag <span className="text-sm text-muted-foreground">({cartCount})</span>
          </h2>
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
        <div className="flex h-[calc(100%-5rem)] flex-col p-5 sm:p-6">
          {cart?.items.length ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {cart.freeShippingRemaining > 0
                  ? `Add ${formatPrice(cart.freeShippingRemaining)} for complimentary shipping.`
                  : "Your bag qualifies for complimentary shipping."}
              </p>
              <div
                role="progressbar"
                aria-label="Progress toward free shipping"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(
                  100,
                  Math.round((cart.subtotal / siteConfig.shipping.freeShippingThreshold) * 100),
                )}
                className="mb-5 h-1 overflow-hidden bg-secondary"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: Math.min(1, cart.subtotal / siteConfig.shipping.freeShippingThreshold),
                  }}
                  transition={{ duration: 0.4 }}
                  className="h-full origin-left bg-accent"
                />
              </div>
              <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
                {cart.items.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.16) }}
                    className="flex gap-3 py-4"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => dialog.current?.close()}
                      className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-secondary"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => dialog.current?.close()}
                        className="line-clamp-2 text-sm font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.color} · {item.size} · Qty {item.quantity}
                      </p>
                      <p className="mt-2 text-sm">{formatPrice(item.lineTotal)}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
                </div>
                <Button asChild size="lg" className="mt-4 w-full">
                  <Link href="/cart" onClick={() => dialog.current?.close()}>
                    View bag
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 font-serif text-2xl">Your bag is empty</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                {siteConfig.announcement.shipping}{" "}
                {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
              </p>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href="/shop" onClick={() => dialog.current?.close()}>
                  Explore the collection
                </Link>
              </Button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

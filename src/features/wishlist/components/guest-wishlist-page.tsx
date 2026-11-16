"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/catalog/components/product-card";
import { useGuestWishlist } from "@/features/wishlist/components/guest-wishlist-provider";
import { fadeUpVariants } from "@/lib/motion";

export function GuestWishlistPage() {
  const { items, unavailable, clear } = useGuestWishlist();

  if (unavailable) {
    return (
      <div role="alert" className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-serif text-3xl">Wishlist unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This browser is not allowing local storage, so saved items cannot be shown.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        className="mx-auto flex min-h-[55svh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center"
      >
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Saved for later
        </p>
        <h1 className="mt-3 font-serif text-4xl">Your wishlist is waiting.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Save a piece you love and it will be ready when you are.
        </p>
        <Button asChild className="mt-6 min-h-11">
          <Link href="/shop">Explore the collection</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Saved for later
          </p>
          <h1 className="mt-2 font-serif text-4xl">Your wishlist</h1>
        </div>
        <Button type="button" variant="outline" className="min-h-11" onClick={clear}>
          Clear all
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

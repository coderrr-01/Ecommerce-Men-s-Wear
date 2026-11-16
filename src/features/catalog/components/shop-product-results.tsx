"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import type { ProductCardData } from "@/features/catalog/types";
import { formatPrice } from "@/lib/utils";
import { fadeUpVariants, motionDuration, motionEasing } from "@/lib/motion";

export function ShopProductResults({ products }: { products: ProductCardData[] }) {
  const prices = products.map((product) => product.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const [priceLimit, setPriceLimit] = useState(maxPrice);
  const filteredProducts = useMemo(
    () => products.filter((product) => product.price <= priceLimit),
    [products, priceLimit],
  );

  return (
    <div className="mt-7 space-y-6">
      {products.length > 0 ? (
        <div className="max-w-xl rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="shop-price-limit" className="text-sm font-medium">
              Max price on this page
            </label>
            <output htmlFor="shop-price-limit" className="text-sm tabular-nums">
              {formatPrice(priceLimit)}
            </output>
          </div>
          <input
            id="shop-price-limit"
            type="range"
            min={minPrice}
            max={maxPrice}
            step={10000}
            value={priceLimit}
            disabled={minPrice === maxPrice}
            onChange={(event) => setPriceLimit(Number(event.currentTarget.value))}
            className="mt-3 h-11 w-full accent-accent"
            aria-label="Maximum price for the currently loaded products"
          />
          <p className="text-xs text-muted-foreground">
            Price filtering applies to the products currently loaded on this page.
          </p>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {filteredProducts.length > 0 ? (
          <motion.div
            key="results"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeUpVariants}
            transition={{ duration: motionDuration.standard, ease: motionEasing.enter }}
          >
            <p className="mb-4 text-xs text-muted-foreground" role="status" aria-live="polite">
              Showing {filteredProducts.length} of {products.length} loaded products
            </p>
            <ProductGrid products={filteredProducts} priorityCount={4} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeUpVariants}
            transition={{ duration: motionDuration.standard, ease: motionEasing.enter }}
            className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center"
          >
            <h2 className="font-serif text-2xl">No pieces in this price range.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Raise the price limit or browse all available styles.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 min-h-11"
              onClick={() => setPriceLimit(maxPrice)}
            >
              Reset price
            </Button>
            <Link href="/shop" className="mt-3 text-xs underline underline-offset-4">
              Clear all filters
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

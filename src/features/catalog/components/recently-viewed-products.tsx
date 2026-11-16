"use client";

import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ProductGrid } from "@/features/catalog/components/product-grid";
import type { ProductCardData } from "@/features/catalog/types";
import { recentlyViewedStore } from "@/features/catalog/storage/recently-viewed";

export function RecentlyViewedProducts({ product }: { product: ProductCardData }) {
  const snapshot = useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    recentlyViewedStore.getServerSnapshot,
  );
  const products = snapshot.items.filter((item) => item.id !== product.id);

  useEffect(() => {
    try {
      recentlyViewedStore.record(product);
    } catch {
      toast.error("Recently viewed products are unavailable in this browser.");
    }
  }, [product]);

  return products.length > 0 ? (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="mb-6 font-serif text-3xl tracking-tight">Recently viewed</h2>
      <ProductGrid products={products} />
    </section>
  ) : null;
}

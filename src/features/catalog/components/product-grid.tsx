"use client";

import { AnimatePresence, motion } from "motion/react";

import { ProductCard } from "@/features/catalog/components/product-card";
import type { ProductCardData } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { motionDuration, motionEasing } from "@/lib/motion";

interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  priorityCount?: number;
  layout?: "grid" | "carousel";
}

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
  layout = "grid",
}: ProductGridProps) {
  return (
    <div
      role="list"
      className={cn(
        layout === "carousel"
          ? "grid snap-x snap-mandatory auto-cols-[68%] grid-flow-col grid-cols-none gap-4 overflow-x-auto overscroll-x-contain pb-3 sm:auto-cols-[38%] sm:gap-6 lg:auto-cols-[27%]"
          : "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            role="listitem"
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: motionDuration.fast, ease: motionEasing.enter }}
            className={layout === "carousel" ? "snap-start" : undefined}
          >
            <ProductCard product={product} priority={index < priorityCount} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

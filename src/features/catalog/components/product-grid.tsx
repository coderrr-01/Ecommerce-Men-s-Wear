import { ProductCard } from "@/features/catalog/components/product-card";
import type { ProductCardData } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

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
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          className={layout === "carousel" ? "snap-start" : undefined}
        />
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/features/catalog/types";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  return (
    <article className={cn("group", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && product.inStock ? (
              <Badge className="bg-background text-foreground">New</Badge>
            ) : null}
            {product.discountPercent > 0 ? (
              <Badge variant="accent">{product.discountPercent}% off</Badge>
            ) : null}
          </div>

          {!product.inStock ? (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <Badge variant="secondary" className="px-3 py-1">
                Sold out
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            {product.brand ?? product.categoryName}
          </p>
          <h3 className="text-sm leading-5 font-medium">{product.name}</h3>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

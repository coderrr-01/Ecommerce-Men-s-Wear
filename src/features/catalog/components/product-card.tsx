"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/features/catalog/types";
import { useQuickView } from "@/features/catalog/components/quick-view-provider";
import { useGuestWishlist } from "@/features/wishlist/components/guest-wishlist-provider";
import { cn, formatPrice } from "@/lib/utils";
import { motionDuration, motionEasing, motionSpring } from "@/lib/motion";

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const openQuickView = useQuickView();
  const { items, toggle } = useGuestWishlist();
  const wished = items.some((item) => item.id === product.id);

  return (
    <article role="listitem" className={cn("group min-w-0", className)}>
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              preload={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 78vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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
        </Link>

        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <motion.button
            type="button"
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            aria-pressed={wished}
            onClick={() => toggle(product)}
            whileTap={{ scale: 0.86 }}
            animate={wished ? { scale: [1, 1.28, 1] } : { scale: 1 }}
            transition={
              wished
                ? { duration: motionDuration.standard, ease: motionEasing.enter }
                : motionSpring.snappy
            }
            className="grid size-11 place-items-center rounded-full bg-background/95 text-foreground shadow-sm"
          >
            <Heart
              className={cn("size-4", wished && "fill-accent text-accent")}
              aria-hidden="true"
            />
          </motion.button>
        </div>

        <button
          type="button"
          onClick={() => openQuickView(product)}
          className="product-card-quick-view absolute inset-x-2 bottom-2 flex min-h-11 items-center justify-center gap-2 bg-background/95 px-3 text-xs font-medium text-foreground shadow-sm"
        >
          <Eye className="size-4" aria-hidden="true" />
          Quick view
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="mt-3 block space-y-1">
        <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          {product.brand ?? product.categoryName}
        </p>
        <h3 className="text-sm leading-5 font-medium transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

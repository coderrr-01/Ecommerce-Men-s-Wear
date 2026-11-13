"use client";

import { useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartForm } from "@/features/catalog/components/add-to-cart-form";
import { SizeGuide } from "@/features/catalog/components/size-guide";
import { siteConfig } from "@/config/site.config";
import type { ProductVariantOption } from "@/features/catalog/types";
import { cn, formatPrice } from "@/lib/utils";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function compareSizes(a: string, b: string): number {
  const aIndex = SIZE_ORDER.indexOf(a);
  const bIndex = SIZE_ORDER.indexOf(b);
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  return a.localeCompare(b, undefined, { numeric: true });
}

function firstAvailableSize(variants: ProductVariantOption[], color: string): string {
  const sizes = variants
    .filter((variant) => variant.color === color)
    .sort((a, b) => compareSizes(a.size, b.size));
  return (sizes.find((variant) => variant.stock > 0) ?? sizes[0])?.size ?? "";
}

interface ProductPurchasePanelProps {
  variants: ProductVariantOption[];
}

export function ProductPurchasePanel({ variants }: ProductPurchasePanelProps) {
  const colors = variants.reduce<{ name: string; hex: string | null }[]>((result, variant) => {
    if (!result.some((color) => color.name === variant.color)) {
      result.push({ name: variant.color, hex: variant.colorHex });
    }
    return result;
  }, []);

  const initialColor =
    colors.find((color) =>
      variants.some((variant) => variant.color === color.name && variant.stock > 0),
    )?.name ??
    colors[0]?.name ??
    "";

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(() =>
    firstAvailableSize(variants, initialColor),
  );

  const sizes = variants
    .filter((variant) => variant.color === selectedColor)
    .sort((a, b) => compareSizes(a.size, b.size));
  const selectedVariant = variants.find(
    (variant) => variant.color === selectedColor && variant.size === selectedSize,
  );
  const lowestPrice =
    variants.length > 0 ? Math.min(...variants.map((variant) => variant.price)) : 0;
  const price = selectedVariant?.price ?? lowestPrice;
  const compareAtPrice =
    selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > price
      ? selectedVariant.compareAtPrice
      : null;
  const stock = selectedVariant?.stock ?? 0;

  function selectColor(colorName: string) {
    setSelectedColor(colorName);
    setSelectedSize(firstAvailableSize(variants, colorName));
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-semibold">{formatPrice(price)}</span>
          {compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
          {compareAtPrice ? (
            <Badge variant="accent">Save {formatPrice(compareAtPrice - price)}</Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Inclusive of all taxes. Shipping calculated at checkout.
        </p>
      </div>

      {colors.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Colour: <span className="font-normal">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => selectColor(color.name)}
                aria-label={`Select ${color.name}`}
                aria-pressed={selectedColor === color.name}
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 transition",
                  selectedColor === color.name
                    ? "border-foreground"
                    : "border-transparent hover:border-border",
                )}
              >
                <span
                  className="size-6 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex ?? "var(--muted)" }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Size: <span className="font-normal">{selectedSize}</span>
            </p>
            <SizeGuide sizes={sizes} />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedSize(variant.size)}
                aria-pressed={selectedSize === variant.size}
                disabled={variant.stock === 0}
                className={cn(
                  "min-w-12 rounded-md border px-3 py-2 text-sm transition",
                  selectedSize === variant.size
                    ? "border-foreground bg-foreground text-background"
                    : "border-input bg-background hover:border-foreground",
                  variant.stock === 0 &&
                    "cursor-not-allowed text-muted-foreground line-through opacity-60",
                )}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <p
          className={cn(
            "text-xs",
            stock === 0 ? "text-destructive" : stock <= 3 ? "text-accent" : "text-muted-foreground",
          )}
        >
          {stock === 0
            ? "Sold out in this combination."
            : stock <= 3
              ? `Only ${stock} left in stock.`
              : "In stock and ready to ship."}
        </p>

        {selectedVariant && stock > 0 ? (
          <AddToCartForm
            key={selectedVariant.id}
            variantId={selectedVariant.id}
            maxQuantity={Math.min(10, stock)}
            priceLabel={formatPrice(price)}
          />
        ) : (
          <Button type="button" size="lg" className="w-full" disabled>
            Sold out
          </Button>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Truck className="size-4 shrink-0" aria-hidden="true" />
          Free shipping on orders over {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          {siteConfig.home.benefits.payments.title}
        </p>
        <p>{siteConfig.shipping.returnsWindowDays}-day returns and exchanges.</p>
        {selectedVariant ? <p className="text-xs">SKU: {selectedVariant.sku}</p> : null}
      </div>
    </div>
  );
}

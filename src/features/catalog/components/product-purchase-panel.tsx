"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { addToCartAction } from "@/features/cart/actions/cart.actions";
import { initialCartActionState } from "@/features/cart/types";
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

function AddToCartForm({ variantId, maxQuantity }: { variantId: string; maxQuantity: number }) {
  const [state, formAction, isPending] = useActionState(addToCartAction, initialCartActionState);
  const pathname = usePathname();

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="variantId" value={variantId} />
      <div className="flex gap-2">
        <select
          name="quantity"
          aria-label="Quantity"
          className="h-11 w-20 rounded-md border border-input bg-background px-2 text-sm"
          defaultValue="1"
        >
          {Array.from({ length: Math.max(1, maxQuantity) }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
          {isPending ? "Adding…" : "Add to bag"}
        </Button>
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.message}{" "}
          {state.requiresAuth ? (
            <Link
              href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
              className="font-medium underline underline-offset-4"
            >
              Sign in
            </Link>
          ) : null}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
        >
          {state.message}{" "}
          <Link href="/cart" className="font-medium underline underline-offset-4">
            View bag
          </Link>
        </p>
      ) : null}
    </form>
  );
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
    <div className="space-y-6">
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
                  style={{ backgroundColor: color.hex ?? "#d6d3d1" }}
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
          />
        ) : (
          <Button type="button" size="lg" className="w-full" disabled>
            Sold out
          </Button>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
        <p>
          Free shipping on orders over {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
        </p>
        <p>{siteConfig.shipping.returnsWindowDays}-day returns and exchanges.</p>
        {selectedVariant ? <p className="text-xs">SKU: {selectedVariant.sku}</p> : null}
      </div>
    </div>
  );
}

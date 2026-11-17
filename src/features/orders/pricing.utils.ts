import { siteConfig } from "@/config/site.config";
import { ConflictError, InsufficientStockError, ValidationError } from "@/lib/errors";
import { calculateOrderTotals } from "@/features/orders/utils";
import type { OrderPricingCartItem, PricedOrder } from "@/features/orders/types";

export function priceOrderCart(
  items: OrderPricingCartItem[],
  expectedSubtotal: number,
): PricedOrder {
  const pricedItems = items.map(({ quantity, variant }) => {
    if (
      !variant.isActive ||
      variant.deletedAt ||
      !variant.product.isActive ||
      variant.product.deletedAt
    ) {
      throw new ConflictError("A product in your bag is no longer available.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new ValidationError("Cart quantities must be between 1 and 10.");
    }
    if (quantity > variant.stock) throw new InsufficientStockError();
    return {
      productId: variant.product.id,
      productSlug: variant.product.slug,
      variantId: variant.id,
      name: variant.product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      quantity,
      total: variant.price * quantity,
      imageUrl: variant.product.images[0]?.url ?? null,
    };
  });
  const totals = calculateOrderTotals(
    pricedItems.map(({ price, quantity }) => ({ price, quantity })),
    {
      standardFee: siteConfig.shipping.standardFee,
      freeShippingThreshold: siteConfig.shipping.freeShippingThreshold,
    },
  );
  if (totals.subtotal !== expectedSubtotal) {
    throw new ConflictError("Prices changed. Review your refreshed bag before placing the order.");
  }
  return { ...totals, items: pricedItems };
}

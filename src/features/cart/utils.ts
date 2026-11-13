import { siteConfig } from "@/config/site.config";
import type { CartData, CartLine } from "@/features/cart/types";

interface CartTotalsOptions {
  freeShippingThreshold?: number;
  standardShippingFee?: number;
}

export function calculateCartTotals(
  items: CartLine[],
  {
    freeShippingThreshold = siteConfig.shipping.freeShippingThreshold,
    standardShippingFee = siteConfig.shipping.standardFee,
  }: CartTotalsOptions = {},
): CartData {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingTotal =
    subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : standardShippingFee;

  return {
    items,
    itemCount,
    subtotal,
    shippingTotal,
    grandTotal: subtotal + shippingTotal,
    freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal),
  };
}

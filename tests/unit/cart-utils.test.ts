import { describe, expect, it } from "vitest";

import type { CartLine } from "@/features/cart/types";
import { calculateCartTotals } from "@/features/cart/utils";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: "item_1",
    variantId: "variant_1",
    name: "Classic Oxford Shirt",
    slug: "classic-oxford-shirt",
    sku: "MRD-001-M-BLA",
    size: "M",
    color: "White",
    imageUrl: "/placeholder.svg",
    imageAlt: "Classic Oxford Shirt",
    unitPrice: 100000,
    quantity: 1,
    lineTotal: 100000,
    stock: 10,
    ...overrides,
  };
}

describe("calculateCartTotals", () => {
  it("returns zeroes for an empty cart", () => {
    expect(calculateCartTotals([])).toMatchObject({
      itemCount: 0,
      subtotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
    });
  });

  it("adds standard shipping below the free threshold", () => {
    const cart = calculateCartTotals([line()], {
      freeShippingThreshold: 150000,
      standardShippingFee: 9900,
    });

    expect(cart.subtotal).toBe(100000);
    expect(cart.shippingTotal).toBe(9900);
    expect(cart.grandTotal).toBe(109900);
    expect(cart.freeShippingRemaining).toBe(50000);
  });

  it("waives shipping once the threshold is met", () => {
    const cart = calculateCartTotals(
      [
        line({
          quantity: 2,
          lineTotal: 200000,
        }),
      ],
      { freeShippingThreshold: 150000, standardShippingFee: 9900 },
    );

    expect(cart.itemCount).toBe(2);
    expect(cart.shippingTotal).toBe(0);
    expect(cart.grandTotal).toBe(200000);
    expect(cart.freeShippingRemaining).toBe(0);
  });
});

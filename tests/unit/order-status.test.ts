import { describe, expect, it } from "vitest";

import { isAllowedOrderTransition } from "@/features/orders/status.utils";
import { applyOrderStockChange } from "@/features/orders/stock.utils";

describe("order status transitions", () => {
  it("allows only the fulfilment sequence or cancellation before shipment", () => {
    expect(isAllowedOrderTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(isAllowedOrderTransition("CONFIRMED", "PACKED")).toBe(true);
    expect(isAllowedOrderTransition("PACKED", "SHIPPED")).toBe(true);
    expect(isAllowedOrderTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(isAllowedOrderTransition("PENDING", "CANCELLED")).toBe(true);
    expect(isAllowedOrderTransition("PENDING", "SHIPPED")).toBe(false);
    expect(isAllowedOrderTransition("DELIVERED", "CANCELLED")).toBe(false);
  });
});

describe("order stock changes", () => {
  it("deducts confirmed quantities and writes signed movement records", async () => {
    let stock = 5;
    const movements: number[] = [];
    await applyOrderStockChange(
      {
        decrement: async (_variantId, quantity) => {
          if (stock < quantity) return false;
          stock -= quantity;
          return true;
        },
        increment: async () => false,
        movement: async (_variantId, delta) => {
          movements.push(delta);
        },
      },
      [{ variantId: "variant-1", quantity: 2 }],
      "staff-1",
      "decrement",
      "Order confirmed",
    );

    expect(stock).toBe(3);
    expect(movements).toEqual([-2]);
  });

  it("rejects confirmation when stock is insufficient without writing a movement", async () => {
    const movements: number[] = [];
    await expect(
      applyOrderStockChange(
        {
          decrement: async () => false,
          increment: async () => false,
          movement: async (_variantId, delta) => {
            movements.push(delta);
          },
        },
        [{ variantId: "variant-1", quantity: 4 }],
        "staff-1",
        "decrement",
        "Order confirmed",
      ),
    ).rejects.toThrow("One or more items are no longer available");
    expect(movements).toEqual([]);
  });

  it("restores cancelled confirmed quantities", async () => {
    let stock = 3;
    const movements: number[] = [];
    await applyOrderStockChange(
      {
        decrement: async () => false,
        increment: async (_variantId, quantity) => {
          stock += quantity;
          return true;
        },
        movement: async (_variantId, delta) => {
          movements.push(delta);
        },
      },
      [{ variantId: "variant-1", quantity: 2 }],
      "staff-1",
      "restore",
      "Order cancelled",
    );

    expect(stock).toBe(5);
    expect(movements).toEqual([2]);
  });
});

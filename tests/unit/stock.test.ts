import { describe, expect, it } from "vitest";

import { assertStockAvailable, isLowStock } from "@/features/inventory/services/stock";
import { InsufficientStockError } from "@/lib/errors";

describe("assertStockAvailable", () => {
  it("allows a valid reservation", () => {
    expect(() => assertStockAvailable({ stock: 5, requested: 2 })).not.toThrow();
  });

  it("allows adding to an existing cart quantity within stock", () => {
    expect(() =>
      assertStockAvailable({ stock: 5, requested: 2, currentQuantity: 3 }),
    ).not.toThrow();
  });

  it("rejects sold-out variants", () => {
    expect(() => assertStockAvailable({ stock: 0, requested: 1 })).toThrow(InsufficientStockError);
  });

  it("rejects quantities beyond available stock", () => {
    expect(() => assertStockAvailable({ stock: 5, requested: 4, currentQuantity: 2 })).toThrow(
      "Only 3 units available.",
    );
  });

  it("rejects invalid requested quantities", () => {
    expect(() => assertStockAvailable({ stock: 5, requested: 0 })).toThrow(InsufficientStockError);
    expect(() => assertStockAvailable({ stock: 5, requested: 1.5 })).toThrow(
      InsufficientStockError,
    );
  });
});

describe("isLowStock", () => {
  it("flags low but available stock", () => {
    expect(isLowStock(3)).toBe(true);
    expect(isLowStock(0)).toBe(false);
    expect(isLowStock(10)).toBe(false);
  });
});

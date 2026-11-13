import { describe, expect, it, vi } from "vitest";

import { createStockAdjustmentService } from "@/features/inventory/stock.service";
import { getInventoryState, toInventoryCsv } from "@/features/inventory/utils";
import { ValidationError } from "@/lib/errors";

describe("stock adjustment service", () => {
  it("writes a valid adjustment through its repository boundary", async () => {
    const writeStock = vi.fn(async () => ({ updated: 1 }));
    const adjustStock = createStockAdjustmentService(writeStock);

    await expect(
      adjustStock([{ variantId: "variant-1", stock: 9 }], "user-1", "Count correction"),
    ).resolves.toEqual({ updated: 1 });
    expect(writeStock).toHaveBeenCalledWith(
      [{ variantId: "variant-1", stock: 9 }],
      "user-1",
      "Count correction",
    );
  });

  it("rejects negative or fractional targets before any database write", async () => {
    const writeStock = vi.fn(async () => ({ updated: 1 }));
    const adjustStock = createStockAdjustmentService(writeStock);

    await expect(
      adjustStock([{ variantId: "variant-1", stock: -1 }], "user-1", "Bad count"),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      adjustStock([{ variantId: "variant-1", stock: 1.5 }], "user-1", "Bad count"),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(writeStock).not.toHaveBeenCalled();
  });
});

describe("inventory state and export", () => {
  it("separates in-stock, low-stock and out-of-stock variants", () => {
    expect(getInventoryState(0, 5)).toBe("out");
    expect(getInventoryState(5, 5)).toBe("low");
    expect(getInventoryState(6, 5)).toBe("in");
  });

  it("escapes CSV cells and neutralizes spreadsheet formulas", () => {
    const csv = toInventoryCsv([
      { product: "=1+1", sku: 'SKU,"1', size: "M", color: "Navy", stock: 2, state: "low" },
    ]);
    expect(csv).toContain("\"'=1+1\"");
    expect(csv).toContain("\"SKU,\"\"1\"");
  });
});

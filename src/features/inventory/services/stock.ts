import { InsufficientStockError } from "@/lib/errors";

interface StockCheck {
  stock: number;
  requested: number;
  currentQuantity?: number;
}

/**
 * Pure stock rule used by cart and order flows. The database transaction must
 * still re-read stock before committing a reservation or decrement.
 */
export function assertStockAvailable({ stock, requested, currentQuantity = 0 }: StockCheck): void {
  if (!Number.isInteger(requested) || requested < 1) {
    throw new InsufficientStockError("Requested quantity must be at least 1.");
  }

  if (stock < 1) {
    throw new InsufficientStockError("This item is sold out.");
  }

  if (currentQuantity + requested > stock) {
    const remaining = Math.max(0, stock - currentQuantity);
    throw new InsufficientStockError(
      remaining === 0
        ? "You already have the maximum available quantity in your bag."
        : `Only ${remaining} unit${remaining === 1 ? "" : "s"} available.`,
    );
  }
}

export function isLowStock(stock: number, threshold = 5): boolean {
  return stock > 0 && stock <= threshold;
}

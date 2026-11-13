import { validateStockTarget } from "@/features/inventory/utils";

type StockAdjustment = { variantId: string; stock: number };
type StockWriter = (
  items: StockAdjustment[],
  userId: string,
  reason: string,
) => Promise<{ updated: number }>;

export function createStockAdjustmentService(writeStock: StockWriter) {
  return async function adjustStock(
    items: StockAdjustment[],
    userId: string,
    reason: string,
  ) {
    for (const item of items) validateStockTarget(item.stock);
    return writeStock(items, userId, reason);
  };
}

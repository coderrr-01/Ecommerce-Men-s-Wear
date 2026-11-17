import { ConflictError, InsufficientStockError } from "@/lib/errors";

export interface OrderStockItem {
  variantId: string | null;
  quantity: number;
}

export interface OrderStockWriter {
  decrement(variantId: string, quantity: number): Promise<boolean>;
  increment(variantId: string, quantity: number): Promise<boolean>;
  movement(variantId: string, delta: number, userId: string, reason: string): Promise<void>;
}

export async function applyOrderStockChange(
  writer: OrderStockWriter,
  items: OrderStockItem[],
  userId: string,
  direction: "decrement" | "restore",
  reason: string,
): Promise<void> {
  for (const item of items) {
    if (!item.variantId) throw new ConflictError("An order variant is no longer available.");
    const changed =
      direction === "decrement"
        ? await writer.decrement(item.variantId, item.quantity)
        : await writer.increment(item.variantId, item.quantity);
    if (!changed) {
      if (direction === "decrement") throw new InsufficientStockError();
      throw new ConflictError("An order variant could not be restored to stock.");
    }
    await writer.movement(
      item.variantId,
      direction === "decrement" ? -item.quantity : item.quantity,
      userId,
      reason,
    );
  }
}

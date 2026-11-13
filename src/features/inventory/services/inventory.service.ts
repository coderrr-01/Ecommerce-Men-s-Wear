import "server-only";

import { siteConfig } from "@/config/site.config";
import {
  findInventoryForExport,
  findInventoryPage,
  saveInventoryStock,
} from "@/features/inventory/repositories/inventory.repository";
import type { InventoryQuery } from "@/features/inventory/schemas/inventory.schema";
import { createStockAdjustmentService } from "@/features/inventory/stock.service";
import { getInventoryState, toInventoryCsv } from "@/features/inventory/utils";

const adjustStock = createStockAdjustmentService(saveInventoryStock);

export async function getInventory(query: InventoryQuery) {
  const threshold = siteConfig.inventory.lowStockThreshold;
  let result = await findInventoryPage(query, threshold);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const page = Math.min(query.page, totalPages);
  if (page !== query.page) {
    result = await findInventoryPage({ ...query, page }, threshold);
  }
  return {
    rows: result.rows.map((row) => ({
      ...row,
      state: getInventoryState(row.stock, threshold),
    })),
    total: result.total,
    page,
    pageSize: result.pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
    lowStockThreshold: threshold,
  };
}

export async function updateInventoryStock(
  items: { variantId: string; stock: number }[],
  userId: string,
  reason: string,
) {
  return adjustStock(items, userId, reason);
}

export async function exportInventory(query: { q: string; state: "all" | "low" | "out" }) {
  const threshold = siteConfig.inventory.lowStockThreshold;
  const rows = await findInventoryForExport(query, threshold);
  return toInventoryCsv(
    rows.map((row) => ({
      product: row.product.name,
      sku: row.sku,
      size: row.size,
      color: row.color,
      stock: row.stock,
      state: getInventoryState(row.stock, threshold),
    })),
  );
}

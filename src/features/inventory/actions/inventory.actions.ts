"use server";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import {
  bulkStockUpdateSchema,
  stockUpdateSchema,
} from "@/features/inventory/schemas/inventory.schema";
import { updateInventoryStock } from "@/features/inventory/services/inventory.service";
import { executeAction } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";

export async function updateVariantStockAction(
  input: unknown,
): Promise<ApiResponse<{ updated: number }>> {
  return executeAction("admin.inventory.update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = stockUpdateSchema.parse(input);
    return updateInventoryStock(
      [{ variantId: data.variantId, stock: data.stock }],
      user.id,
      data.reason,
    );
  });
}

export async function bulkUpdateStockAction(
  input: unknown,
): Promise<ApiResponse<{ updated: number }>> {
  return executeAction("admin.inventory.bulk-update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = bulkStockUpdateSchema.parse(input);
    return updateInventoryStock(data.items, user.id, data.reason);
  });
}

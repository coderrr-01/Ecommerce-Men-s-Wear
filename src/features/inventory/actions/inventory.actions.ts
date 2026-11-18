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
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

export async function updateVariantStockAction(
  input: unknown,
): Promise<ApiResponse<{ updated: number }>> {
  return executeAction("admin.inventory.update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = stockUpdateSchema.parse(input);
    const result = await updateInventoryStock(
      [{ variantId: data.variantId, stock: data.stock }],
      user.id,
      data.reason,
    );
    await recordAdminAudit(user.id, "inventory.stock.update", "variant", data.variantId, {
      stock: data.stock,
    });
    return result;
  });
}

export async function bulkUpdateStockAction(
  input: unknown,
): Promise<ApiResponse<{ updated: number }>> {
  return executeAction("admin.inventory.bulk-update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = bulkStockUpdateSchema.parse(input);
    const result = await updateInventoryStock(data.items, user.id, data.reason);
    await recordAdminAudit(user.id, "inventory.stock.bulk_update", "variant", undefined, {
      count: result.updated,
    });
    return result;
  });
}

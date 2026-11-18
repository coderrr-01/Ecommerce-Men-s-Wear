"use server";

import { ADMIN_ROLES } from "@/config/constants";
import { categorySchema } from "@/features/catalog/schemas/category.schema";
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from "@/features/catalog/services/category.service";
import { requireRole } from "@/features/auth/services/session.service";
import { executeAction } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

export async function createCategoryAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.create", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const category = await createAdminCategory(categorySchema.parse(input));
    await recordAdminAudit(user.id, "category.create", "category", category.id);
    return category;
  });
}

export async function updateCategoryAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = categorySchema.parse(input);
    if (!data.id) throw new Error("Category id is required.");
    const category = await updateAdminCategory(data.id, data);
    await recordAdminAudit(user.id, "category.update", "category", category.id);
    return category;
  });
}

export async function deleteCategoryAction(id: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.delete", async () => {
    const user = await requireRole(["ADMIN"], { throwOnDenied: true });
    const parsedId = categorySchema.shape.id.unwrap().parse(id);
    const result = await deleteAdminCategory(parsedId);
    await recordAdminAudit(user.id, "category.delete", "category", result.id);
    return result;
  });
}

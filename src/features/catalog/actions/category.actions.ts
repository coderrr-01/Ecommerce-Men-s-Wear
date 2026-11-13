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

export async function createCategoryAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.create", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    return createAdminCategory(categorySchema.parse(input));
  });
}

export async function updateCategoryAction(
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.update", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = categorySchema.parse(input);
    if (!data.id) throw new Error("Category id is required.");
    return updateAdminCategory(data.id, data);
  });
}

export async function deleteCategoryAction(id: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.category.delete", async () => {
    await requireRole(["ADMIN"], { throwOnDenied: true });
    const parsedId = categorySchema.shape.id.unwrap().parse(id);
    return deleteAdminCategory(parsedId);
  });
}

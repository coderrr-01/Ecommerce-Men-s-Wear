"use server";

import { z } from "zod";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { productSchema } from "@/features/catalog/schemas/product.schema";
import {
  isAdminProductSlugAvailable,
  manageProducts,
  saveProduct,
} from "@/features/catalog/services/product-admin.service";
import { executeAction } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

const slugCheckSchema = z.object({
  slug: z.string().trim().min(2).max(180),
  id: z.string().cuid().optional(),
});

const bulkSchema = z
  .object({
    ids: z.array(z.string().cuid()).min(1).max(100),
    action: z.enum(["activate", "deactivate", "delete"]),
  })
  .superRefine(({ ids }, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["ids"],
        message: "Selected products must be unique.",
      });
    }
  });

export async function saveProductAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.product.save", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const product = await saveProduct(productSchema.parse(input), user.id);
    await recordAdminAudit(user.id, "product.save", "product", product.id);
    return { id: product.id };
  });
}

export async function checkProductSlugAction(
  input: unknown,
): Promise<ApiResponse<{ available: boolean }>> {
  return executeAction("admin.product.slug-check", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = slugCheckSchema.parse(input);
    return { available: await isAdminProductSlugAvailable(data.slug, data.id) };
  });
}

export async function bulkProductsAction(
  input: unknown,
): Promise<ApiResponse<{ updated: number }>> {
  return executeAction("admin.product.bulk", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = bulkSchema.parse(input);
    if (data.action === "delete") {
      await requireRole(["ADMIN"], { throwOnDenied: true });
    }
    const result = await manageProducts(data.ids, data.action, user.id);
    await recordAdminAudit(user.id, `product.${data.action}`, "product", undefined, {
      count: result.updated,
    });
    return result;
  });
}

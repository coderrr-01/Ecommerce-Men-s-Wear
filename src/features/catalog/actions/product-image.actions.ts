"use server";

import { z } from "zod";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import {
  deleteProductImage,
  setProductImageOrder,
  updateProductImageAlt,
} from "@/features/catalog/services/product-image.service";
import { executeAction } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

const imageIdSchema = z.object({
  productId: z.string().cuid(),
  imageId: z.string().cuid(),
});

const altTextSchema = imageIdSchema.extend({
  altText: z.string().trim().min(1).max(200),
});

const orderSchema = z.object({
  productId: z.string().cuid(),
  imageIds: z.array(z.string().cuid()).min(1).max(8),
  primaryImageId: z.string().cuid(),
});

export async function updateProductImageAltAction(
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.product-images.alt", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = altTextSchema.parse(input);
    const result = await updateProductImageAlt(data.imageId, data.productId, data.altText);
    await recordAdminAudit(user.id, "product.image.alt.update", "product-image", data.imageId);
    return result;
  });
}

export async function reorderProductImagesAction(
  input: unknown,
): Promise<ApiResponse<{ primaryId: string }>> {
  return executeAction("admin.product-images.reorder", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = orderSchema.parse(input);
    const result = await setProductImageOrder(data.productId, data.imageIds, data.primaryImageId);
    await recordAdminAudit(user.id, "product.image.reorder", "product", data.productId);
    return result;
  });
}

export async function deleteProductImageAction(
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.product-images.delete", async () => {
    const user = await requireRole(["ADMIN"], { throwOnDenied: true });
    const data = imageIdSchema.parse(input);
    const result = await deleteProductImage(data.imageId, data.productId);
    await recordAdminAudit(user.id, "product.image.delete", "product-image", data.imageId);
    return result;
  });
}

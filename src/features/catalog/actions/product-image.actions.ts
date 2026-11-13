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

export async function updateProductImageAltAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.product-images.alt", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = altTextSchema.parse(input);
    return updateProductImageAlt(data.imageId, data.productId, data.altText);
  });
}

export async function reorderProductImagesAction(
  input: unknown,
): Promise<ApiResponse<{ primaryId: string }>> {
  return executeAction("admin.product-images.reorder", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = orderSchema.parse(input);
    return setProductImageOrder(data.productId, data.imageIds, data.primaryImageId);
  });
}

export async function deleteProductImageAction(
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.product-images.delete", async () => {
    await requireRole(["ADMIN"], { throwOnDenied: true });
    const data = imageIdSchema.parse(input);
    return deleteProductImage(data.imageId, data.productId);
  });
}

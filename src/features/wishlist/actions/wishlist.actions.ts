"use server";

import { z } from "zod";
import { requireUser } from "@/features/auth/services/session.service";
import {
  clearSavedProducts,
  mergeGuestWishlist,
  toggleSavedProduct,
} from "@/features/wishlist/services/wishlist.service";
import { executeAction } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";
import type { ProductCardData } from "@/features/catalog/types";

const idListSchema = z.array(z.string().cuid()).max(100);
const productSchema = z.string().cuid();

export async function mergeWishlistAction(ids: unknown): Promise<ApiResponse<ProductCardData[]>> {
  return executeAction("wishlist.merge", async () => {
    const user = await requireUser();
    return mergeGuestWishlist(user.id, idListSchema.parse(ids));
  });
}

export async function toggleWishlistAction(
  productId: unknown,
): Promise<ApiResponse<{ saved: boolean }>> {
  return executeAction("wishlist.toggle", async () => {
    const user = await requireUser();
    return { saved: await toggleSavedProduct(user.id, productSchema.parse(productId)) };
  });
}

export async function clearWishlistAction(): Promise<ApiResponse<{ cleared: boolean }>> {
  return executeAction("wishlist.clear", async () => {
    const user = await requireUser();
    return clearSavedProducts(user.id);
  });
}

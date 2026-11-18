import "server-only";

import {
  clearWishlist,
  listWishlist,
  mergeWishlist,
  toggleWishlist,
} from "@/features/wishlist/repositories/wishlist.repository";
import { ValidationError } from "@/lib/errors";
import { toProductCard } from "@/features/catalog/services/catalog.service";

export async function getWishlist(userId: string) {
  const rows = await listWishlist(userId);
  return rows.map(({ product }) => toProductCard(product));
}

export async function mergeGuestWishlist(userId: string, ids: string[]) {
  const uniqueIds = [...new Set(ids.filter((id) => /^[a-z0-9]{20,30}$/i.test(id)))].slice(0, 100);
  await mergeWishlist(userId, uniqueIds);
  return getWishlist(userId);
}

export async function toggleSavedProduct(userId: string, productId: string) {
  if (!/^[a-z0-9]{20,30}$/i.test(productId)) throw new ValidationError("Choose a valid product.");
  return toggleWishlist(userId, productId);
}

export async function clearSavedProducts(userId: string) {
  await clearWishlist(userId);
  return { cleared: true };
}

import "server-only";

import {
  addOrIncrementCartItem,
  deleteCartItem,
  findCartByUserId,
  findCartItemCount,
  setCartItemQuantity,
} from "@/features/cart/repositories/cart.repository";
import type { CartData, CartLine } from "@/features/cart/types";
import { calculateCartTotals } from "@/features/cart/utils";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";

type CartRow = NonNullable<Awaited<ReturnType<typeof findCartByUserId>>>;

export function mapCart(row: CartRow | null): CartData {
  const items: CartLine[] = (row?.items ?? []).map((item) => {
    const image = item.variant.product.images[0];

    return {
      id: item.id,
      variantId: item.variant.id,
      name: item.variant.product.name,
      slug: item.variant.product.slug,
      sku: item.variant.sku,
      size: item.variant.size,
      color: item.variant.color,
      imageUrl: image?.url ?? PRODUCT_PLACEHOLDER_IMAGE,
      imageAlt: image?.altText ?? item.variant.product.name,
      unitPrice: item.variant.price,
      quantity: item.quantity,
      lineTotal: item.variant.price * item.quantity,
      stock: item.variant.stock,
    };
  });

  return calculateCartTotals(items);
}

export async function getCart(userId: string): Promise<CartData> {
  const row = await findCartByUserId(userId);
  return mapCart(row);
}

export async function getCartItemCount(userId: string) {
  return findCartItemCount(userId);
}

export async function addItemToCart(
  userId: string,
  input: { variantId: string; quantity: number },
) {
  return addOrIncrementCartItem(userId, input.variantId, input.quantity);
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  await setCartItemQuantity(userId, itemId, quantity);
}

export async function removeCartItem(userId: string, itemId: string) {
  await deleteCartItem(userId, itemId);
}

import "server-only";

import { InsufficientStockError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import type { CartOwner } from "@/features/cart/types";

function cartOwnerWhere(owner: CartOwner) {
  return "userId" in owner ? { userId: owner.userId } : { sessionId: owner.sessionId };
}

export async function findCartByOwner(owner: CartOwner) {
  return prisma.cart.findUnique({
    where: cartOwnerWhere(owner),
    select: {
      id: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,
          variant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              price: true,
              stock: true,
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: {
                    where: { deletedAt: null },
                    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                    take: 1,
                    select: { url: true, altText: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function findCartItemCount(owner: CartOwner) {
  const result = await prisma.cartItem.aggregate({
    where: { cart: cartOwnerWhere(owner) },
    _sum: { quantity: true },
  });

  return result._sum.quantity ?? 0;
}

export async function addOrIncrementCartItem(
  owner: CartOwner,
  variantId: string,
  quantity: number,
) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findFirst({
      where: {
        id: variantId,
        isActive: true,
        deletedAt: null,
        product: { isActive: true, deletedAt: null },
      },
      select: { stock: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant");
    }

    if (variant.stock < 1) {
      throw new InsufficientStockError("This item is sold out.");
    }

    const cart =
      "userId" in owner
        ? await tx.cart.upsert({
            where: { userId: owner.userId },
            create: { userId: owner.userId },
            update: {},
            select: { id: true },
          })
        : await tx.cart.upsert({
            where: { sessionId: owner.sessionId },
            create: { sessionId: owner.sessionId },
            update: {},
            select: { id: true },
          });

    const existing = await tx.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      select: { id: true, quantity: true },
    });

    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (nextQuantity > variant.stock) {
      throw new InsufficientStockError(
        `Only ${variant.stock} unit${variant.stock === 1 ? "" : "s"} available.`,
      );
    }

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await tx.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    const count = await tx.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });

    return count._sum.quantity ?? 0;
  });
}

export async function setCartItemQuantity(owner: CartOwner, itemId: string, quantity: number) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: { id: itemId, cart: cartOwnerWhere(owner) },
      select: {
        id: true,
        variant: { select: { stock: true } },
      },
    });

    if (!item) {
      throw new NotFoundError("Cart item");
    }

    if (quantity < 1) {
      await tx.cartItem.delete({ where: { id: item.id } });
      return 0;
    }

    if (quantity > item.variant.stock) {
      throw new InsufficientStockError(
        `Only ${item.variant.stock} unit${item.variant.stock === 1 ? "" : "s"} available.`,
      );
    }

    await tx.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return quantity;
  });
}

export async function deleteCartItem(owner: CartOwner, itemId: string) {
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: cartOwnerWhere(owner) },
  });

  if (result.count === 0) {
    throw new NotFoundError("Cart item");
  }
}

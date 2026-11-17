import "server-only";

import { Prisma } from "@prisma/client";

import type { CartOwner } from "@/features/cart/types";
import type { CheckoutAddress } from "@/features/orders/types";
import type { OrderPricingCartItem, PricedOrder } from "@/features/orders/types";
import { ConflictError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const checkoutCartSelect = {
  id: true,
  items: {
    orderBy: { createdAt: "asc" },
    select: {
      quantity: true,
      variant: {
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          price: true,
          stock: true,
          isActive: true,
          deletedAt: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              deletedAt: true,
              images: {
                where: { deletedAt: null },
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartSelect;

export interface NewOrderData {
  orderNumber: string;
  whatsappToken: string;
  idempotencyKey: string;
  checkoutSessionHash: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  customerNote: string | null;
}

function ownerWhere(owner: CartOwner) {
  return "userId" in owner ? { userId: owner.userId } : { sessionId: owner.sessionId };
}

export async function createOrderTransaction(
  owner: CartOwner,
  input: NewOrderData,
  priceCart: (items: OrderPricingCartItem[]) => PricedOrder,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const cart = await tx.cart.findUnique({
          where: ownerWhere(owner),
          select: checkoutCartSelect,
        });
        if (!cart?.items.length) throw new ValidationError("Your bag is empty.");

        const totals = priceCart(cart.items);
        const shippingAddress = {
          fullName: input.shippingAddress.fullName,
          phone: input.shippingAddress.phone,
          line1: input.shippingAddress.line1,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          postalCode: input.shippingAddress.postalCode,
          country: input.shippingAddress.country,
        } satisfies Prisma.InputJsonObject;
        const order = await tx.order.create({
          data: {
            ...input,
            paymentMethod: "WHATSAPP",
            shippingAddress,
            subtotal: totals.subtotal,
            shippingTotal: totals.shippingTotal,
            grandTotal: totals.grandTotal,
            items: { create: totals.items },
            statusHistory: {
              create: {
                toStatus: "PENDING",
                changedById: input.userId,
              },
            },
          },
          include: { items: true },
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return order;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      throw new ConflictError("Your bag changed during checkout. Refresh and try again.");
    }
    throw error;
  }
}

export async function findOrderByIdempotencyKey(idempotencyKey: string) {
  return prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true },
  });
}

export async function findPublicOrder(orderNumber: string, whatsappToken: string) {
  return prisma.order.findFirst({
    where: { orderNumber, whatsappToken },
    select: {
      orderNumber: true,
      whatsappToken: true,
      customerName: true,
      customerPhone: true,
      shippingAddress: true,
      customerNote: true,
      subtotal: true,
      discountTotal: true,
      shippingTotal: true,
      taxTotal: true,
      grandTotal: true,
      status: true,
      placedAt: true,
      stockCommittedAt: true,
      trackingNumber: true,
      courierName: true,
      trackingUrl: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: { fromStatus: true, toStatus: true, note: true, createdAt: true },
      },
      items: {
        orderBy: { id: "asc" },
        select: {
          name: true,
          productSlug: true,
          size: true,
          color: true,
          quantity: true,
          price: true,
          total: true,
        },
      },
    },
  });
}

export async function findCheckoutAddress(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, deletedAt: null, isActive: true },
    select: {
      name: true,
      phone: true,
      addresses: {
        where: { type: "SHIPPING", deletedAt: null },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        take: 1,
        select: {
          fullName: true,
          phone: true,
          line1: true,
          city: true,
          state: true,
          postalCode: true,
        },
      },
    },
  });
}

import "server-only";

import { Prisma } from "@prisma/client";

import type { CartOwner } from "@/features/cart/types";
import type { CheckoutAddress } from "@/features/orders/types";
import type { OrderPricingCartItem, PricedOrder } from "@/features/orders/types";
import { ConflictError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import {
  calculateCouponDiscount,
  getCouponFailure,
  normalizeCouponCode,
} from "@/features/coupons/coupon.utils";
import { logger } from "@/lib/logger";

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
  couponCode: string | null;
  couponCustomerKey: string | null;
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
        let couponId: string | null = null;
        let discountTotal = 0;
        if (input.couponCode) {
          const coupon = await tx.coupon.findFirst({
            where: {
              code: { equals: normalizeCouponCode(input.couponCode), mode: "insensitive" },
              deletedAt: null,
            },
            select: {
              id: true,
              type: true,
              value: true,
              minOrderValue: true,
              maxDiscount: true,
              usageLimit: true,
              usedCount: true,
              perUserLimit: true,
              startsAt: true,
              expiresAt: true,
              isActive: true,
            },
          });
          if (!coupon) {
            logger.warn("coupon.validation_rejected", { reason: "not_found" });
            throw new ValidationError("This coupon code cannot be applied to this order.");
          }
          if (!input.couponCustomerKey) {
            logger.warn("coupon.validation_rejected", { reason: "missing_customer_key" });
            throw new ValidationError("Enter your mobile number before applying this coupon.");
          }
          const customerUses = await tx.couponRedemption.count({
            where: { couponId: coupon.id, customerKey: input.couponCustomerKey },
          });
          const failure = getCouponFailure(coupon, totals.subtotal, new Date(), customerUses);
          if (failure) {
            logger.warn("coupon.validation_rejected", { reason: failure.reason });
            throw new ValidationError(failure.message);
          }
          discountTotal = calculateCouponDiscount(coupon, totals.subtotal);
          const incremented = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              usedCount:
                coupon.usageLimit === null
                  ? { equals: coupon.usedCount }
                  : { equals: coupon.usedCount, lt: coupon.usageLimit },
            },
            data: { usedCount: { increment: 1 } },
          });
          if (!incremented.count) {
            logger.warn("coupon.validation_rejected", { reason: "usage_limit_race" });
            throw new ValidationError("Usage limit reached.");
          }
          couponId = coupon.id;
        }
        const shippingAddress = {
          fullName: input.shippingAddress.fullName,
          phone: input.shippingAddress.phone,
          line1: input.shippingAddress.line1,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          postalCode: input.shippingAddress.postalCode,
          country: input.shippingAddress.country,
        } satisfies Prisma.InputJsonObject;
        const {
          couponCode: _couponCode,
          couponCustomerKey: _couponCustomerKey,
          ...orderInput
        } = input;
        const order = await tx.order.create({
          data: {
            ...orderInput,
            paymentMethod: "WHATSAPP",
            shippingAddress,
            couponId,
            discountTotal,
            subtotal: totals.subtotal,
            shippingTotal: totals.shippingTotal,
            grandTotal: totals.grandTotal - discountTotal,
            ...(couponId && input.couponCustomerKey
              ? { couponRedemption: { create: { couponId, customerKey: input.couponCustomerKey } } }
              : {}),
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

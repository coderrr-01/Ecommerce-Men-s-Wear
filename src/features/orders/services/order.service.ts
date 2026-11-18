import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { siteConfig } from "@/config/site.config";
import type { CartData, CartOwner } from "@/features/cart/types";
import { getCart } from "@/features/cart/services/cart.service";
import { calculateCartTotals } from "@/features/cart/utils";
import {
  createOrderTransaction,
  findCheckoutAddress,
  findOrderByIdempotencyKey,
  findPublicOrder,
} from "@/features/orders/repositories/order.repository";
import { enforceOrderRateLimit } from "@/features/orders/rate-limit";
import { checkoutSchema, type CheckoutFormOutput } from "@/features/orders/schemas/order.schema";
import { toOrderMessageData } from "@/features/orders/order.mapper";
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from "@/features/orders/utils";
import type {
  CheckoutDefaults,
  OrderMessageData,
  StoredOrderMessage,
} from "@/features/orders/types";
import { ConflictError, ValidationError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { priceOrderCart } from "@/features/orders/pricing.utils";
import { generateOrderNumber } from "@/lib/utils";
import { isInvoiceAvailable } from "@/features/orders/order-access.utils";
import { couponCustomerKey } from "@/features/coupons/coupon.utils";

const ORDER_NUMBER_ATTEMPTS = 4;

function ownerHash(owner: CartOwner): string {
  const identity = "userId" in owner ? `user:${owner.userId}` : `guest:${owner.sessionId}`;
  return createHash("sha256").update(identity).digest("hex");
}

function matchesOwner(order: { checkoutSessionHash: string | null }, hash: string): boolean {
  return order.checkoutSessionHash === hash;
}

function orderResult(order: StoredOrderMessage) {
  const token = order.whatsappToken;
  if (!token) throw new ConflictError("The order confirmation link is unavailable.");
  const data = toOrderMessageData({ ...order, whatsappToken: token });
  const message = buildWhatsAppOrderMessage(data);
  return {
    orderNumber: order.orderNumber,
    whatsappUrl: buildWhatsAppUrl(message, siteConfig.contact.whatsapp),
    successUrl: `/order/${encodeURIComponent(order.orderNumber)}?token=${encodeURIComponent(token)}`,
  };
}

export async function getCheckoutPageData(
  user: { id: string; name: string | null; phone: string | null } | null,
  owner: CartOwner | null,
): Promise<{ cart: CartData; defaults: CheckoutDefaults }> {
  const cart = owner ? await getCart(owner) : calculateCartTotals([]);
  const saved = user ? await findCheckoutAddress(user.id) : null;
  const address = saved?.addresses[0];
  const mobile = (address?.phone ?? saved?.phone ?? user?.phone ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  return {
    cart,
    defaults: {
      fullName: address?.fullName ?? saved?.name ?? user?.name ?? "",
      phone: /^[6-9]\d{9}$/.test(mobile) ? mobile : "",
      addressLine: address?.line1 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      pincode: address?.postalCode ?? "",
    },
  };
}

function verifyExistingOrder(
  order: Awaited<ReturnType<typeof findOrderByIdempotencyKey>>,
  hash: string,
) {
  if (!order) return null;
  if (!matchesOwner(order, hash)) {
    throw new ConflictError("This checkout session is no longer available.");
  }
  return orderResult(order);
}

export async function createCustomerOrder(
  rawInput: CheckoutFormOutput,
  owner: CartOwner | null,
  userId: string | null,
  ipAddress?: string | null,
) {
  const input = checkoutSchema.parse(rawInput);
  if (input.honeypot) throw new ValidationError("Unable to place this order.");
  if (!owner) throw new ValidationError("Your bag is empty.");
  buildWhatsAppUrl("", siteConfig.contact.whatsapp);

  const sessionHash = ownerHash(owner);
  const existing = verifyExistingOrder(
    await findOrderByIdempotencyKey(input.idempotencyKey),
    sessionHash,
  );
  if (existing) return existing;

  await enforceOrderRateLimit(input.phone, ipAddress);
  const address = {
    fullName: input.fullName,
    phone: input.phone,
    line1: input.addressLine,
    city: input.city,
    state: input.state,
    postalCode: input.pincode,
    country: "IN" as const,
  };
  const orderData = {
    idempotencyKey: input.idempotencyKey,
    checkoutSessionHash: sessionHash,
    userId,
    customerName: input.fullName,
    customerPhone: input.phone,
    shippingAddress: address,
    customerNote: input.note || null,
    couponCode: input.couponCode?.trim().toUpperCase() || null,
    couponCustomerKey: input.couponCode ? couponCustomerKey(userId, input.phone) : null,
  };

  for (let attempt = 0; attempt < ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    try {
      await createOrderTransaction(
        owner,
        {
          ...orderData,
          orderNumber: generateOrderNumber("DS"),
          whatsappToken: randomBytes(32).toString("base64url"),
        },
        (items) => priceOrderCart(items, input.expectedSubtotal),
      );
      const saved = await findOrderByIdempotencyKey(input.idempotencyKey);
      if (!saved) throw new ConflictError("The order was saved but could not be loaded.");
      return orderResult(saved);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const duplicate = verifyExistingOrder(
          await findOrderByIdempotencyKey(input.idempotencyKey),
          sessionHash,
        );
        if (duplicate) return duplicate;
        if (attempt + 1 < ORDER_NUMBER_ATTEMPTS) continue;
        throw new ConflictError("We could not assign a unique order number. Please try again.");
      }
      if (error instanceof ConflictError) {
        const duplicate = verifyExistingOrder(
          await findOrderByIdempotencyKey(input.idempotencyKey),
          sessionHash,
        );
        if (duplicate) return duplicate;
      }
      throw error;
    }
  }
  throw new ConflictError("We could not create the order. Please try again.");
}

export async function getOrderConfirmation(
  orderNumber: string,
  token: string,
): Promise<{
  order: OrderMessageData;
  status: string;
  placedAt: Date;
  discountTotal: number;
  taxTotal: number;
  statusHistory: NonNullable<StoredOrderMessage["statusHistory"]>;
  trackingNumber: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  invoiceAvailable: boolean;
  message: string;
  whatsappUrl: string;
} | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  if (!/^[A-Za-z0-9-]{1,60}$/.test(orderNumber)) return null;
  const stored = await findPublicOrder(orderNumber, token);
  if (!stored) return null;
  const order = toOrderMessageData(stored);
  const message = buildWhatsAppOrderMessage(order);
  return {
    order,
    status: stored.status,
    placedAt: stored.placedAt,
    discountTotal: stored.discountTotal,
    taxTotal: stored.taxTotal,
    statusHistory: stored.statusHistory,
    trackingNumber: stored.trackingNumber,
    courierName: stored.courierName,
    trackingUrl: stored.trackingUrl,
    invoiceAvailable: isInvoiceAvailable(stored.status, stored.stockCommittedAt),
    message,
    whatsappUrl: buildWhatsAppUrl(message, siteConfig.contact.whatsapp),
  };
}

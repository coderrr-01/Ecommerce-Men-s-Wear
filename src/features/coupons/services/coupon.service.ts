import "server-only";

import { siteConfig } from "@/config/site.config";
import { getCart } from "@/features/cart/services/cart.service";
import type { CartOwner } from "@/features/cart/types";
import {
  calculateCouponDiscount,
  couponCustomerKey,
  getCouponFailure,
  normalizeCouponCode,
} from "@/features/coupons/coupon.utils";
import {
  customerCouponUses,
  findCoupon,
  listCoupons,
  saveCoupon,
  archiveCoupon,
} from "@/features/coupons/repositories/coupon.repository";
import { calculateOrderTotals } from "@/features/orders/utils";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function previewCoupon(
  codeInput: string,
  owner: CartOwner,
  customerId: string | null,
  phone: string,
) {
  const code = normalizeCouponCode(codeInput);
  const cart = await getCart(owner);
  const coupon = code ? await findCoupon(code) : null;
  const customerKey = couponCustomerKey(
    customerId,
    phone || (("sessionId" in owner ? owner.sessionId : owner.userId) ?? ""),
  );
  if (!cart.items.length) {
    throw new ValidationError("Your bag is empty.");
  }
  if (!coupon) {
    logger.warn("coupon.validation_rejected", { reason: "not_found" });
    throw new ValidationError("This coupon code cannot be applied to this order.");
  }
  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const uses = await customerCouponUses(coupon.id, customerKey);
  const failure = getCouponFailure(coupon, subtotal, new Date(), uses);
  if (failure) {
    logger.warn("coupon.validation_rejected", { reason: failure.reason });
    throw new ValidationError(failure.message);
  }
  const discount = calculateCouponDiscount(coupon, subtotal);
  const totals = calculateOrderTotals([{ price: subtotal, quantity: 1 }], siteConfig.shipping);
  return { code, discount, subtotal, total: totals.grandTotal - discount };
}

export async function getCoupons() {
  return listCoupons();
}

export async function saveCouponData(input: Parameters<typeof saveCoupon>[0]) {
  const saved = await saveCoupon({ ...input, code: normalizeCouponCode(input.code) });
  if ("count" in saved) {
    if (!saved.count || !input.id) throw new ValidationError("Coupon could not be found.");
    return { id: input.id };
  }
  return saved;
}

export async function archiveCouponData(id: string) {
  const result = await archiveCoupon(id);
  if (!result.count) throw new ValidationError("Coupon could not be found.");
  return { id };
}

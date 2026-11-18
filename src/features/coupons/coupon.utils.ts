import { ValidationError } from "@/lib/errors";
import { createHash } from "node:crypto";
import { formatPrice } from "@/lib/utils";

export interface CouponRule {
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  isActive?: boolean;
}

export interface CouponFailure {
  reason:
    | "inactive"
    | "not_started"
    | "expired"
    | "usage_limit"
    | "customer_limit"
    | "minimum_order"
    | "invalid_rule";
  message: string;
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function couponCustomerKey(customerId: string | null, phone: string): string {
  return createHash("sha256")
    .update(customerId ?? phone.replace(/\D/g, ""))
    .digest("hex");
}

export function calculateCouponDiscount(
  rule: Pick<CouponRule, "type" | "value" | "maxDiscount" | "minOrderValue">,
  subtotal: number,
): number {
  if (!Number.isSafeInteger(subtotal) || subtotal < rule.minOrderValue) {
    throw new ValidationError(minimumOrderMessage(rule.minOrderValue));
  }
  if (!Number.isSafeInteger(rule.value) || rule.value < 1) {
    throw new ValidationError("Coupon details are invalid. Please contact the shop.");
  }
  if (rule.type === "PERCENTAGE" && rule.value > 100) {
    throw new ValidationError("Coupon details are invalid. Please contact the shop.");
  }
  const raw =
    rule.type === "PERCENTAGE"
      ? Math.floor(subtotal / 100) * rule.value + Math.floor(((subtotal % 100) * rule.value) / 100)
      : rule.value;
  return Math.min(subtotal, rule.maxDiscount === null ? raw : Math.min(raw, rule.maxDiscount));
}

function minimumOrderMessage(minOrderValue: number): string {
  const minimum = formatPrice(minOrderValue, { showDecimals: minOrderValue % 100 !== 0 }).replace(
    /[^\d,.-]/g,
    "",
  );
  return `Minimum order is Rs ${minimum}.`;
}

export function getCouponFailure(
  rule: CouponRule,
  subtotal: number,
  now: Date,
  customerUses: number,
): CouponFailure | null {
  if (rule.isActive === false) return { reason: "inactive", message: "This coupon is not active." };
  if (rule.startsAt && rule.startsAt > now) {
    return { reason: "not_started", message: "This coupon is not active yet." };
  }
  if (rule.expiresAt && rule.expiresAt <= now) {
    return { reason: "expired", message: "This coupon has expired." };
  }
  if (rule.usageLimit !== null && rule.usedCount >= rule.usageLimit) {
    return { reason: "usage_limit", message: "Usage limit reached." };
  }
  if (rule.perUserLimit !== null && customerUses >= rule.perUserLimit) {
    return {
      reason: "customer_limit",
      message: "You have reached this coupon's per-customer limit.",
    };
  }
  if (
    !Number.isSafeInteger(rule.minOrderValue) ||
    rule.minOrderValue < 0 ||
    subtotal < rule.minOrderValue
  ) {
    return { reason: "minimum_order", message: minimumOrderMessage(rule.minOrderValue) };
  }
  if (
    !Number.isSafeInteger(rule.value) ||
    rule.value < 1 ||
    (rule.type === "PERCENTAGE" && rule.value > 100) ||
    (rule.maxDiscount !== null && (!Number.isSafeInteger(rule.maxDiscount) || rule.maxDiscount < 1))
  ) {
    return {
      reason: "invalid_rule",
      message: "This coupon cannot be applied. Please contact the shop.",
    };
  }
  return null;
}

export function validateCouponEligibility(
  rule: CouponRule,
  subtotal: number,
  now: Date,
  customerUses: number,
): number {
  const failure = getCouponFailure(rule, subtotal, now, customerUses);
  if (failure) throw new ValidationError(failure.message);
  return calculateCouponDiscount(rule, subtotal);
}

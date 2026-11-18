import { describe, expect, it } from "vitest";

import {
  calculateCouponDiscount,
  getCouponFailure,
  normalizeCouponCode,
  validateCouponEligibility,
} from "@/features/coupons/coupon.utils";
import { isWithinReturnWindow, validateReturnReason } from "@/features/returns/return.utils";
import {
  isReviewEligible,
  sanitizeReviewText,
  validateReviewRating,
} from "@/features/reviews/review.utils";

describe("coupon rules", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const validRule = {
    type: "PERCENTAGE" as const,
    value: 10,
    minOrderValue: 0,
    maxDiscount: null,
    startsAt: new Date("2026-11-17T00:00:00Z"),
    expiresAt: new Date("2027-11-18T00:00:00Z"),
    usageLimit: null,
    usedCount: 0,
    perUserLimit: null,
    isActive: true,
  };

  it("normalizes user input and applies a valid percentage coupon", () => {
    expect(normalizeCouponCode("  save10 ")).toBe("SAVE10");
    expect(validateCouponEligibility(validRule, 40_000, now, 0)).toBe(4_000);
  });

  it("caps percentage and flat discounts at the configured maximum and subtotal", () => {
    expect(
      calculateCouponDiscount(
        {
          type: "PERCENTAGE",
          value: 20,
          minOrderValue: 0,
          maxDiscount: 5000,
        },
        40_000,
      ),
    ).toBe(5_000);
    expect(
      calculateCouponDiscount(
        {
          type: "FIXED",
          value: 50_000,
          minOrderValue: 0,
          maxDiscount: null,
        },
        40_000,
      ),
    ).toBe(40_000);
  });

  it("returns actionable reasons for dates, minimums, and usage limits", () => {
    expect(
      getCouponFailure(
        {
          ...validRule,
          isActive: false,
        },
        40_000,
        now,
        0,
      )?.message,
    ).toBe("This coupon is not active.");
    expect(
      getCouponFailure(
        {
          ...validRule,
          expiresAt: new Date("2026-11-18T11:59:59Z"),
        },
        40_000,
        now,
        0,
      )?.message,
    ).toBe("This coupon has expired.");
    expect(
      getCouponFailure(
        {
          ...validRule,
          startsAt: new Date("2026-11-18T12:00:01Z"),
        },
        40_000,
        now,
        0,
      )?.message,
    ).toBe("This coupon is not active yet.");
    expect(
      getCouponFailure(
        {
          ...validRule,
          minOrderValue: 50_000,
        },
        40_000,
        now,
        0,
      )?.message,
    ).toBe("Minimum order is Rs 500.");
    expect(
      getCouponFailure(
        {
          ...validRule,
          usageLimit: 2,
          usedCount: 2,
        },
        40_000,
        now,
        0,
      )?.message,
    ).toBe("Usage limit reached.");
    expect(
      getCouponFailure(
        {
          ...validRule,
          perUserLimit: 1,
        },
        40_000,
        now,
        1,
      )?.message,
    ).toBe("You have reached this coupon's per-customer limit.");
  });
});

describe("return eligibility", () => {
  it("counts the configured window from the delivered timestamp", () => {
    const deliveredAt = new Date("2026-11-01T10:00:00Z");
    expect(isWithinReturnWindow(deliveredAt, new Date("2026-11-15T10:00:00Z"), 14)).toBe(true);
    expect(isWithinReturnWindow(deliveredAt, new Date("2026-11-15T10:00:01Z"), 14)).toBe(false);
    expect(isWithinReturnWindow(null, new Date(), 14)).toBe(false);
    expect(validateReturnReason("  Size did not fit well.  ")).toBe("Size did not fit well.");
  });
});

describe("review eligibility and sanitization", () => {
  const deliveredOrder = {
    userId: "customer-1",
    status: "DELIVERED",
    deliveredAt: new Date("2026-11-15T10:00:00Z"),
    items: [{ productId: "product-1" }],
  };

  it("requires an owned delivered order and rejects pending, cancelled, guest, and duplicate cases", () => {
    expect(isReviewEligible("customer-1", "product-1", [deliveredOrder])).toBe(true);
    expect(
      isReviewEligible("customer-1", "product-1", [{ ...deliveredOrder, status: "PENDING" }]),
    ).toBe(false);
    expect(
      isReviewEligible("customer-1", "product-1", [{ ...deliveredOrder, status: "CANCELLED" }]),
    ).toBe(false);
    expect(isReviewEligible("customer-1", "product-1", [{ ...deliveredOrder, userId: null }])).toBe(
      false,
    );
    expect(isReviewEligible("customer-1", "product-1", [deliveredOrder], true)).toBe(false);
    expect(isReviewEligible("customer-1", "product-2", [deliveredOrder])).toBe(false);
  });

  it("removes markup and validates review text and rating", () => {
    expect(sanitizeReviewText("<b>Good fit</b> & comfortable", 120)).toBe("Good fit & comfortable");
    expect(validateReviewRating(5)).toBe(5);
    expect(() => validateReviewRating(6)).toThrow("Choose a rating from 1 to 5.");
  });
});

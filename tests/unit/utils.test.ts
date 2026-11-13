import { describe, expect, it } from "vitest";

import {
  calculateDiscountPercent,
  formatPrice,
  formatPriceRange,
  isSafeRedirectPath,
  slugify,
} from "@/lib/utils";

describe("formatPrice", () => {
  it("formats paise as whole rupees by default", () => {
    expect(formatPrice(249900)).toBe("₹2,499");
  });

  it("supports decimal display at the presentation boundary", () => {
    expect(formatPrice(249950, { showDecimals: true })).toBe("₹2,499.50");
  });

  it("rejects non-finite amounts", () => {
    expect(() => formatPrice(Number.NaN)).toThrow(TypeError);
  });
});

describe("formatPriceRange", () => {
  it("collapses identical bounds", () => {
    expect(formatPriceRange(100000, 100000)).toBe("₹1,000");
  });
});

describe("calculateDiscountPercent", () => {
  it("returns a rounded discount percentage", () => {
    expect(calculateDiscountPercent(249900, 299900)).toBe(17);
  });

  it("returns zero when there is no genuine discount", () => {
    expect(calculateDiscountPercent(249900, 249900)).toBe(0);
    expect(calculateDiscountPercent(249900, null)).toBe(0);
  });
});

describe("isSafeRedirectPath", () => {
  it("accepts local paths", () => {
    expect(isSafeRedirectPath("/account/orders")).toBe(true);
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(isSafeRedirectPath("https://example.com")).toBe(false);
    expect(isSafeRedirectPath("//example.com")).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});

describe("slugify", () => {
  it("normalises punctuation and spacing", () => {
    expect(slugify("Men's Oxford — White")).toBe("mens-oxford-white");
  });
});

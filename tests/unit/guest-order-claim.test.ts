import { describe, expect, it } from "vitest";

import { canClaimGuestOrder, normalizeIndianPhone } from "@/features/orders/claim.utils";
import { registerSchema } from "@/features/auth/schemas/auth.schema";

describe("guest order claiming", () => {
  it("normalizes Indian numbers with an optional country code", () => {
    expect(normalizeIndianPhone("+91 98765-43210")).toBe("9876543210");
    expect(normalizeIndianPhone("0123456789")).toBeNull();
    expect(normalizeIndianPhone(null)).toBeNull();
  });

  it("requires the account mobile to match the guest order mobile", () => {
    expect(canClaimGuestOrder("9876543210", "+91 98765 43210")).toBe(true);
    expect(canClaimGuestOrder("9876543210", "9876543211")).toBe(false);
    expect(canClaimGuestOrder(null, "9876543210")).toBe(false);
  });

  it("accepts an optional valid Indian phone on registration for later claims", () => {
    const base = {
      name: "Test Customer",
      email: "customer@example.test",
      password: "StrongPass#2468",
      confirmPassword: "StrongPass#2468",
    };
    expect(registerSchema.safeParse({ ...base, phone: "9876543210" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, phone: "" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });
});

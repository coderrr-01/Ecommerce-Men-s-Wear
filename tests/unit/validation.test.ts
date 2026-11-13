import { describe, expect, it } from "vitest";

import { addToCartSchema } from "@/features/cart/schemas/cart.schema";
import { loginSchema, registerSchema } from "@/features/auth/schemas/auth.schema";

describe("loginSchema", () => {
  it("normalises the email address", () => {
    const result = loginSchema.parse({
      email: "  CUSTOMER@Example.COM ",
      password: "secret",
    });

    expect(result.email).toBe("customer@example.com");
  });

  it("rejects invalid email addresses", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(
      false,
    );
  });
});

describe("registerSchema", () => {
  it("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      name: "Arjun Mehta",
      email: "arjun@example.com",
      password: "Passw0rd",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("requires a letter and a number in the password", () => {
    const result = registerSchema.safeParse({
      name: "Arjun Mehta",
      email: "arjun@example.com",
      password: "onlyletters",
      confirmPassword: "onlyletters",
    });

    expect(result.success).toBe(false);
  });
});

describe("addToCartSchema", () => {
  it("coerces a form quantity", () => {
    const result = addToCartSchema.parse({
      variantId: "variant_123",
      quantity: "2",
    });

    expect(result.quantity).toBe(2);
  });

  it("rejects quantities above ten", () => {
    expect(addToCartSchema.safeParse({ variantId: "variant_123", quantity: "11" }).success).toBe(
      false,
    );
  });
});

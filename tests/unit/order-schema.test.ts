import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/features/orders/schemas/order.schema";

const validInput = {
  fullName: "  Asha Patel  ",
  phone: "9876543210",
  addressLine: "12 Main Road",
  city: "Ahmedabad",
  state: "Gujarat",
  pincode: "380001",
  note: "Call after 5",
  idempotencyKey: "8a3200d2-51f8-49e3-8652-51f8d3e61a1d",
  expectedSubtotal: 125000,
  honeypot: "",
};

describe("checkout schema", () => {
  it("trims and sanitizes customer text while preserving multilingual characters", () => {
    const result = checkoutSchema.parse({
      ...validInput,
      fullName: " Asha\u202e Patel ",
      note: "નમસ્તે\u200b shop",
    });

    expect(result.fullName).toBe("Asha Patel");
    expect(result.note).toBe("નમસ્તે shop");
  });

  it("rejects invalid Indian mobile numbers and pincodes", () => {
    expect(checkoutSchema.safeParse({ ...validInput, phone: "1234567890" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validInput, phone: "987654321" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validInput, pincode: "38001" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validInput, pincode: "38A001" }).success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    expect(checkoutSchema.safeParse({ ...validInput, honeypot: "bot" }).success).toBe(false);
  });
});

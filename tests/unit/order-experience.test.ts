import { describe, expect, it } from "vitest";

import {
  customerOrderWhere,
  invoiceAccessWhere,
  isInvoiceAvailable,
} from "@/features/orders/order-access.utils";
import { amountInWords, formatInvoiceNumber, invoiceYear } from "@/features/orders/invoice.utils";
import { allocateInvoiceNumber } from "@/features/orders/invoice-number.utils";
import { isAllowedOrderTransition } from "@/features/orders/status.utils";

describe("invoice numbers and Indian amount words", () => {
  it("formats sequential invoice numbers without changing sequence values", () => {
    expect(formatInvoiceNumber("INV", 2026, 1)).toBe("INV-2026-0001");
    expect(formatInvoiceNumber("INV", 2026, 10000)).toBe("INV-2026-10000");
    expect(invoiceYear(new Date("2026-12-31T20:00:00.000Z"), "Asia/Kolkata")).toBe(2027);
  });

  it("converts paise to Indian-numbering amount words", () => {
    expect(amountInWords(0)).toBe("Zero Rupees Only");
    expect(amountInWords(100005)).toBe("One Thousand Rupees and Five Paise Only");
    expect(amountInWords(12345678)).toBe(
      "One Lakh Twenty Three Thousand Four Hundred Fifty Six Rupees and Seventy Eight Paise Only",
    );
    expect(() => amountInWords(-1)).toThrow(RangeError);
  });

  it("allocates invoice numbers transactionally and reuses an existing assignment", async () => {
    let counter = 1;
    const assigned = new Map<string, string>();
    const transaction = async <T>(run: (tx: null) => Promise<T>) => run(null);
    const store = {
      allocate: async () => counter++,
      assign: async (_tx: null, orderId: string, value: string) => {
        if (assigned.has(orderId)) return false;
        assigned.set(orderId, value);
        return true;
      },
    };
    const order = {
      id: "order-1",
      placedAt: new Date("2026-06-01T00:00:00Z"),
      invoiceNumber: null,
    };

    await expect(
      allocateInvoiceNumber(transaction, store, order, "INV", "Asia/Kolkata"),
    ).resolves.toBe("INV-2026-0001");
    await expect(
      allocateInvoiceNumber(
        transaction,
        store,
        { ...order, invoiceNumber: assigned.get(order.id)! },
        "INV",
        "Asia/Kolkata",
      ),
    ).resolves.toBe("INV-2026-0001");
    expect(counter).toBe(2);
  });
});

describe("order visibility and invoice eligibility", () => {
  it("scopes customer order reads to the authenticated owner", () => {
    expect(customerOrderWhere("DS-20261117-ABC", "customer-a")).toEqual({
      orderNumber: "DS-20261117-ABC",
      userId: "customer-a",
    });
    expect(customerOrderWhere("DS-20261117-ABC", "customer-b").userId).not.toBe("customer-a");
  });

  it("allows only an owner, a bearer token, or staff to query invoice records", () => {
    expect(invoiceAccessWhere("DS-1", { userId: "owner", token: null, isStaff: false })).toEqual({
      orderNumber: "DS-1",
      OR: [{ userId: "owner" }],
    });
    expect(
      invoiceAccessWhere("DS-1", { userId: null, token: "secret-token", isStaff: false }),
    ).toEqual({
      orderNumber: "DS-1",
      OR: [{ whatsappToken: "secret-token" }],
    });
    expect(invoiceAccessWhere("DS-1", { userId: null, token: null, isStaff: false })).toEqual({
      orderNumber: "DS-1",
      id: "__no_access__",
    });
    expect(invoiceAccessWhere("DS-1", { userId: "staff", token: null, isStaff: true })).toEqual({
      orderNumber: "DS-1",
    });
  });

  it("keeps invoices unavailable for pending and pending-cancelled orders", () => {
    expect(isInvoiceAvailable("PENDING", null)).toBe(false);
    expect(isInvoiceAvailable("CANCELLED", null)).toBe(false);
    expect(isInvoiceAvailable("CANCELLED", new Date())).toBe(true);
    expect(isInvoiceAvailable("DELIVERED", null)).toBe(true);
    expect(isInvoiceAvailable("RETURNED", null)).toBe(true);
  });
});

describe("order experience transition rules", () => {
  it("rejects skipped fulfilment statuses and cancellation after shipment", () => {
    expect(isAllowedOrderTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(isAllowedOrderTransition("PENDING", "SHIPPED")).toBe(false);
    expect(isAllowedOrderTransition("SHIPPED", "CANCELLED")).toBe(false);
  });
});

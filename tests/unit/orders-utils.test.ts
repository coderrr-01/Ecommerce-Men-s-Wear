import { describe, expect, it } from "vitest";

import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  calculateOrderTotals,
} from "@/features/orders/utils";
import type { OrderMessageData } from "@/features/orders/types";
import { priceOrderCart } from "@/features/orders/pricing.utils";
import { siteConfig } from "@/config/site.config";
import { generateOrderNumber } from "@/lib/utils";

const site = {
  name: "Diamond & Selection",
  url: "https://shop.example",
  contact: { whatsapp: "+91 98765 43210", countryCallingCode: "91" },
};

function order(overrides: Partial<OrderMessageData> = {}): OrderMessageData {
  return {
    orderNumber: "DS-20261117-ABC12345",
    whatsappToken: "a".repeat(43),
    customerName: "Asha & Ravi #1 + मोहन",
    customerPhone: "9876543210",
    shippingAddress: {
      fullName: "Asha & Ravi",
      phone: "9876543210",
      line1: "12, Main Road #2",
      city: "અમદાવાદ",
      state: "Gujarat",
      postalCode: "380001",
      country: "IN",
    },
    customerNote: "Please call after 5 + leave with સુરક્ષા.",
    items: [
      {
        name: "Classic Oxford & Co.",
        productSlug: "classic-oxford",
        size: "M",
        color: "Navy #1",
        quantity: 2,
        price: 125000,
        total: 250000,
      },
    ],
    subtotal: 250000,
    shippingTotal: 0,
    grandTotal: 250000,
    ...overrides,
  };
}

describe("order utilities", () => {
  it("calculates totals from integer database prices and configured shipping", () => {
    expect(
      calculateOrderTotals(
        [
          { price: 125000, quantity: 2 },
          { price: 87550, quantity: 1 },
        ],
        { standardFee: 9900, freeShippingThreshold: 400000 },
      ),
    ).toEqual({ subtotal: 337550, shippingTotal: 9900, grandTotal: 347450 });
  });

  it("waives delivery at the configured free-shipping threshold", () => {
    expect(
      calculateOrderTotals([{ price: 150000, quantity: 1 }], {
        standardFee: 9900,
        freeShippingThreshold: 150000,
      }).shippingTotal,
    ).toBe(0);
  });

  it("prices order lines from the fresh database variant price", () => {
    const priced = priceOrderCart(
      [
        {
          quantity: 2,
          variant: {
            id: "variant-1",
            sku: "DS-001-M-NAV",
            size: "M",
            color: "Navy",
            price: 125000,
            stock: 5,
            isActive: true,
            deletedAt: null,
            product: {
              id: "product-1",
              name: "Oxford Shirt",
              slug: "oxford-shirt",
              isActive: true,
              deletedAt: null,
              images: [{ url: "https://images.example/shirt.jpg" }],
            },
          },
        },
      ],
      250000,
    );

    expect(priced.items[0]).toMatchObject({ price: 125000, quantity: 2, total: 250000 });
    expect(priced.subtotal).toBe(250000);
    expect(priced.shippingTotal).toBe(
      250000 >= siteConfig.shipping.freeShippingThreshold ? 0 : siteConfig.shipping.standardFee,
    );
    expect(() =>
      priceOrderCart(
        [
          {
            quantity: 2,
            variant: {
              id: "variant-1",
              sku: "DS-001-M-NAV",
              size: "M",
              color: "Navy",
              price: 130000,
              stock: 5,
              isActive: true,
              deletedAt: null,
              product: {
                id: "product-1",
                name: "Oxford Shirt",
                slug: "oxford-shirt",
                isActive: true,
                deletedAt: null,
                images: [],
              },
            },
          },
        ],
        250000,
      ),
    ).toThrow("Prices changed");
  });

  it("generates distinct DS order numbers with a stable human-readable date", () => {
    const date = new Date("2026-11-17T10:00:00.000Z");
    expect(generateOrderNumber("DS", date, "12345678-0000-0000-0000-000000000000")).toBe(
      "DS-20261117-12345678",
    );
    expect(generateOrderNumber("DS", date, "87654321-0000-0000-0000-000000000000")).not.toBe(
      generateOrderNumber("DS", date, "12345678-0000-0000-0000-000000000000"),
    );
  });

  it("preserves special characters and multilingual text in the encoded WhatsApp message", () => {
    const message = buildWhatsAppOrderMessage(order(), site);
    const url = new URL(buildWhatsAppUrl(message, site.contact.whatsapp));

    expect(url.pathname).toBe("/919876543210");
    expect(url.searchParams.get("text")).toBe(message);
    expect(message).toContain("Asha & Ravi #1 + मोहन");
    expect(message).toContain("અમદાવાદ");
    expect(message).toContain("https://shop.example/products/classic-oxford");
  });

  it("includes the server-calculated coupon discount in the WhatsApp message", () => {
    const message = buildWhatsAppOrderMessage(order({ discountTotal: 12500 }), site);
    expect(message).toContain("Discount: -");
  });

  it("rejects an unconfigured all-zero shop WhatsApp number", () => {
    expect(() => buildWhatsAppUrl("order", "+91 00000 00000")).toThrow(
      "The shop WhatsApp number is not configured",
    );
  });

  it("shortens oversized item lists and links to the full token-protected order", () => {
    const longOrder = order({
      customerNote: "delivery ".repeat(120),
      discountTotal: 2500,
      items: Array.from({ length: 60 }, (_, index) => ({
        name: `Product ${index} & a detailed garment description`,
        productSlug: `product-${index}`,
        size: "XXL",
        color: "Deep navy",
        quantity: 1,
        price: 10000,
        total: 10000,
      })),
    });
    const message = buildWhatsAppOrderMessage(longOrder, site);

    expect(message.length).toBeLessThanOrEqual(1500);
    expect(message).toContain("See full order: https://shop.example/order/");
    expect(message).toContain("Discount: -");
    expect(message).not.toContain("https://shop.example/products/product-");
  });
});

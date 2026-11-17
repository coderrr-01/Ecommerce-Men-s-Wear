import { siteConfig } from "@/config/site.config";
import { formatPrice, truncate } from "@/lib/utils";
import { ValidationError } from "@/lib/errors";
import type { OrderMessageData } from "@/features/orders/types";

export interface OrderTotals {
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
}

export function sanitizeOrderText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateOrderTotals(
  items: { price: number; quantity: number }[],
  shipping: { standardFee: number; freeShippingThreshold: number },
): OrderTotals {
  if (
    items.some(
      (item) =>
        !Number.isSafeInteger(item.price) ||
        item.price < 0 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1,
    )
  ) {
    throw new ValidationError("Order items contain an invalid price or quantity.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal)) {
    throw new ValidationError("The order total is too large to process.");
  }
  const shippingTotal =
    subtotal === 0 || subtotal >= shipping.freeShippingThreshold ? 0 : shipping.standardFee;
  return { subtotal, shippingTotal, grandTotal: subtotal + shippingTotal };
}

export interface WhatsAppSiteConfig {
  name: string;
  url: string;
  contact: { whatsapp: string; countryCallingCode: string };
}

function productUrl(slug: string, siteUrl: string): string {
  return new URL(`/products/${encodeURIComponent(slug)}`, siteUrl).toString();
}

function orderUrl(order: OrderMessageData, siteUrl: string): string {
  const path = `/order/${encodeURIComponent(order.orderNumber)}?token=${encodeURIComponent(order.whatsappToken)}`;
  return new URL(path, siteUrl).toString();
}

function renderOrderMessage(
  order: OrderMessageData,
  site: WhatsAppSiteConfig,
  itemLines: string[],
  fallback: boolean,
  omitted = 0,
): string {
  const address = [
    order.shippingAddress.line1,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.postalCode,
  ].join(", ");
  const lines = [
    `${site.name} order request ${order.orderNumber}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${fallback ? truncate(address, 100) : address}`,
    "Items:",
    ...itemLines,
    ...(omitted ? [`… and ${omitted} more item(s).`] : []),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${order.shippingTotal === 0 ? "Free" : formatPrice(order.shippingTotal)}`,
    `Total: ${formatPrice(order.grandTotal)}`,
    order.customerNote
      ? `Note: ${fallback ? truncate(order.customerNote, 100) : order.customerNote}`
      : "",
    fallback ? `See full order: ${orderUrl(order, site.url)}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export function buildWhatsAppOrderMessage(
  order: OrderMessageData,
  site: WhatsAppSiteConfig = siteConfig,
): string {
  const fullLines = order.items.map(
    (item) =>
      `• ${item.name} (${item.size}, ${item.color}) ×${item.quantity} — ${formatPrice(item.total)} ${productUrl(item.productSlug, site.url)}`,
  );
  const fullMessage = renderOrderMessage(order, site, fullLines, false);
  if (fullMessage.length <= 1500) return fullMessage;

  const shortLines = order.items.map(
    (item) =>
      `• ${truncate(item.name, 28)} ${truncate(item.size, 10)}/${truncate(item.color, 12)} x${item.quantity} ${formatPrice(item.total)}`,
  );
  let visible = [...shortLines];
  let message = renderOrderMessage(order, site, visible, true);
  while (message.length > 1500 && visible.length > 0) {
    visible = visible.slice(0, -1);
    message = renderOrderMessage(order, site, visible, true, shortLines.length - visible.length);
  }
  if (message.length <= 1500) return message;

  const minimal = renderOrderMessage(
    {
      ...order,
      customerName: truncate(order.customerName, 40),
      customerPhone: truncate(order.customerPhone, 15),
    },
    site,
    [],
    true,
    order.items.length,
  );
  if (minimal.length <= 1500) return minimal;

  const linkLine = `See full order: ${orderUrl(order, site.url)}`;
  if (linkLine.length >= 1400) {
    throw new ValidationError("The configured site URL is too long for a WhatsApp order link.");
  }
  const essentials = [
    `${site.name} order request ${order.orderNumber}`,
    `Name: ${truncate(order.customerName, 24)}`,
    `Phone: ${truncate(order.customerPhone, 15)}`,
    `Address: ${truncate(order.shippingAddress.city, 24)}, ${truncate(order.shippingAddress.postalCode, 6)}`,
    "Items:",
    `… ${order.items.length} item(s).`,
    `Total: ${formatPrice(order.grandTotal)}`,
    linkLine,
  ];
  return essentials.join("\n").length <= 1500
    ? essentials.join("\n")
    : truncate(essentials.slice(0, -1).join("\n"), 1500 - linkLine.length - 1) + `\n${linkLine}`;
}

export function buildWhatsAppUrl(message: string, configuredNumber: string): string {
  const digits = configuredNumber.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || /^(?:91)?0{10}$/.test(digits)) {
    throw new ValidationError("The shop WhatsApp number is not configured.");
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildCustomerChatUrl(
  phone: string,
  orderNumber: string,
  site: WhatsAppSiteConfig = siteConfig,
): string {
  const customerDigits = phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(customerDigits)) return "";
  const text = `Hello ${site.name}, your order ${orderNumber} is confirmed. We will share updates here.`;
  return `https://wa.me/${site.contact.countryCallingCode}${customerDigits}?text=${encodeURIComponent(text)}`;
}

export function buildOrderStatusChatUrl(
  phone: string,
  orderNumber: string,
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED",
  tracking: {
    courierName: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
  },
  site: WhatsAppSiteConfig = siteConfig,
): string {
  const customerDigits = phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(customerDigits)) return "";

  const statusText = {
    CONFIRMED: `Your order ${orderNumber} is confirmed.`,
    SHIPPED: [
      `Your order ${orderNumber} has shipped.`,
      tracking.courierName ? `Courier: ${tracking.courierName}.` : "",
      tracking.trackingNumber ? `Tracking number: ${tracking.trackingNumber}.` : "",
      tracking.trackingUrl ? `Track it here: ${tracking.trackingUrl}` : "",
    ]
      .filter(Boolean)
      .join(" "),
    DELIVERED: `Your order ${orderNumber} has been delivered. Thank you for shopping with us.`,
  }[status];
  const message = `${site.name}: ${statusText}`;
  const countryCode = site.contact.countryCallingCode.replace(/\D/g, "");
  if (!countryCode) return "";
  return `https://wa.me/${countryCode}${customerDigits}?text=${encodeURIComponent(message)}`;
}

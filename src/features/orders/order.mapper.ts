import type {
  CheckoutAddress,
  OrderMessageData,
  StoredOrderMessage,
} from "@/features/orders/types";

export function readShippingAddress(value: unknown): CheckoutAddress {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const text = (key: string) => (typeof record[key] === "string" ? record[key] : "");
  return {
    fullName: text("fullName"),
    phone: text("phone"),
    line1: text("line1"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postalCode"),
    country: "IN",
  };
}

export function toOrderMessageData(order: StoredOrderMessage): OrderMessageData {
  const shippingAddress = readShippingAddress(order.shippingAddress);
  return {
    orderNumber: order.orderNumber,
    whatsappToken: order.whatsappToken ?? "",
    customerName: order.customerName ?? shippingAddress.fullName,
    customerPhone: order.customerPhone ?? shippingAddress.phone,
    shippingAddress,
    customerNote: order.customerNote,
    items: order.items.map((item) => ({
      name: item.name,
      productSlug: item.productSlug ?? "shop",
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
    subtotal: order.subtotal,
    shippingTotal: order.shippingTotal,
    grandTotal: order.grandTotal,
  };
}

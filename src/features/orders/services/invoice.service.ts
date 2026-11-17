import "server-only";

import { siteConfig } from "@/config/site.config";
import { isInvoiceAvailable, type InvoiceAccess } from "@/features/orders/order-access.utils";
import {
  ensureInvoiceNumber,
  findInvoiceOrder,
} from "@/features/orders/repositories/invoice.repository";
import { readShippingAddress } from "@/features/orders/order.mapper";
import type { InvoiceData } from "@/features/orders/types";
import { NotFoundError } from "@/lib/errors";

export async function getInvoiceData(
  orderNumber: string,
  access: InvoiceAccess,
): Promise<InvoiceData> {
  const order = await findInvoiceOrder(orderNumber, access);
  if (!order || !isInvoiceAvailable(order.status, order.stockCommittedAt)) {
    throw new NotFoundError("Invoice");
  }
  const invoiceNumber =
    order.invoiceNumber ??
    (await ensureInvoiceNumber(order.id, siteConfig.invoice.prefix, siteConfig.timezone));
  const address = readShippingAddress(order.shippingAddress);
  return {
    invoiceNumber,
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    customerName: order.customerName ?? address.fullName,
    customerPhone: order.customerPhone ?? address.phone,
    shippingAddress: address,
    items: order.items,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    taxTotal: order.taxTotal,
    grandTotal: order.grandTotal,
    paymentMethod: order.paymentMethod,
  };
}

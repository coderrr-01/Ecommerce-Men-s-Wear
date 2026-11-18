import "server-only";

import {
  findCustomerOrder,
  findCustomerOrders as findOrders,
} from "@/features/orders/repositories/customer-order.repository";
import { readShippingAddress } from "@/features/orders/order.mapper";
import {
  customerOrdersQuerySchema,
  orderNumberSchema,
} from "@/features/orders/schemas/order.schema";
import { isInvoiceAvailable } from "@/features/orders/order-access.utils";
import { NotFoundError } from "@/lib/errors";
import { siteConfig } from "@/config/site.config";
import { isWithinReturnWindow } from "@/features/returns/return.utils";

export async function getCustomerOrders(userId: string, pageInput: unknown) {
  const { page: requestedPage } = customerOrdersQuerySchema.parse({ page: pageInput });
  let result = await findOrders(userId, requestedPage);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const page = Math.min(requestedPage, totalPages);
  if (page !== requestedPage) result = await findOrders(userId, page);
  return { ...result, page, totalPages };
}

export async function getCustomerOrder(orderNumber: string, userId: string) {
  const safeOrderNumber = orderNumberSchema.parse(orderNumber);
  const order = await findCustomerOrder(safeOrderNumber, userId);
  if (!order) throw new NotFoundError("Order");

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.placedAt,
    deliveredAt: order.deliveredAt,
    returnEligible:
      ["DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED"].includes(order.status) &&
      isWithinReturnWindow(order.deliveredAt, new Date(), siteConfig.shipping.returnsWindowDays),
    returnRequests: order.returnRequests,
    customerName: order.customerName ?? "",
    customerPhone: order.customerPhone ?? "",
    shippingAddress: readShippingAddress(order.shippingAddress),
    customerNote: order.customerNote,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      imageUrl: item.imageUrl,
    })),
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    taxTotal: order.taxTotal,
    grandTotal: order.grandTotal,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    trackingUrl: order.trackingUrl,
    statusHistory: order.statusHistory,
    invoiceAvailable: isInvoiceAvailable(order.status, order.stockCommittedAt),
  };
}

import "server-only";

import {
  findAdminOrder,
  findAdminOrders,
  saveAdminOrderDetails,
  transitionAdminOrder,
} from "@/features/orders/repositories/admin-order.repository";
import { findAdminOrdersForExport } from "@/features/orders/repositories/admin-order-export.repository";
import {
  adminOrderDetailsSchema,
  adminOrderExportSchema,
  adminOrderIdSchema,
  adminOrdersQuerySchema,
  orderStatusUpdateSchema,
  type AdminOrdersQuery,
} from "@/features/orders/schemas/order.schema";
import { toOrdersCsv } from "@/features/orders/csv.utils";
import { isInvoiceAvailable } from "@/features/orders/order-access.utils";
import { isAllowedOrderTransition } from "@/features/orders/status.utils";
import type { AdminOrderStatus } from "@/features/orders/types";
import { readShippingAddress } from "@/features/orders/order.mapper";
import { ConflictError, NotFoundError } from "@/lib/errors";

const ADMIN_STATUSES: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function getAdminOrders(input: AdminOrdersQuery) {
  const query = adminOrdersQuerySchema.parse(input);
  let result = await findAdminOrders(query);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const page = Math.min(query.page, totalPages);
  if (page !== query.page) result = await findAdminOrders({ ...query, page });
  return {
    rows: result.rows,
    total: result.total,
    page,
    pageSize: result.pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
  };
}

export async function getAdminOrder(orderId: string) {
  const parsedId = adminOrderIdSchema.safeParse(orderId);
  if (!parsedId.success) throw new NotFoundError("Order");
  const order = await findAdminOrder(parsedId.data);
  if (!order) throw new NotFoundError("Order");
  return {
    ...order,
    shippingAddress: readShippingAddress(order.shippingAddress),
    invoiceAvailable: isInvoiceAvailable(order.status, order.stockCommittedAt),
  };
}

export async function exportAdminOrders(input: unknown) {
  const query = adminOrderExportSchema.parse(input);
  return toOrdersCsv(await findAdminOrdersForExport(query));
}

export async function updateAdminOrderDetails(input: unknown, actorId: string) {
  const data = adminOrderDetailsSchema.parse(input);
  return saveAdminOrderDetails(data.orderId, actorId, {
    ...(data.internalNote ? { internalNote: data.internalNote } : {}),
    trackingNumber: data.trackingNumber,
    courierName: data.courierName,
    trackingUrl: data.trackingUrl,
  });
}

export async function updateAdminOrderStatus(input: unknown, actorId: string) {
  const data = orderStatusUpdateSchema.parse(input);
  const order = await findAdminOrder(data.orderId);
  if (!order) throw new NotFoundError("Order");
  if (!ADMIN_STATUSES.includes(order.status as AdminOrderStatus)) {
    throw new ConflictError("This order status cannot be changed in the current workflow.");
  }
  const currentStatus = order.status as AdminOrderStatus;
  if (!isAllowedOrderTransition(currentStatus, data.status)) {
    throw new ConflictError(`An order cannot move from ${currentStatus} to ${data.status}.`);
  }
  return transitionAdminOrder(data.orderId, currentStatus, data.status, actorId, data.note || null);
}

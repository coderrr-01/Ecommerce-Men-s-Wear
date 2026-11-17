import "server-only";

import { customerOrderWhere } from "@/features/orders/order-access.utils";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 20;

export async function findCustomerOrders(userId: string, page: number) {
  const where = { userId };
  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        placedAt: true,
        _count: { select: { items: true } },
      },
    }),
  ]);
  return { rows, total, pageSize: PAGE_SIZE };
}

export async function findCustomerOrder(orderNumber: string, userId: string) {
  return prisma.order.findFirst({
    where: customerOrderWhere(orderNumber, userId),
    select: {
      orderNumber: true,
      status: true,
      placedAt: true,
      customerName: true,
      customerPhone: true,
      shippingAddress: true,
      customerNote: true,
      subtotal: true,
      discountTotal: true,
      shippingTotal: true,
      taxTotal: true,
      grandTotal: true,
      stockCommittedAt: true,
      trackingNumber: true,
      courierName: true,
      trackingUrl: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: { fromStatus: true, toStatus: true, note: true, createdAt: true },
      },
      items: { orderBy: { id: "asc" } },
    },
  });
}

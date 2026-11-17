import "server-only";

import { applyOrderStockChange } from "@/features/orders/stock.utils";
import type { AdminOrdersQuery } from "@/features/orders/schemas/order.schema";
import type { AdminOrderStatus } from "@/features/orders/types";
import { buildAdminOrderWhere } from "@/features/orders/admin-order-query.utils";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 25;

export async function findAdminOrders(query: AdminOrdersQuery) {
  const where = buildAdminOrderWhere(query);
  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        status: true,
        grandTotal: true,
        createdAt: true,
      },
    }),
  ]);
  return { rows, total, pageSize: PAGE_SIZE };
}

export async function findAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { id: "asc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      internalNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });
}

export async function transitionAdminOrder(
  orderId: string,
  expectedStatus: AdminOrderStatus,
  nextStatus: AdminOrderStatus,
  actorId: string,
  note: string | null = null,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        stockCommittedAt: true,
        items: { select: { variantId: true, quantity: true } },
      },
    });
    if (!order) throw new NotFoundError("Order");
    if (order.status !== expectedStatus) {
      throw new ConflictError("This order was updated by someone else. Refresh and try again.");
    }

    const update = await tx.order.updateMany({
      where: { id: orderId, status: expectedStatus },
      data: {
        status: nextStatus,
        ...(nextStatus === "CONFIRMED" ? { stockCommittedAt: new Date() } : {}),
        ...(nextStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        ...(nextStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      },
    });
    if (update.count !== 1) {
      throw new ConflictError("This order was updated by someone else. Refresh and try again.");
    }
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: expectedStatus,
        toStatus: nextStatus,
        changedById: actorId,
        note,
      },
    });

    const stockItems = order.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    if (nextStatus === "CONFIRMED") {
      await applyOrderStockChange(
        {
          decrement: async (variantId, quantity) =>
            (
              await tx.productVariant.updateMany({
                where: { id: variantId, stock: { gte: quantity } },
                data: { stock: { decrement: quantity } },
              })
            ).count === 1,
          increment: async () => false,
          movement: async (variantId, delta, userId, reason) => {
            await tx.stockMovement.create({ data: { variantId, delta, userId, reason } });
          },
        },
        stockItems,
        actorId,
        "decrement",
        `Order ${order.orderNumber} confirmed`,
      );
    } else if (nextStatus === "CANCELLED" && order.stockCommittedAt) {
      await applyOrderStockChange(
        {
          decrement: async () => false,
          increment: async (variantId, quantity) =>
            (
              await tx.productVariant.updateMany({
                where: { id: variantId },
                data: { stock: { increment: quantity } },
              })
            ).count === 1,
          movement: async (variantId, delta, userId, reason) => {
            await tx.stockMovement.create({ data: { variantId, delta, userId, reason } });
          },
        },
        stockItems,
        actorId,
        "restore",
        `Order ${order.orderNumber} cancelled`,
      );
    }
    return { status: nextStatus };
  });
}

export async function saveAdminOrderDetails(
  orderId: string,
  actorId: string,
  details: {
    internalNote?: string;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!order) throw new NotFoundError("Order");

    await tx.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: details.trackingNumber || null,
        courierName: details.courierName || null,
        trackingUrl: details.trackingUrl || null,
      },
    });
    if (details.internalNote) {
      await tx.orderInternalNote.create({
        data: { orderId, authorId: actorId, note: details.internalNote },
      });
    }
    return { saved: true };
  });
}

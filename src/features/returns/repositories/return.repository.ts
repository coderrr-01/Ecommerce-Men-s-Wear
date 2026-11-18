import "server-only";

import { Prisma, type OrderStatus } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function createReturnRequest(
  userId: string,
  orderItemId: string,
  reason: string,
  photos: { url: string; publicId: string }[],
  now: Date,
  windowDays: number,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const item = await tx.orderItem.findFirst({
          where: { id: orderItemId, order: { userId } },
          select: {
            id: true,
            orderId: true,
            order: { select: { status: true, deliveredAt: true } },
          },
        });
        if (!item) throw new NotFoundError("Order item");
        const allowed = [
          "DELIVERED",
          "RETURN_REQUESTED",
          "RETURN_APPROVED",
          "RETURNED",
          "EXCHANGED",
        ].includes(item.order.status);
        if (!allowed || !item.order.deliveredAt)
          throw new ConflictError("This order is not eligible for a return.");
        const age = now.getTime() - item.order.deliveredAt.getTime();
        if (age < 0 || age > windowDays * 86400000) {
          throw new ConflictError("The return request window has ended.");
        }

        const request = await tx.returnRequest.create({
          data: {
            orderId: item.orderId,
            orderItemId,
            userId,
            reason,
            activeKey: orderItemId,
            photos: { create: photos },
          },
          select: { id: true, orderId: true },
        });
        if (item.order.status !== "RETURN_REQUESTED") {
          await tx.order.update({
            where: { id: item.orderId },
            data: { status: "RETURN_REQUESTED" },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: item.orderId,
              fromStatus: item.order.status,
              toStatus: "RETURN_REQUESTED",
              changedById: userId,
              note: "Customer requested a return or exchange.",
            },
          });
        }
        return request;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("A return or exchange request is already active for this item.");
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new ConflictError(
        "This order changed while you submitted the request. Refresh and retry.",
      );
    }
    throw error;
  }
}

export async function listAdminReturnRequests() {
  return prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      reason: true,
      createdAt: true,
      adminNote: true,
      order: { select: { orderNumber: true, customerName: true, customerPhone: true } },
      orderItem: {
        select: { name: true, sku: true, size: true, color: true, quantity: true, variantId: true },
      },
      photos: { select: { url: true } },
    },
  });
}

export async function transitionReturnRequest(
  id: string,
  action: "APPROVE" | "REJECT" | "RECEIVE" | "RETURN" | "EXCHANGE",
  actorId: string,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const request = await tx.returnRequest.findUnique({
          where: { id },
          select: {
            id: true,
            orderId: true,
            orderItemId: true,
            status: true,
            order: { select: { status: true, orderNumber: true } },
            orderItem: { select: { variantId: true, quantity: true } },
          },
        });
        if (!request) throw new NotFoundError("Return request");

        if (action === "APPROVE" || action === "REJECT") {
          if (request.status !== "REQUESTED")
            throw new ConflictError("This request is no longer awaiting review.");
          const next = action === "APPROVE" ? "APPROVED" : "REJECTED";
          await tx.returnRequest.update({
            where: { id },
            data: {
              status: next,
              reviewedById: actorId,
              ...(next === "REJECTED" ? { activeKey: null } : {}),
            },
          });
          if (action === "APPROVE") {
            await setOrderStatus(
              tx,
              request.orderId,
              request.order.status,
              "RETURN_APPROVED",
              actorId,
            );
          } else {
            const otherActive = await tx.returnRequest.count({
              where: {
                orderId: request.orderId,
                id: { not: id },
                status: { in: ["REQUESTED", "APPROVED", "RECEIVED"] },
              },
            });
            if (!otherActive && request.order.status !== "DELIVERED") {
              await setOrderStatus(tx, request.orderId, request.order.status, "DELIVERED", actorId);
            }
          }
          return { status: next };
        }

        if (action === "RECEIVE") {
          if (request.status !== "APPROVED" || !request.orderItem.variantId) {
            throw new ConflictError("This approved item cannot be received into stock.");
          }
          const requestUpdated = await tx.returnRequest.updateMany({
            where: { id, status: "APPROVED" },
            data: { status: "RECEIVED", receivedAt: new Date() },
          });
          if (!requestUpdated.count) throw new ConflictError("This request was already updated.");
          const restored = await tx.productVariant.updateMany({
            where: { id: request.orderItem.variantId },
            data: { stock: { increment: request.orderItem.quantity } },
          });
          if (!restored.count) throw new ConflictError("The product variant no longer exists.");
          await tx.stockMovement.create({
            data: {
              variantId: request.orderItem.variantId,
              delta: request.orderItem.quantity,
              userId: actorId,
              reason: `Return received for ${request.order.orderNumber}`,
            },
          });
          return { status: "RECEIVED" };
        }

        if (request.status !== "RECEIVED")
          throw new ConflictError("Receive the item before closing this request.");
        const next = action === "RETURN" ? "RETURNED" : "EXCHANGED";
        await tx.returnRequest.update({
          where: { id },
          data: { status: next, activeKey: null },
        });
        await setOrderStatus(tx, request.orderId, request.order.status, next, actorId);
        return { status: next };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new ConflictError(
        "This return request was updated by someone else. Refresh and retry.",
      );
    }
    throw error;
  }
}

async function setOrderStatus(
  tx: Prisma.TransactionClient,
  orderId: string,
  fromStatus: OrderStatus,
  toStatus: "RETURN_APPROVED" | "RETURNED" | "EXCHANGED" | "DELIVERED",
  actorId: string,
) {
  if (fromStatus === toStatus) return;
  await tx.order.update({ where: { id: orderId }, data: { status: toStatus } });
  await tx.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus,
      toStatus,
      changedById: actorId,
      note: `Return request updated: ${toStatus.replaceAll("_", " ").toLowerCase()}.`,
    },
  });
}

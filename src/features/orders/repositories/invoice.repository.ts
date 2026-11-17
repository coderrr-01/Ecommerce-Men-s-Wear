import "server-only";

import { Prisma } from "@prisma/client";

import {
  invoiceAccessWhere,
  isInvoiceAvailable,
  type InvoiceAccess,
} from "@/features/orders/order-access.utils";
import { allocateInvoiceNumber } from "@/features/orders/invoice-number.utils";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const invoiceSelect = {
  id: true,
  orderNumber: true,
  invoiceNumber: true,
  userId: true,
  whatsappToken: true,
  status: true,
  stockCommittedAt: true,
  placedAt: true,
  customerName: true,
  customerPhone: true,
  shippingAddress: true,
  subtotal: true,
  discountTotal: true,
  shippingTotal: true,
  taxTotal: true,
  grandTotal: true,
  currency: true,
  paymentMethod: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      name: true,
      sku: true,
      size: true,
      color: true,
      price: true,
      quantity: true,
      total: true,
    },
  },
} satisfies Prisma.OrderSelect;

export async function findInvoiceOrder(orderNumber: string, access: InvoiceAccess) {
  return prisma.order.findFirst({
    where: invoiceAccessWhere(orderNumber, access),
    select: invoiceSelect,
  });
}

export async function ensureInvoiceNumber(
  orderId: string,
  prefix: string,
  timeZone: string,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const current = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          invoiceNumber: true,
          placedAt: true,
          status: true,
          stockCommittedAt: true,
        },
      });
      if (!current) throw new NotFoundError("Order");
      if (current.invoiceNumber) return current.invoiceNumber;
      if (!isInvoiceAvailable(current.status, current.stockCommittedAt)) {
        throw new NotFoundError("Invoice");
      }

      return await allocateInvoiceNumber(
        <T>(run: (tx: Prisma.TransactionClient) => Promise<T>) =>
          prisma.$transaction(run, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }),
        {
          allocate: async (tx, year) => {
            const sequence = await tx.invoiceSequence.upsert({
              where: { year },
              create: { year, nextValue: 2 },
              update: { nextValue: { increment: 1 } },
              select: { nextValue: true },
            });
            return sequence.nextValue - 1;
          },
          assign: async (tx, id, invoiceNumber) =>
            (
              await tx.order.updateMany({
                where: { id, invoiceNumber: null },
                data: { invoiceNumber },
              })
            ).count === 1,
        },
        current,
        prefix,
        timeZone,
      );
    } catch (error) {
      const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
      if (code === "P2002" || code === "P2034" || error instanceof ConflictError) continue;
      throw error;
    }
  }
  throw new ConflictError("A unique invoice number could not be assigned. Please retry.");
}

import "server-only";

import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const INVENTORY_PAGE_SIZE = 25;

function inventoryWhere(query: { q: string; state: "all" | "low" | "out" }, threshold: number) {
  const where: Prisma.ProductVariantWhereInput = {
    deletedAt: null,
    product: { deletedAt: null },
  };
  if (query.q) {
    where.OR = [
      { sku: { contains: query.q, mode: "insensitive" } },
      { product: { name: { contains: query.q, mode: "insensitive" }, deletedAt: null } },
    ];
  }
  if (query.state === "out") where.stock = 0;
  if (query.state === "low") where.stock = { gt: 0, lte: threshold };
  return where;
}

const inventorySelect = {
  id: true,
  sku: true,
  size: true,
  color: true,
  stock: true,
  isActive: true,
  product: { select: { id: true, name: true, isActive: true } },
} satisfies Prisma.ProductVariantSelect;

export async function findInventoryPage(
  query: { q: string; state: "all" | "low" | "out"; page: number },
  threshold: number,
) {
  const where = inventoryWhere(query, threshold);
  const [total, rows] = await prisma.$transaction([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
      skip: (query.page - 1) * INVENTORY_PAGE_SIZE,
      take: INVENTORY_PAGE_SIZE,
      select: inventorySelect,
    }),
  ]);
  return { rows, total, pageSize: INVENTORY_PAGE_SIZE };
}

export async function findInventoryForExport(
  query: { q: string; state: "all" | "low" | "out" },
  threshold: number,
) {
  return prisma.productVariant.findMany({
    where: inventoryWhere(query, threshold),
    orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
    select: inventorySelect,
  });
}

export async function saveInventoryStock(
  items: { variantId: string; stock: number }[],
  userId: string,
  reason: string,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      let updated = 0;
      for (const item of items) {
        const variant = await tx.productVariant.findFirst({
          where: { id: item.variantId, deletedAt: null, product: { deletedAt: null } },
          select: { id: true, stock: true },
        });
        if (!variant) throw new NotFoundError("Active product variant");
        const delta = item.stock - variant.stock;
        if (delta === 0) continue;

        const result = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: variant.stock, deletedAt: null },
          data: { stock: item.stock },
        });
        if (result.count !== 1) throw new ConflictError("Stock changed. Refresh and try again.");
        await tx.stockMovement.create({
          data: { variantId: variant.id, userId, delta, reason },
        });
        updated += 1;
      }
      return { updated };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      throw new ConflictError("Stock changed while you were editing. Refresh and try again.");
    }
    throw error;
  }
}

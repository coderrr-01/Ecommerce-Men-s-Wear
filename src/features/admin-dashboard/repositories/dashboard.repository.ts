import "server-only";

import { siteConfig } from "@/config/site.config";
import { prisma } from "@/lib/db";

export async function getDashboardMetrics() {
  const threshold = siteConfig.inventory.lowStockThreshold;
  const variantWhere = {
    deletedAt: null,
    product: { deletedAt: null },
  };
  const [products, activeProducts, draftProducts, variants, lowStock, outOfStock, customers, orders, pendingOrders, lowStockRows] =
    await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.product.count({ where: { isActive: false, deletedAt: null } }),
    prisma.productVariant.count({ where: variantWhere }),
    prisma.productVariant.count({
      where: { ...variantWhere, stock: { gt: 0, lte: threshold } },
    }),
    prisma.productVariant.count({ where: { ...variantWhere, stock: 0 } }),
    prisma.user.count({
      where: { role: "CUSTOMER", deletedAt: null },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.productVariant.findMany({
      where: { ...variantWhere, stock: { gt: 0, lte: threshold } },
      orderBy: [{ stock: "asc" }, { product: { name: "asc" } }, { sku: "asc" }],
      take: 10,
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        stock: true,
        product: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    products,
    activeProducts,
    draftProducts,
    variants,
    lowStock,
    outOfStock,
    customers,
    orders,
    pendingOrders,
    lowStockRows,
    lowStockThreshold: threshold,
  };
}

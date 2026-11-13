import "server-only";

import { prisma } from "@/lib/db";

export async function getDashboardMetrics() {
  const [products, orders, customers, lowStock, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.order.count(),
    prisma.user.count({
      where: { role: "CUSTOMER", isActive: true, deletedAt: null },
    }),
    prisma.productVariant.count({
      where: { isActive: true, deletedAt: null, stock: { lte: 5 } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return { products, orders, customers, lowStock, pendingOrders };
}

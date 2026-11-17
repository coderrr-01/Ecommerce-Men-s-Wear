import "server-only";

import { buildAdminOrderWhere } from "@/features/orders/admin-order-query.utils";
import type { AdminOrderExportQuery } from "@/features/orders/schemas/order.schema";
import { prisma } from "@/lib/db";

export async function findAdminOrdersForExport(query: AdminOrderExportQuery) {
  const rows = await prisma.order.findMany({
    where: buildAdminOrderWhere(query),
    orderBy: { placedAt: "desc" },
    select: {
      orderNumber: true,
      placedAt: true,
      status: true,
      customerName: true,
      customerPhone: true,
      grandTotal: true,
    },
  });
  return rows.map((row) => ({
    ...row,
    customerName: row.customerName ?? "",
    customerPhone: row.customerPhone ?? "",
  }));
}

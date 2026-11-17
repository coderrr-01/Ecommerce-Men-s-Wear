import { describe, expect, it } from "vitest";

import { buildAdminOrderWhere } from "@/features/orders/admin-order-query.utils";
import {
  adminOrderExportSchema,
  adminOrdersQuerySchema,
} from "@/features/orders/schemas/order.schema";

describe("admin order filters", () => {
  it("uses an inclusive local date range and optional status", () => {
    const query = adminOrderExportSchema.parse({
      status: "SHIPPED",
      dateFrom: "2026-11-17",
      dateTo: "2026-11-17",
    });
    const where = buildAdminOrderWhere(query);

    expect(where.status).toBe("SHIPPED");
    expect(where.placedAt).toEqual({
      gte: new Date("2026-11-16T18:30:00.000Z"),
      lt: new Date("2026-11-17T18:30:00.000Z"),
    });
  });

  it("rejects reversed and invalid calendar dates", () => {
    expect(
      adminOrdersQuerySchema.safeParse({ dateFrom: "2026-11-18", dateTo: "2026-11-17" }).success,
    ).toBe(false);
    expect(
      adminOrderExportSchema.safeParse({ dateFrom: "2026-02-30", dateTo: "2026-03-01" }).success,
    ).toBe(false);
  });
});

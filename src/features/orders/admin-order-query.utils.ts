import type { Prisma } from "@prisma/client";

import { siteConfig } from "@/config/site.config";
import type {
  AdminOrderExportQuery,
  AdminOrdersQuery,
} from "@/features/orders/schemas/order.schema";

function startOfConfiguredDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  let instant = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: siteConfig.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(instant))
      .reduce<Record<string, number>>((result, part) => {
        if (part.type !== "literal") result[part.type] = Number(part.value);
        return result;
      }, {});
    const localAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const next = target - (localAsUtc - instant);
    if (next === instant) break;
    instant = next;
  }
  return new Date(instant);
}

function followingDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function buildAdminOrderWhere(
  query: AdminOrdersQuery | AdminOrderExportQuery,
): Prisma.OrderWhereInput {
  const dateRange = {
    ...(query.dateFrom ? { gte: startOfConfiguredDate(query.dateFrom) } : {}),
    ...(query.dateTo ? { lt: startOfConfiguredDate(followingDate(query.dateTo)) } : {}),
  };
  return {
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(Object.keys(dateRange).length ? { placedAt: dateRange } : {}),
    ...("q" in query && query.q
      ? {
          OR: [
            { orderNumber: { contains: query.q, mode: "insensitive" } },
            { customerPhone: { contains: query.q } },
          ],
        }
      : {}),
  };
}

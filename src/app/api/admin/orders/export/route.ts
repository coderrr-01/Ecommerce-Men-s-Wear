import { NextResponse } from "next/server";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { adminOrderExportSchema } from "@/features/orders/schemas/order.schema";
import { exportAdminOrders } from "@/features/orders/services/admin-order.service";
import { normalizeError } from "@/lib/error-handler";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const url = new URL(request.url);
    const filters = adminOrderExportSchema.parse({
      status: url.searchParams.get("status") ?? undefined,
      dateFrom: url.searchParams.get("dateFrom") ?? undefined,
      dateTo: url.searchParams.get("dateTo") ?? undefined,
    });
    const csv = await exportAdminOrders(filters);
    return new NextResponse(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="orders.csv"',
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    const apiError = normalizeError(error);
    logger.warn("admin.orders.export_failed", { code: apiError.code });
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: apiError },
      {
        status: error instanceof AppError ? error.status : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

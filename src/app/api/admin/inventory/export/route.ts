import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { inventoryExportQuerySchema } from "@/features/inventory/schemas/inventory.schema";
import { exportInventory } from "@/features/inventory/services/inventory.service";
import { AppError } from "@/lib/errors";
import { normalizeError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  const apiError = normalizeError(error);
  if (apiError.code === "INTERNAL_ERROR") {
    logger.error("admin.inventory.export_failed", { error });
  } else {
    logger.warn("admin.inventory.export_rejected", {
      code: apiError.code,
      message: apiError.message,
    });
  }
  const status = error instanceof AppError ? error.status : error instanceof ZodError ? 422 : 500;
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: apiError },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const query = inventoryExportQuerySchema.parse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      state: request.nextUrl.searchParams.get("state") ?? undefined,
    });
    const csv = await exportInventory(query);
    return new NextResponse(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="inventory.csv"',
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return failure(error);
  }
}

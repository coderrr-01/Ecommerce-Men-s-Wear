"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/config/constants";
import { requireRole, requireUser } from "@/features/auth/services/session.service";
import { updateReturnRequest, requestReturn } from "@/features/returns/services/return.service";
import { safeAction } from "@/lib/safe-action";
import type { ApiResponse } from "@/types/api";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

export async function requestReturnAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string; orderId: string }>> {
  return safeAction("returns.request", async () => {
    const user = await requireUser("/account/orders");
    const requestHeaders = await headers();
    await enforceRateLimit(
      "return-request",
      `${user.id}:${getClientIp(requestHeaders) ?? "unknown"}`,
      3,
      60 * 60 * 1000,
    );
    const data = z
      .object({
        orderItemId: z.string().cuid(),
        reason: z.string().trim().min(10).max(1000),
      })
      .parse({
        orderItemId: formData.get("orderItemId"),
        reason: formData.get("reason"),
      });
    const files = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const result = await requestReturn(user.id, data.orderItemId, data.reason, files);
    revalidatePath("/account/orders");
    revalidatePath("/account/orders/[orderNumber]", "page");
    revalidatePath("/admin/returns");
    return result;
  });
}

export async function updateReturnRequestAction(
  input: unknown,
): Promise<ApiResponse<{ status: string }>> {
  return safeAction("admin.returns.update", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = z
      .object({
        id: z.string().cuid(),
        action: z.enum(["APPROVE", "REJECT", "RECEIVE", "RETURN", "EXCHANGE"]),
      })
      .parse(input);
    const result = await updateReturnRequest(data.id, data.action, user.id);
    await recordAdminAudit(user.id, "return.request.update", "return-request", data.id, {
      action: data.action,
    });
    revalidatePath("/admin/returns");
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    revalidatePath("/account/orders/[orderNumber]", "page");
    return result;
  });
}

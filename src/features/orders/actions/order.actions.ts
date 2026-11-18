"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { ADMIN_ROLES } from "@/config/constants";
import { getCurrentUser, requireRole } from "@/features/auth/services/session.service";
import { getCartOwner } from "@/features/cart/guest-session";
import { checkoutSchema } from "@/features/orders/schemas/order.schema";
import { createCustomerOrder } from "@/features/orders/services/order.service";
import {
  updateAdminOrderDetails,
  updateAdminOrderStatus,
} from "@/features/orders/services/admin-order.service";
import { normalizeError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";
import { getClientIp } from "@/lib/rate-limiter";
import { recordAdminAudit } from "@/features/security/services/admin-audit.service";

async function safeOrderAction<T>(
  action: string,
  operation: () => Promise<T>,
): Promise<ApiResponse<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized.code === "INTERNAL_ERROR") {
      logger.error("order.action_failed", { action, code: normalized.code });
    } else {
      logger.warn("order.action_rejected", { action, code: normalized.code });
    }
    return { success: false, error: normalized };
  }
}

export async function placeOrderAction(
  input: unknown,
): Promise<ApiResponse<{ orderNumber: string; whatsappUrl: string; successUrl: string }>> {
  return safeOrderAction("orders.place", async () => {
    const data = checkoutSchema.parse(input);
    const user = await getCurrentUser();
    const owner = await getCartOwner(user?.id);
    const requestHeaders = await headers();
    const ipAddress = getClientIp(requestHeaders);
    const result = await createCustomerOrder(data, owner, user?.id ?? null, ipAddress);
    revalidatePath("/cart");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return result;
  });
}

export async function updateOrderStatusAction(
  input: unknown,
): Promise<ApiResponse<{ status: string }>> {
  return safeOrderAction("admin.orders.update-status", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const result = await updateAdminOrderStatus(input, user.id);
    const auditInput = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    await recordAdminAudit(
      user.id,
      "order.status.update",
      "order",
      typeof auditInput.orderId === "string" ? auditInput.orderId : undefined,
      typeof auditInput.status === "string" ? { status: auditInput.status } : undefined,
    );
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/account/orders");
    revalidatePath("/order/[orderNumber]", "page");
    return result;
  });
}

export async function saveAdminOrderDetailsAction(
  input: unknown,
): Promise<ApiResponse<{ saved: boolean }>> {
  return safeOrderAction("admin.orders.save-details", async () => {
    const user = await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const result = await updateAdminOrderDetails(input, user.id);
    const auditInput = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    await recordAdminAudit(
      user.id,
      "order.details.update",
      "order",
      typeof auditInput.orderId === "string" ? auditInput.orderId : undefined,
    );
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/[id]", "page");
    return result;
  });
}

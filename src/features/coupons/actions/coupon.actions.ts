"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/config/constants";
import { getCurrentUser, requireRole } from "@/features/auth/services/session.service";
import { getCartOwner } from "@/features/cart/guest-session";
import { enforceRateLimit } from "@/lib/rate-limiter";
import {
  previewCoupon,
  saveCouponData,
  archiveCouponData,
} from "@/features/coupons/services/coupon.service";
import { executeAction } from "@/lib/error-handler";
import { ValidationError } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";

const couponSchema = z
  .object({
    id: z.string().cuid().optional(),
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Z0-9_-]+$/i)
      .transform((value) => value.toUpperCase()),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().min(1).max(100_000_000),
    minOrderValue: z.number().int().min(0),
    maxDiscount: z.number().int().positive().nullable(),
    usageLimit: z.number().int().positive().nullable(),
    perUserLimit: z.number().int().positive().nullable(),
    startsAt: z.string().datetime().nullable(),
    expiresAt: z.string().datetime().nullable(),
    isActive: z.boolean(),
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    path: ["value"],
    message: "Percentage coupons cannot exceed 100%.",
  })
  .refine((data) => !data.startsAt || !data.expiresAt || data.startsAt <= data.expiresAt, {
    path: ["expiresAt"],
    message: "Expiry must be after the start date.",
  });

export async function checkCouponAction(
  input: unknown,
): Promise<ApiResponse<{ code: string; discount: number; total: number }>> {
  return executeAction("coupon.check", async () => {
    const data = z
      .object({
        code: z.string().trim().min(1).max(40),
        phone: z.string().trim().max(20).optional(),
      })
      .parse(input);
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    enforceRateLimit("coupon-check", ip, 10, 60_000);
    const user = await getCurrentUser();
    const owner = await getCartOwner(user?.id ?? undefined);
    if (!owner) throw new ValidationError("Your bag is empty.");
    const result = await previewCoupon(data.code, owner, user?.id ?? null, data.phone ?? "");
    return { code: result.code, discount: result.discount, total: result.total };
  });
}

export async function saveCouponAction(input: unknown): Promise<ApiResponse<{ saved: boolean }>> {
  return executeAction("admin.coupons.save", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = couponSchema.parse(input);
    await saveCouponData({
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });
    revalidatePath("/admin/coupons");
    return { saved: true };
  });
}

export async function archiveCouponAction(id: unknown): Promise<ApiResponse<{ id: string }>> {
  return executeAction("admin.coupons.archive", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const result = await archiveCouponData(z.string().cuid().parse(id));
    revalidatePath("/admin/coupons");
    return result;
  });
}

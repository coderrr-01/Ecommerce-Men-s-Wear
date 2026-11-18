"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/config/constants";
import { requireRole, requireUser } from "@/features/auth/services/session.service";
import { moderateReview, submitReview } from "@/features/reviews/services/review.service";
import { safeAction } from "@/lib/safe-action";
import type { ApiResponse } from "@/types/api";

export async function submitReviewAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string; status: string }>> {
  return safeAction("reviews.submit", async () => {
    const user = await requireUser("/account");
    const parsed = z
      .object({
        productId: z.string().cuid(),
        rating: z.coerce.number().int().min(1).max(5),
        title: z.string().max(120),
        comment: z.string().max(2000),
      })
      .parse({
        productId: formData.get("productId"),
        rating: formData.get("rating"),
        title: formData.get("title") ?? "",
        comment: formData.get("comment") ?? "",
      });
    const files = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const result = await submitReview(user.id, parsed, files);
    revalidatePath("/products/[slug]", "page");
    return result;
  });
}

export async function moderateReviewAction(
  input: unknown,
): Promise<ApiResponse<{ id: string; status: string }>> {
  return safeAction("admin.reviews.moderate", async () => {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const data = z
      .object({ id: z.string().cuid(), status: z.enum(["APPROVED", "REJECTED"]) })
      .parse(input);
    const result = await moderateReview(data.id, data.status);
    revalidatePath("/admin/reviews");
    revalidatePath("/products/[slug]", "page");
    return result;
  });
}

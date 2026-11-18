"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/services/session.service";
import { changeOwnPassword } from "@/features/auth/services/password-change.service";
import { passwordSchema } from "@/features/auth/schemas/auth.schema";
import { logger } from "@/lib/logger";

export async function changeOwnPasswordAction(formData: FormData) {
  const user = await requireUser("/account/security");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!password.success || formData.get("confirmPassword") !== password.data) {
    return { success: false, error: "Enter a valid password and matching confirmation." };
  }
  let changed: boolean;
  try {
    changed = await changeOwnPassword(user.id, currentPassword, password.data);
  } catch {
    logger.error("auth.password_change_failed", { reason: "storage_or_unexpected_error" });
    return { success: false, error: "Password could not be updated. Please try again." };
  }
  if (!changed) return { success: false, error: "Current password is incorrect." };
  redirect("/login?passwordChanged=1");
}

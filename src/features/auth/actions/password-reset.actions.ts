"use server";

import { headers } from "next/headers";

import { emailSchema, passwordSchema } from "@/features/auth/schemas/auth.schema";
import {
  requestPasswordReset,
  resetPassword,
} from "@/features/auth/services/password-reset.service";
import { initialAuthState, type AuthActionState } from "@/features/auth/types";
import { getClientIp, enforceRateLimit } from "@/lib/rate-limiter";
import { isPasswordResetTokenFormatValid } from "@/features/auth/password-reset.utils";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function requestPasswordResetAction(
  _previous: AuthActionState = initialAuthState,
  formData: FormData,
): Promise<AuthActionState> {
  if (String(formData.get("website") ?? "").trim()) return { status: "success" };
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Enter a valid email address." };

  try {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders) ?? "unknown";
    await enforceRateLimit("password-reset", `${email.data}:${ip}`, 3, 60 * 60 * 1000, {
      failureMode: "closed",
    });
    const outcome = await requestPasswordReset(email.data);
    if (outcome === "unavailable") {
      return {
        status: "error",
        message: "Password reset email is not configured. Please contact support.",
      };
    }
    return {
      status: "success",
      successMessage:
        "If an account exists and email delivery is available, a reset link will be sent shortly.",
    };
  } catch (error) {
    if (error instanceof AppError && error.code === "RATE_LIMITED") {
      return { status: "error", message: error.message };
    }
    logger.error("auth.password_reset_request_failed", { reason: "storage_or_provider_error" });
    return {
      status: "error",
      message: "Password reset is temporarily unavailable. Please try again later.",
    };
  }
}

export async function resetPasswordAction(
  _previous: AuthActionState = initialAuthState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = String(formData.get("token") ?? "");
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!isPasswordResetTokenFormatValid(token) || !password.success) {
    return {
      status: "error",
      message: password.success
        ? "This reset link is invalid or expired."
        : (password.error.issues[0]?.message ?? "Choose a valid password."),
    };
  }
  if (formData.get("confirmPassword") !== password.data) {
    return { status: "error", message: "Passwords do not match." };
  }
  try {
    const requestHeaders = await headers();
    await enforceRateLimit(
      "password-reset-complete",
      getClientIp(requestHeaders) ?? "unknown",
      10,
      60 * 60 * 1000,
      { failureMode: "closed" },
    );
    const changed = await resetPassword(token, password.data);
    return changed
      ? { status: "success", successMessage: "Password updated. Sign in with your new password." }
      : { status: "error", message: "This reset link is invalid or expired." };
  } catch (error) {
    if (error instanceof AppError && error.code === "RATE_LIMITED") {
      return { status: "error", message: error.message };
    }
    logger.error("auth.password_reset_consume_failed", { reason: "storage_or_unexpected_error" });
    return {
      status: "error",
      message: "Password reset is temporarily unavailable. Please try again later.",
    };
  }
}

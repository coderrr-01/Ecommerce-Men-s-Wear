"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { loginSchema, registerSchema } from "@/features/auth/schemas/auth.schema";
import { registerCustomer } from "@/features/auth/services/auth.service";
import { initialAuthState, type AuthActionState } from "@/features/auth/types";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { fieldErrors } from "@/lib/validation";
import { isSafeRedirectPath } from "@/lib/utils";
import { getClientIp, enforceRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

function authErrorMessage(error: AuthError): string {
  void error;
  return "Email or password is incorrect.";
}

export async function loginAction(
  _previousState: AuthActionState = initialAuthState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const redirectTo = isSafeRedirectPath(formData.get("redirectTo"))
    ? String(formData.get("redirectTo"))
    : "/account";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: authErrorMessage(error) };
    }
    throw error;
  }

  return { status: "idle" };
}

export async function registerAction(
  _previousState: AuthActionState = initialAuthState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const requestHeaders = await headers();
    await enforceRateLimit(
      "register-ip",
      getClientIp(requestHeaders) ?? "unknown",
      5,
      60 * 60 * 1000,
    );
    await registerCustomer(parsed.data);
  } catch (error) {
    if (error instanceof AppError && error.code === "RATE_LIMITED") {
      return { status: "error", message: error.message };
    }
    logger.error("auth.register_failed", { reason: "storage_or_unexpected_error" });
    return { status: "error", message: "We could not create your account. Please try again." };
  }

  return {
    status: "success",
    successMessage: "If an account can be created with these details, you can now try signing in.",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

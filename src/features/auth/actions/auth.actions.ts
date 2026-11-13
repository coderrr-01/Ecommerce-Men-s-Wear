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

function authErrorMessage(error: AuthError): string {
  if (error.type === "CredentialsSignin") {
    return "Email or password is incorrect.";
  }
  return "We could not sign you in right now. Please try again.";
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
    await registerCustomer(parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return { status: "error", message: error.message };
    }
    logger.error("auth.register_failed", { error });
    return {
      status: "error",
      message: "We could not create your account. Please try again.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: authErrorMessage(error) };
    }
    throw error;
  }

  return { status: "idle" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

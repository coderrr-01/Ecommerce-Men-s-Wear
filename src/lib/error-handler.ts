import "server-only";
import { ZodError } from "zod";
import { AppError, ProviderError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiError, ApiResponse } from "@/types/api";

/** Converts any thrown value into a safe, serialisable API error. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: "Please check the submitted fields.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  if (error instanceof ProviderError) {
    return {
      code: "PROVIDER_ERROR",
      message: "A third-party service is temporarily unavailable. Please try again.",
    };
  }

  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
  };
}

/**
 * Wraps a server action body so every response uses the same shape and every
 * unexpected failure is logged with context.
 */
export async function executeAction<T>(
  actionName: string,
  fn: () => Promise<T>,
): Promise<ApiResponse<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    const apiError = normalizeError(error);

    if (apiError.code === "INTERNAL_ERROR") {
      logger.error("action.unhandled_error", { action: actionName, error });
    } else {
      logger.warn("action.failed", {
        action: actionName,
        code: apiError.code,
        message: apiError.message,
      });
    }

    return { success: false, error: apiError };
  }
}

import "server-only";

import { logger } from "@/lib/logger";
import { normalizeError } from "@/lib/error-handler";
import type { ApiResponse } from "@/types/api";

export async function safeAction<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<ApiResponse<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    const normalized = normalizeError(error);
    logger[normalized.code === "INTERNAL_ERROR" ? "error" : "warn"]("action.failed", {
      action: name,
      code: normalized.code,
    });
    return { success: false, error: normalized };
  }
}

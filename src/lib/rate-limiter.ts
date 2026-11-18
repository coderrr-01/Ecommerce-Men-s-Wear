import "server-only";

import {
  incrementRateLimitBucket,
  clearRateLimitBucket,
} from "@/features/security/repositories/rate-limit.repository";
import {
  exceedsRateLimit,
  rateLimitError,
  rateLimitKey,
  rateLimitWindow,
} from "@/features/security/rate-limit.utils";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export interface RateLimitOptions {
  failureMode?: "open" | "closed";
  message?: string;
}

export async function enforceRateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
  options: RateLimitOptions = {},
): Promise<void> {
  const now = new Date();
  const windowStart = rateLimitWindow(now, windowMs);
  const keyHash = rateLimitKey(scope, identity);
  try {
    const count = await incrementRateLimitBucket(
      keyHash,
      windowStart,
      new Date(windowStart.getTime() + windowMs),
    );
    if (exceedsRateLimit(count, limit)) {
      const error = rateLimitError(new Date(windowStart.getTime() + windowMs), now);
      throw options.message
        ? new AppError("RATE_LIMITED", options.message, { status: 429, cause: error })
        : error;
    }
  } catch (error) {
    if (error instanceof AppError && error.code === "RATE_LIMITED") throw error;
    logger.error("security.rate_limiter_unavailable", {
      scope,
      failureMode: options.failureMode ?? "open",
    });
    if (options.failureMode === "closed") {
      throw new AppError("INTERNAL_ERROR", "Security checks are temporarily unavailable.", {
        cause: error,
      });
    }
  }
}

export async function clearRateLimit(
  scope: string,
  identity: string,
  windowMs: number,
  now = new Date(),
): Promise<void> {
  const windowStart = rateLimitWindow(now, windowMs);
  await clearRateLimitBucket(rateLimitKey(scope, identity), windowStart);
}

export function getClientIp(headers: Headers): string | null {
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

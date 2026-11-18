import { createHmac } from "node:crypto";
import { AppError } from "@/lib/errors";

export function rateLimitKey(scope: string, identity: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "local-development-rate-limit")
    .update(`${scope}\u0000${identity}`)
    .digest("hex");
}

export function rateLimitWindow(now: Date, windowMs: number): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

export function exceedsRateLimit(count: number, limit: number): boolean {
  return count > limit;
}

export function rateLimitError(retryAt: Date, now = new Date()): AppError {
  const minutes = Math.max(1, Math.ceil((retryAt.getTime() - now.getTime()) / 60_000));
  return new AppError(
    "RATE_LIMITED",
    `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    {
      status: 429,
    },
  );
}

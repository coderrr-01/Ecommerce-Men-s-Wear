import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again later.",
): void {
  const key = createHash("sha256").update(`${scope}:${identity}`).digest("hex");
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [candidate, value] of buckets) if (value.resetAt <= now) buckets.delete(candidate);
    }
    return;
  }
  if (bucket.count >= limit) {
    throw new AppError("RATE_LIMITED", message, { status: 429 });
  }
  bucket.count += 1;
}

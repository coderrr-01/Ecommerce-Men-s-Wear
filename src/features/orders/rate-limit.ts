import { createHash } from "node:crypto";

import { AppError } from "@/lib/errors";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ORDERS = 5;
const attempts = new Map<string, number[]>();

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function enforceOrderRateLimit(phone: string, ipAddress?: string | null): void {
  const now = Date.now();
  const keys = [`phone:${hash(phone)}`];
  if (ipAddress) keys.push(`ip:${hash(ipAddress)}`);

  const current = keys.map((key) => ({
    key,
    times: (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS),
  }));
  if (current.some(({ times }) => times.length >= MAX_ORDERS)) {
    throw new AppError("RATE_LIMITED", "Too many order requests. Please try again later.", {
      status: 429,
    });
  }

  for (const entry of current) attempts.set(entry.key, [...entry.times, now]);
  if (attempts.size > 10_000) {
    for (const [key, times] of attempts) {
      if (times.every((time) => now - time >= WINDOW_MS)) attempts.delete(key);
    }
  }
}

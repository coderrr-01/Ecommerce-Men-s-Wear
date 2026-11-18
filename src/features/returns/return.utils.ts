import { ValidationError } from "@/lib/errors";

export function isWithinReturnWindow(
  deliveredAt: Date | null,
  now: Date,
  windowDays: number,
): boolean {
  if (!deliveredAt || !Number.isInteger(windowDays) || windowDays < 0) return false;
  const age = now.getTime() - deliveredAt.getTime();
  return age >= 0 && age <= windowDays * 24 * 60 * 60 * 1000;
}

export function validateReturnReason(reason: string): string {
  const clean = reason
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length < 10 || clean.length > 1000) {
    throw new ValidationError("Tell us a little more about the reason (10-1000 characters).");
  }
  return clean;
}

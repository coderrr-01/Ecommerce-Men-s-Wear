import { createHash } from "node:crypto";

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isPasswordResetTokenUsable(
  token: { usedAt: Date | null; expiresAt: Date },
  now: Date,
): boolean {
  return token.usedAt === null && token.expiresAt.getTime() > now.getTime();
}

export function isPasswordResetTokenFormatValid(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,60}$/.test(token);
}

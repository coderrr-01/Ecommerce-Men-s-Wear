import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { env } from "@/env";
import { siteConfig } from "@/config/site.config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hashPasswordResetToken } from "@/features/auth/password-reset.utils";
import { getEmailProvider } from "@/lib/providers/email";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from "@/features/auth/repositories/password-reset.repository";

const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function requestPasswordReset(email: string): Promise<"sent" | "unavailable"> {
  if (env.EMAIL_PROVIDER !== "resend" || !env.RESEND_API_KEY) return "unavailable";
  const user = await prisma.user.findFirst({
    where: { email, isActive: true, deletedAt: null },
    select: { id: true, email: true },
  });
  if (!user) return "sent";

  const token = randomBytes(32).toString("base64url");
  const tokenRecord = await createPasswordResetToken(
    user.id,
    hashPasswordResetToken(token),
    new Date(Date.now() + TOKEN_TTL_MS),
  );
  const resetUrl = new URL("/reset-password", siteConfig.url);
  resetUrl.searchParams.set("token", token);
  try {
    await getEmailProvider().send({
      to: user.email,
      subject: `Reset your ${siteConfig.name} password`,
      text: `Use this link within 30 minutes to reset your password: ${resetUrl.toString()}`,
      html: `<p>Use this link within 30 minutes to reset your password:</p><p><a href="${resetUrl.toString()}">Reset password</a></p>`,
    });
    return "sent";
  } catch {
    logger.error("auth.password_reset_email_failed", { provider: "email" });
    try {
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
    } catch {
      logger.error("auth.password_reset_token_cleanup_failed", { reason: "storage_error" });
    }
    return "sent";
  }
}

export async function resetPassword(token: string, password: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(password, 12);
  return consumePasswordResetToken(hashPasswordResetToken(token), passwordHash);
}

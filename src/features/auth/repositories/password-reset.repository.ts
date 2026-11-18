import "server-only";

import { prisma } from "@/lib/db";
import { isPasswordResetTokenUsable } from "@/features/auth/password-reset.utils";

export async function createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
  return prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: { userId, OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
    });
    return tx.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
      select: { id: true },
    });
  });
}

export async function consumePasswordResetToken(
  tokenHash: string,
  passwordHash: string,
  now = new Date(),
) {
  return prisma.$transaction(async (tx) => {
    const token = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    if (!token || !isPasswordResetTokenUsable(token, now)) return false;

    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) return false;

    await tx.user.update({
      where: { id: token.userId },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
        forcePasswordChange: false,
      },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: token.userId, id: { not: token.id }, usedAt: null },
      data: { usedAt: now },
    });
    return true;
  });
}

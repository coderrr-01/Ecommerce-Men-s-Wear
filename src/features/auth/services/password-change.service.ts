import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  nextPassword: string,
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return false;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(nextPassword, 12),
      sessionVersion: { increment: 1 },
      forcePasswordChange: false,
    },
  });
  return true;
}

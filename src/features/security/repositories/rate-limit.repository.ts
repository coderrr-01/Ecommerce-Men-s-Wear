import "server-only";

import { prisma } from "@/lib/db";

export async function incrementRateLimitBucket(
  keyHash: string,
  windowStart: Date,
  expiresAt: Date,
) {
  const bucket = await prisma.rateLimitBucket.upsert({
    where: { keyHash_windowStart: { keyHash, windowStart } },
    create: { keyHash, windowStart, expiresAt, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });
  if (Math.random() < 0.01) {
    const expired = await prisma.rateLimitBucket.findMany({
      where: { expiresAt: { lt: new Date() } },
      orderBy: { expiresAt: "asc" },
      take: 25,
      select: { keyHash: true, windowStart: true },
    });
    if (expired.length) {
      await prisma.rateLimitBucket.deleteMany({
        where: { OR: expired },
      });
    }
  }
  return bucket.count;
}

export async function clearRateLimitBucket(keyHash: string, windowStart: Date) {
  await prisma.rateLimitBucket.deleteMany({ where: { keyHash, windowStart } });
}

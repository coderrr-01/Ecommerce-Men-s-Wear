import "server-only";

import { Prisma } from "@prisma/client";
import { productCardSelect } from "@/features/catalog/repositories/catalog.repository";
import { prisma } from "@/lib/db";

export async function listWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId, product: { isActive: true, deletedAt: null } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: productCardSelect } },
  });
}

export async function mergeWishlist(userId: string, productIds: string[]) {
  if (!productIds.length) return;
  await prisma.$transaction(async (tx) => {
    const active = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
      select: { id: true },
    });
    await tx.wishlist.createMany({
      data: active.map(({ id }) => ({ userId, productId: id })),
      skipDuplicates: true,
    });
  });
}

export async function toggleWishlist(userId: string, productId: string) {
  return prisma
    .$transaction(async (tx) => {
      const existing = await tx.wishlist.findUnique({
        where: { userId_productId: { userId, productId } },
        select: { id: true },
      });
      if (existing) {
        await tx.wishlist.delete({ where: { id: existing.id } });
        return false;
      }
      const product = await tx.product.findFirst({
        where: { id: productId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!product) return false;
      await tx.wishlist.create({ data: { userId, productId } });
      return true;
    })
    .catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
        return true;
      throw error;
    });
}

export async function clearWishlist(userId: string) {
  await prisma.wishlist.deleteMany({ where: { userId } });
}

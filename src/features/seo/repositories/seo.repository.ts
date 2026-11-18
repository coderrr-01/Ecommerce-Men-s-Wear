import "server-only";

import { prisma } from "@/lib/db";

export async function findPublicSitemapData() {
  const [categories, products] = await prisma.$transaction([
    prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        category: { isActive: true, deletedAt: null },
        variants: { some: { isActive: true, deletedAt: null } },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          where: { deletedAt: null },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { url: true },
        },
      },
    }),
  ]);
  return { categories, products };
}

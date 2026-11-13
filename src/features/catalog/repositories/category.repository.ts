import "server-only";

import { prisma } from "@/lib/db";

export async function listAdminCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { products: { where: { deletedAt: null } }, children: true } },
    },
  });
}

export async function findCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, parentId: true, slug: true, isActive: true },
  });
}

export async function isCategorySlugTaken(slug: string, exceptId?: string) {
  return Boolean(
    await prisma.category.findFirst({
      where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    }),
  );
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    isActive: boolean;
    sortOrder: number;
  },
) {
  return prisma.category.updateMany({
    where: { id, deletedAt: null },
    data,
  });
}

export async function softDeleteCategoryIfEmpty(id: string) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        _count: {
          select: { products: { where: { deletedAt: null } }, children: { where: { deletedAt: null } } },
        },
      },
    });
    if (!category) return { found: false, productCount: 0, childCount: 0 };

    const productCount = category._count.products;
    const childCount = category._count.children;
    if (productCount || childCount) return { found: true, productCount, childCount };

    await tx.category.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return { found: true, productCount, childCount };
  });
}

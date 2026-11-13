import "server-only";

import type { Prisma } from "@prisma/client";

import type { ProductListQuery } from "@/features/catalog/schemas/product.schema";
import { prisma } from "@/lib/db";

const ADMIN_PAGE_SIZE = 20;

function orderBy(sort: ProductListQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "name-asc":
      return { name: "asc" };
    case "name-desc":
      return { name: "desc" };
    case "price-asc":
      return { basePrice: "asc" };
    case "price-desc":
      return { basePrice: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function listAdminProducts(query: ProductListQuery, lowStockThreshold: number) {
  const where: Prisma.ProductWhereInput = { deletedAt: null };
  if (query.status !== "all") where.isActive = query.status === "active";
  if (query.category) where.categoryId = query.category;
  if (query.featured !== "all") where.isFeatured = query.featured === "yes";
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { brand: { contains: query.q, mode: "insensitive" } },
      {
        variants: {
          some: { deletedAt: null, sku: { contains: query.q, mode: "insensitive" } },
        },
      },
    ];
  }
  if (query.stock !== "all") {
    const stock: Prisma.IntFilter = {
      in: query.stock === "out" ? [0] : undefined,
      gt: query.stock === "in" || query.stock === "low" ? 0 : undefined,
      lte: query.stock === "low" ? lowStockThreshold : undefined,
    };
    where.variants = { some: { deletedAt: null, stock } };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        createdAt: true,
        category: { select: { name: true } },
        variants: { where: { deletedAt: null }, select: { stock: true } },
        _count: {
          select: {
            variants: { where: { deletedAt: null } },
            images: { where: { deletedAt: null } },
          },
        },
      },
    }),
  ]);
  return { rows, total, pageSize: ADMIN_PAGE_SIZE };
}

export async function listAdminCategoryOptions(currentCategoryId?: string) {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
      OR: [{ isActive: true }, ...(currentCategoryId ? [{ id: currentCategoryId }] : [])],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      brand: true,
      categoryId: true,
      fabric: true,
      fit: true,
      occasion: true,
      careInstructions: true,
      seoTitle: true,
      seoDescription: true,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      sizeType: true,
      variants: {
        where: { deletedAt: null },
        orderBy: [{ color: "asc" }, { size: "asc" }],
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          colorHex: true,
          price: true,
          compareAtPrice: true,
          stock: true,
        },
      },
      _count: { select: { images: { where: { deletedAt: null } } } },
    },
  });
}

export async function findCategoryForProduct(id: string) {
  return prisma.category.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, isActive: true },
  });
}

export async function isProductSlugTaken(slug: string, exceptId?: string) {
  return Boolean(
    await prisma.product.findFirst({
      where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    }),
  );
}

export async function getTakenVariantSkus(skus: string[], allowedIds: string[]) {
  return prisma.productVariant.findMany({
    where: {
      sku: { in: skus },
      ...(allowedIds.length ? { id: { notIn: allowedIds } } : {}),
    },
    select: { sku: true },
  });
}

import "server-only";

import type { Prisma } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import type { CatalogQuery } from "@/features/catalog/types";
import { prisma } from "@/lib/db";

const variantWhere = {
  isActive: true,
  deletedAt: null,
} satisfies Prisma.ProductVariantWhereInput;

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  basePrice: true,
  isFeatured: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: {
    where: { deletedAt: null },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    take: 1,
    select: { url: true, altText: true },
  },
  variants: {
    where: variantWhere,
    select: { price: true, compareAtPrice: true, stock: true },
  },
} satisfies Prisma.ProductSelect;

export async function findProductReviewAggregates(productIds: string[]) {
  if (!productIds.length) return new Map<string, { average: number; count: number }>();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: "APPROVED", deletedAt: null },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    rows.map((row) => [
      row.productId,
      {
        average: Math.round((row._avg.rating ?? 0) * 10) / 10,
        count: row._count._all,
      },
    ]),
  );
}

function orderByFor(sort: CatalogQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { basePrice: "asc" };
    case "price-desc":
      return { basePrice: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "name-desc":
      return { name: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function findProductList(query: CatalogQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
    category: { isActive: true, deletedAt: null },
    variants: { some: variantWhere },
  };

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { brand: { contains: query.q, mode: "insensitive" } },
      { fabric: { contains: query.q, mode: "insensitive" } },
    ];
  }

  if (query.category) {
    where.category = {
      slug: query.category,
      isActive: true,
      deletedAt: null,
    };
  }

  if (query.size) {
    where.variants = {
      some: { ...variantWhere, size: query.size },
    };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: orderByFor(query.sort),
      skip: (query.page - 1) * DEFAULT_PAGE_SIZE,
      take: DEFAULT_PAGE_SIZE,
      select: productCardSelect,
    }),
  ]);

  return { rows, total };
}

export async function findFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      isFeatured: true,
      variants: { some: variantWhere },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productCardSelect,
  });
}

export async function findRelatedProducts(categoryId: string, excludeSlug: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      categoryId,
      slug: { not: excludeSlug },
      isActive: true,
      deletedAt: null,
      variants: { some: variantWhere },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productCardSelect,
  });
}

export async function findCategoryOptions() {
  return prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
    },
  });
}

export async function findProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      brand: true,
      fabric: true,
      fit: true,
      occasion: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      images: {
        where: { deletedAt: null },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, altText: true },
      },
      variants: {
        where: variantWhere,
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
      reviews: {
        where: { status: "APPROVED", deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
          photos: { take: 3, select: { url: true } },
        },
      },
    },
  });
}

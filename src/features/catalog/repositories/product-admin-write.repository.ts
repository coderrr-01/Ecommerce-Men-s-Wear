import "server-only";

import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

interface ProductWrite {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string | null;
  categoryId: string;
  fabric: string | null;
  fit: string;
  occasion: string;
  careInstructions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  sizeType: "TOPS" | "BOTTOMS" | "FOOTWEAR" | "FREE_SIZE";
  variants: {
    id?: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
  }[];
}

export async function saveAdminProduct(data: ProductWrite, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = data.id
      ? await tx.product.findFirst({
          where: { id: data.id, deletedAt: null },
          select: {
            id: true,
            variants: {
              where: { deletedAt: null },
              select: { id: true, stock: true },
            },
          },
        })
      : null;
    if (data.id && !existing) throw new NotFoundError("Product");

    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      brand: data.brand,
      categoryId: data.categoryId,
      fabric: data.fabric,
      fit: data.fit,
      occasion: data.occasion,
      careInstructions: data.careInstructions,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isNewArrival: data.isNewArrival,
      sizeType: data.sizeType,
      basePrice: Math.min(...data.variants.map((variant) => variant.price)),
    };
    const product = existing
      ? await tx.product.update({
          where: { id: existing.id },
          data: productData,
          select: { id: true },
        })
      : await tx.product.create({ data: productData, select: { id: true } });
    const existingById = new Map(
      (existing?.variants ?? []).map((variant) => [variant.id, variant]),
    );
    const submittedIds = new Set(
      data.variants.flatMap((variant) => (variant.id ? [variant.id] : [])),
    );

    for (const variant of data.variants) {
      const { id, ...variantData } = variant;
      if (id && !existingById.has(id)) {
        throw new ConflictError("A submitted variant does not belong to this product.");
      }

      const saved = id
        ? await tx.productVariant.update({ where: { id }, data: variantData, select: { id: true } })
        : await tx.productVariant.create({
            data: { ...variantData, productId: product.id },
            select: { id: true },
          });
      const previousStock = id ? (existingById.get(id)?.stock ?? 0) : 0;
      const delta = variant.stock - previousStock;
      if (delta !== 0) {
        await tx.stockMovement.create({
          data: {
            variantId: saved.id,
            userId,
            delta,
            reason: id ? "Product form stock adjustment" : "Initial stock",
          },
        });
      }
    }

    const removed = (existing?.variants ?? []).filter((variant) => !submittedIds.has(variant.id));
    for (const variant of removed) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: 0, isActive: false, deletedAt: new Date() },
      });
      if (variant.stock > 0) {
        await tx.stockMovement.create({
          data: {
            variantId: variant.id,
            userId,
            delta: -variant.stock,
            reason: "Variant removed from product",
          },
        });
      }
    }

    return product;
  });
}

export async function updateProductStatuses(
  ids: string[],
  action: "activate" | "deactivate" | "delete",
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    if (action !== "delete") {
      return tx.product.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { isActive: action === "activate" },
      });
    }

    const products = await tx.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        variants: { where: { deletedAt: null }, select: { id: true, stock: true } },
      },
    });
    if (products.length !== ids.length) return { count: 0 };

    const now = new Date();
    for (const product of products) {
      for (const variant of product.variants) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: 0, isActive: false, deletedAt: now },
        });
        if (variant.stock > 0) {
          await tx.stockMovement.create({
            data: {
              variantId: variant.id,
              userId,
              delta: -variant.stock,
              reason: "Product soft deleted",
            },
          });
        }
      }
    }
    return tx.product.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { isActive: false, deletedAt: now },
    });
  });
}

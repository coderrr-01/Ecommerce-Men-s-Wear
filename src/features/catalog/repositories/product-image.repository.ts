import "server-only";

import { Prisma } from "@prisma/client";
import { MAX_PRODUCT_IMAGES } from "@/features/catalog/product-image.utils";
import { ConflictError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function getProductImageState(productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: {
      name: true,
      _count: { select: { images: { where: { deletedAt: null } } } },
    },
  });
}

export async function listProductImages(productId: string) {
  return prisma.productImage.findMany({
    where: { productId, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      url: true,
      altText: true,
      sortOrder: true,
      isPrimary: true,
      publicId: true,
    },
  });
}

export async function createProductImage(
  productId: string,
  asset: { url: string; publicId: string; altText: string },
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, deletedAt: null },
        select: { id: true },
      });
      if (!product) return null;

      const count = await tx.productImage.count({ where: { productId, deletedAt: null } });
      if (count >= MAX_PRODUCT_IMAGES) {
        throw new ConflictError(`A product can have no more than ${MAX_PRODUCT_IMAGES} images.`);
      }
      return tx.productImage.create({
        data: {
          productId,
          url: asset.url,
          publicId: asset.publicId,
          altText: asset.altText,
          sortOrder: count,
          isPrimary: count === 0,
        },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
          isPrimary: true,
          publicId: true,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      throw new ConflictError("The product images changed. Refresh and try uploading again.");
    }
    throw error;
  }
}

export async function updateProductImageAltText(id: string, productId: string, altText: string) {
  return prisma.productImage.updateMany({
    where: { id, productId, deletedAt: null },
    data: { altText },
  });
}

export async function reorderProductImages(
  productId: string,
  ids: string[],
  primaryId: string,
) {
  return prisma.$transaction(async (tx) => {
    const images = await tx.productImage.findMany({
      where: { productId, deletedAt: null },
      select: { id: true },
    });
    if (images.length !== ids.length || !ids.every((id) => images.some((image) => image.id === id))) {
      return false;
    }

    for (const [sortOrder, id] of ids.entries()) {
      await tx.productImage.update({
        where: { id },
        data: { sortOrder, isPrimary: id === primaryId },
      });
    }
    return true;
  });
}

export async function getProductImageForDelete(id: string, productId: string) {
  return prisma.productImage.findFirst({
    where: { id, productId, deletedAt: null },
    select: { id: true, publicId: true, isPrimary: true },
  });
}

export async function softDeleteProductImage(id: string, productId: string) {
  return prisma.$transaction(async (tx) => {
    const image = await tx.productImage.findFirst({
      where: { id, productId, deletedAt: null },
      select: { id: true, isPrimary: true },
    });
    if (!image) return false;

    await tx.productImage.update({
      where: { id },
      data: { deletedAt: new Date(), isPrimary: false },
    });
    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({
        where: { productId, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });
      if (next) await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
    return true;
  });
}

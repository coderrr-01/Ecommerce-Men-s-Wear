import "server-only";

import { isStorageConfigured, getStorageProvider } from "@/lib/providers/storage";
import {
  createProductImage,
  getProductImageForDelete,
  getProductImageState,
  listProductImages,
  reorderProductImages,
  softDeleteProductImage,
  updateProductImageAltText,
} from "@/features/catalog/repositories/product-image.repository";
import {
  MAX_PRODUCT_IMAGES,
  validateProductImage,
} from "@/features/catalog/product-image.utils";
import { AppError, ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function getProductImageData(productId: string) {
  const [product, images] = await Promise.all([
    getProductImageState(productId),
    listProductImages(productId),
  ]);
  if (!product) throw new NotFoundError("Product");
  const storageConfigured = isStorageConfigured();

  return {
    productName: product.name,
    storageConfigured,
    images: images.map(({ publicId, altText, ...image }) => ({
      ...image,
      altText: altText ?? product.name,
      canDelete: !publicId || storageConfigured,
    })),
    imageCount: product._count.images,
  };
}

export async function uploadProductImage(productId: string, file: File) {
  if (!isStorageConfigured()) {
    throw new AppError(
      "PROVIDER_ERROR",
      "Image storage is not configured. Ask an administrator to configure Cloudinary.",
      { status: 503 },
    );
  }
  const product = await getProductImageState(productId);
  if (!product) throw new NotFoundError("Product");
  if (product._count.images >= MAX_PRODUCT_IMAGES) {
    throw new ConflictError(`A product can have no more than ${MAX_PRODUCT_IMAGES} images.`);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = validateProductImage(bytes, file.type);
  const provider = getStorageProvider();
  const fileName = file.name.replace(/[\\/]/g, "_").slice(0, 120) || "product-image";
  const uploaded = await provider.upload({
    file: bytes,
    fileName,
    mimeType,
    folder: `products/${productId}`,
  });

  try {
    const image = await createProductImage(productId, {
      url: uploaded.url,
      publicId: uploaded.publicId,
      altText: product.name,
    });
    if (!image) throw new NotFoundError("Product");
    return {
      id: image.id,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    };
  } catch (error) {
    try {
      await provider.delete(uploaded.publicId);
    } catch (cleanupError) {
      logger.error("catalog.image_upload_cleanup_failed", {
        productId,
        error: cleanupError,
      });
    }
    throw error;
  }
}

export async function updateProductImageAlt(id: string, productId: string, altText: string) {
  const result = await updateProductImageAltText(id, productId, altText.trim());
  if (result.count === 0) throw new NotFoundError("Product image");
  return { id };
}

export async function setProductImageOrder(
  productId: string,
  ids: string[],
  primaryId: string,
) {
  if (new Set(ids).size !== ids.length || !ids.includes(primaryId)) {
    throw new ValidationError("Choose a valid image order and primary image.");
  }
  if (!(await reorderProductImages(productId, ids, primaryId))) {
    throw new ConflictError("The product images changed. Refresh and try again.");
  }
  return { primaryId };
}

export async function deleteProductImage(id: string, productId: string) {
  const image = await getProductImageForDelete(id, productId);
  if (!image) throw new NotFoundError("Product image");

  if (image.publicId) {
    if (!isStorageConfigured()) {
      throw new AppError(
        "PROVIDER_ERROR",
        "Image storage is not configured. Ask an administrator to configure Cloudinary.",
        { status: 503 },
      );
    }
    await getStorageProvider().delete(image.publicId);
  }
  if (!(await softDeleteProductImage(id, productId))) {
    throw new NotFoundError("Product image");
  }
  return { id };
}

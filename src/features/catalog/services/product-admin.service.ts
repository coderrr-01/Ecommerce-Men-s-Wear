import "server-only";

import { Prisma } from "@prisma/client";
import { siteConfig } from "@/config/site.config";
import {
  findCategoryForProduct,
  getAdminProduct,
  getTakenVariantSkus,
  isProductSlugTaken,
  listAdminCategoryOptions,
  listAdminProducts,
} from "@/features/catalog/repositories/product-admin.repository";
import {
  saveAdminProduct,
  updateProductStatuses,
} from "@/features/catalog/repositories/product-admin-write.repository";
import {
  assertProductSizeSet,
  paiseToRupees,
  PRODUCT_SIZES,
  PRODUCT_SIZE_TYPES,
  rupeesToPaise,
} from "@/features/catalog/product.utils";
import type {
  ParsedProductInput,
  ProductListQuery,
} from "@/features/catalog/schemas/product.schema";
import type { AdminProductFormData } from "@/features/catalog/types";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";

export async function getAdminProductList(query: ProductListQuery) {
  const threshold = siteConfig.inventory.lowStockThreshold;
  let result = await listAdminProducts(query, threshold);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const page = Math.min(query.page, totalPages);
  if (page !== query.page) {
    result = await listAdminProducts({ ...query, page }, threshold);
  }
  const { rows, total, pageSize } = result;
  return {
    products: rows.map(({ variants, _count, ...product }) => ({
      ...product,
      variantCount: _count.variants,
      imageCount: _count.images,
      totalStock: variants.reduce((sum, variant) => sum + variant.stock, 0),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function productFit(value: string | null): AdminProductFormData["fit"] {
  return value === "Slim" || value === "Regular" || value === "Relaxed" ? value : "Regular";
}

function productOccasion(value: string | null): AdminProductFormData["occasion"] {
  if (value === "Formal" || value === "Party" || value === "Ethnic") return value;
  return value === "Festive" || value === "Wedding" || value === "Occasion" ? "Party" : "Casual";
}

export async function getProductFormData(id?: string): Promise<{
  categories: { id: string; name: string }[];
  product: AdminProductFormData | null;
}> {
  const product = id ? await getAdminProduct(id) : null;
  const categories = await listAdminCategoryOptions(product?.categoryId);

  return {
    categories,
    product: product
      ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          brand: product.brand ?? "",
          categoryId: product.categoryId,
          fabric: product.fabric ?? "",
          fit: productFit(product.fit),
          occasion: productOccasion(product.occasion),
          careInstructions: product.careInstructions ?? "",
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          status: product.isActive ? "active" : "draft",
          sizeType: resolveSizeType(
            product.sizeType,
            product.variants.map((variant) => variant.size),
          ),
          imageCount: product._count.images,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex ?? "",
            price: paiseToRupees(variant.price),
            compareAtPrice:
              variant.compareAtPrice === null ? "" : paiseToRupees(variant.compareAtPrice),
            stock: variant.stock,
          })),
        }
      : null,
  };
}

function resolveSizeType(current: string, sizes: string[]): (typeof PRODUCT_SIZE_TYPES)[number] {
  if (PRODUCT_SIZE_TYPES.includes(current as (typeof PRODUCT_SIZE_TYPES)[number])) {
    const type = current as (typeof PRODUCT_SIZE_TYPES)[number];
    if (sizes.every((size) => PRODUCT_SIZES[type].includes(size))) return type;
  }
  return (
    PRODUCT_SIZE_TYPES.find((type) => sizes.every((size) => PRODUCT_SIZES[type].includes(size))) ??
    "FREE_SIZE"
  );
}

export async function isAdminProductSlugAvailable(slug: string, id?: string) {
  return !(await isProductSlugTaken(slug, id));
}

function nullable(value: string): string | null {
  return value.trim() || null;
}

export async function saveProduct(data: ParsedProductInput, userId: string) {
  const category = await findCategoryForProduct(data.categoryId);
  if (!category?.isActive) throw new ValidationError("Choose an active category.");
  if (await isProductSlugTaken(data.slug, data.id)) {
    throw new ConflictError("That product slug is already in use.");
  }

  assertProductSizeSet(data.sizeType, data.variants);
  const variantIds = data.variants.flatMap((variant) => (variant.id ? [variant.id] : []));
  if (new Set(variantIds).size !== variantIds.length) {
    throw new ValidationError("A variant can only appear once in the product form.");
  }
  const takenSkus = await getTakenVariantSkus(
    data.variants.map((variant) => variant.sku),
    variantIds,
  );
  if (takenSkus.length) {
    throw new ConflictError(`SKU ${takenSkus[0].sku} is already in use.`);
  }

  const variants = data.variants.map((variant) => ({
    ...variant,
    colorHex: variant.colorHex || null,
    price: rupeesToPaise(variant.price),
    compareAtPrice: variant.compareAtPrice ? rupeesToPaise(variant.compareAtPrice) : null,
  }));
  try {
    return await saveAdminProduct(
      {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: nullable(data.shortDescription),
        brand: nullable(data.brand),
        categoryId: data.categoryId,
        fabric: nullable(data.fabric),
        fit: data.fit,
        occasion: data.occasion,
        careInstructions: nullable(data.careInstructions),
        seoTitle: nullable(data.seoTitle),
        seoDescription: nullable(data.seoDescription),
        isActive: data.status === "active",
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        sizeType: data.sizeType,
        variants,
      },
      userId,
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("The product slug or one of its SKUs is already in use.");
    }
    throw error;
  }
}

export async function manageProducts(
  ids: string[],
  action: "activate" | "deactivate" | "delete",
  userId: string,
) {
  const result = await updateProductStatuses(ids, action, userId);
  if (result.count !== ids.length) {
    throw new NotFoundError("One or more selected products");
  }
  return { updated: result.count };
}

import "server-only";

import { DEFAULT_PAGE_SIZE, PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import {
  findCategoryOptions,
  findProductReviewAggregates,
  findFeaturedProducts,
  findProductBySlug,
  findProductList,
  findRelatedProducts,
} from "@/features/catalog/repositories/catalog.repository";
import type {
  CatalogQuery,
  ProductCardData,
  ProductDetailData,
  ProductListResult,
} from "@/features/catalog/types";
import { calculateDiscountPercent } from "@/lib/utils";

const NEW_PRODUCT_DAYS = 30;

type ProductCardRow = Awaited<ReturnType<typeof findProductList>>["rows"][number];

export function toProductCard(row: ProductCardRow): ProductCardData {
  const prices = row.variants.map((variant) => variant.price);
  const price = prices.length > 0 ? Math.min(...prices) : row.basePrice;
  const compareCandidates = row.variants
    .map((variant) => variant.compareAtPrice)
    .filter((value): value is number => typeof value === "number" && value > price);
  const compareAtPrice = compareCandidates.length > 0 ? Math.min(...compareCandidates) : null;
  const image = row.images[0];
  const newCutoff = Date.now() - NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    categoryName: row.category.name,
    price,
    compareAtPrice,
    discountPercent: calculateDiscountPercent(price, compareAtPrice),
    imageUrl: image?.url ?? PRODUCT_PLACEHOLDER_IMAGE,
    imageAlt: image?.altText ?? row.name,
    inStock: row.variants.some((variant) => variant.stock > 0),
    isNew: row.createdAt.getTime() > newCutoff,
  };
}

export async function getProductList(query: CatalogQuery): Promise<ProductListResult> {
  const { rows, total } = await findProductList(query);
  const ratings = await findProductReviewAggregates(rows.map((row) => row.id));

  return {
    products: rows.map((row) => ({ ...toProductCard(row), rating: ratings.get(row.id) })),
    total,
    page: query.page,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE)),
  };
}

export async function getFeaturedProducts(limit = 4) {
  const rows = await findFeaturedProducts(limit);
  const ratings = await findProductReviewAggregates(rows.map((row) => row.id));
  return rows.map((row) => ({ ...toProductCard(row), rating: ratings.get(row.id) }));
}

export async function getRelatedProducts(categoryId: string, excludeSlug: string, limit = 4) {
  const rows = await findRelatedProducts(categoryId, excludeSlug, limit);
  const ratings = await findProductReviewAggregates(rows.map((row) => row.id));
  return rows.map((row) => ({ ...toProductCard(row), rating: ratings.get(row.id) }));
}

export async function getCategoryOptions() {
  return findCategoryOptions();
}

type ProductDetailRow = NonNullable<Awaited<ReturnType<typeof findProductBySlug>>>;

function toProductDetail(
  row: ProductDetailRow,
  rating: { average: number; count: number },
): ProductDetailData {
  const variants = row.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
  }));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    brand: row.brand,
    fabric: row.fabric,
    fit: row.fit,
    occasion: row.occasion,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.altText ?? row.name,
    })),
    variants,
    rating,
    reviews: row.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      author: review.user.name ?? "Verified customer",
      createdAt: review.createdAt,
      photos: review.photos.map((photo) => photo.url),
    })),
  };
}

export async function getProductDetail(slug: string) {
  const row = await findProductBySlug(slug);
  if (!row) return null;
  const ratings = await findProductReviewAggregates([row.id]);
  return toProductDetail(row, ratings.get(row.id) ?? { average: 0, count: 0 });
}

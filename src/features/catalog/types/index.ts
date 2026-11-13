import type { StorefrontSort } from "@/config/constants";

export type { StorefrontSort };

export interface CatalogQuery {
  q?: string;
  category?: string;
  size?: string;
  sort: StorefrontSort;
  page: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  categoryName: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number;
  imageUrl: string;
  imageAlt: string;
  inStock: boolean;
  isNew: boolean;
}

export interface ProductListResult {
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductVariantOption {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
}

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string | null;
  fabric: string | null;
  fit: string | null;
  occasion: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  images: { id: string; url: string; alt: string }[];
  variants: ProductVariantOption[];
  rating: { average: number; count: number };
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    author: string;
    createdAt: Date;
  }[];
}

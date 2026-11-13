import { z } from "zod";

import { PRODUCT_SIZE_TYPES, rupeesToPaise } from "@/features/catalog/product.utils";

const rupeesPattern = /^\d+(?:\.\d{1,2})?$/;
const rupeesSchema = z
  .string()
  .trim()
  .regex(rupeesPattern, "Enter rupees with up to two decimal places.")
  .refine((value) => {
    try {
      return rupeesToPaise(value) > 0;
    } catch {
      return false;
    }
  }, "Price must be greater than zero.");

const variantSchema = z
  .object({
    id: z.string().cuid().optional(),
    sku: z
      .string()
      .trim()
      .min(2)
      .max(64)
      .regex(/^[A-Z0-9-]+$/),
    size: z.string().trim().min(1).max(12),
    color: z.string().trim().min(1).max(40),
    colorHex: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/)]),
    price: rupeesSchema,
    compareAtPrice: z.union([z.literal(""), rupeesSchema]),
    stock: z.number().int().min(0).max(1_000_000),
  })
  .superRefine((variant, context) => {
    if (
      !variant.compareAtPrice ||
      !rupeesPattern.test(variant.price) ||
      !rupeesPattern.test(variant.compareAtPrice)
    ) {
      return;
    }
    try {
      if (rupeesToPaise(variant.compareAtPrice) <= rupeesToPaise(variant.price)) {
        context.addIssue({
          code: "custom",
          path: ["compareAtPrice"],
          message: "Compare-at price must be greater than the selling price.",
        });
      }
    } catch {
      return;
    }
  });

export const productSchema = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
    description: z.string().trim().min(1).max(12000),
    shortDescription: z.string().trim().max(500),
    brand: z.string().trim().max(100),
    categoryId: z.string().cuid(),
    fabric: z.string().trim().max(120),
    fit: z.enum(["Slim", "Regular", "Relaxed"]),
    occasion: z.enum(["Casual", "Formal", "Party", "Ethnic"]),
    careInstructions: z.string().trim().max(2000),
    seoTitle: z.string().trim().max(180),
    seoDescription: z.string().trim().max(320),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    status: z.enum(["active", "draft"]),
    sizeType: z.enum(PRODUCT_SIZE_TYPES),
    variants: z.array(variantSchema).min(1).max(100),
  })
  .superRefine((product, context) => {
    const sizesAndColors = new Set<string>();
    const skus = new Set<string>();
    for (const [index, variant] of product.variants.entries()) {
      const sizeColor = `${variant.size.toLocaleLowerCase()}|${variant.color.toLocaleLowerCase()}`;
      if (sizesAndColors.has(sizeColor)) {
        context.addIssue({
          code: "custom",
          path: ["variants", index, "size"],
          message: "Each size and colour combination must be unique.",
        });
      }
      if (skus.has(variant.sku)) {
        context.addIssue({
          code: "custom",
          path: ["variants", index, "sku"],
          message: "Each SKU must be unique.",
        });
      }
      sizesAndColors.add(sizeColor);
      skus.add(variant.sku);
    }
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ParsedProductInput = z.output<typeof productSchema>;

export const productListQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  category: z.string().trim().max(100).catch(""),
  status: z.enum(["all", "active", "draft"]).catch("all"),
  featured: z.enum(["all", "yes", "no"]).catch("all"),
  stock: z.enum(["all", "in", "low", "out"]).catch("all"),
  sort: z.enum(["newest", "name-asc", "name-desc", "price-asc", "price-desc"]).catch("newest"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export function parseProductListQuery(params: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return productListQuerySchema.parse({
    q: first(params.q),
    category: first(params.category),
    status: first(params.status),
    featured: first(params.featured),
    stock: first(params.stock),
    sort: first(params.sort),
    page: first(params.page),
  });
}

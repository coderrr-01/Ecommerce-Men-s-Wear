import { describe, expect, it } from "vitest";

import { assertCategoryDeletable, generateSlug } from "@/features/catalog/category.utils";
import { assertProductSizeSet, paiseToRupees, rupeesToPaise, suggestSku } from "@/features/catalog/product.utils";
import { buildCatalogHref } from "@/features/catalog/utils";
import { productSchema } from "@/features/catalog/schemas/product.schema";

describe("buildCatalogHref", () => {
  it("returns the bare shop path for default filters", () => {
    expect(buildCatalogHref({ sort: "newest", page: 1 })).toBe("/shop");
  });

  it("preserves filters and pagination", () => {
    expect(
      buildCatalogHref({
        q: "linen shirt",
        category: "shirts",
        size: "M",
        sort: "price-asc",
        page: 2,
      }),
    ).toBe("/shop?q=linen+shirt&category=shirts&size=M&sort=price-asc&page=2");
  });

  it("omits the default sort", () => {
    expect(buildCatalogHref({ category: "trousers" })).toBe("/shop?category=trousers");
  });
});

describe("catalog admin utilities", () => {
  const product = {
    name: "Oxford Shirt",
    slug: "oxford-shirt",
    description: "A considered cotton shirt.",
    shortDescription: "",
    brand: "",
    categoryId: "clh3s8d9f0000p0x2s2j8a1bc",
    fabric: "",
    fit: "Regular",
    occasion: "Casual",
    careInstructions: "",
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    isNewArrival: false,
    status: "draft",
    sizeType: "TOPS",
    variants: [
      {
        sku: "OXFORD-S-NAVY",
        size: "S",
        color: "Navy",
        colorHex: "",
        price: "199.00",
        compareAtPrice: "249.00",
        stock: 5,
      },
    ],
  };

  it("generates normalized category slugs and suggested SKUs", () => {
    expect(generateSlug("Men's Oxford — White")).toBe("men-s-oxford-white");
    expect(suggestSku("Men's Oxford", "M", "Navy Blue")).toBe("MEN-S-OXFORD-M-NAVY-BLUE");
  });

  it("converts rupees and paise without floating point loss", () => {
    expect(rupeesToPaise("199.05")).toBe(19905);
    expect(paiseToRupees(19905)).toBe("199.05");
    expect(() => rupeesToPaise("199.999")).toThrow();
  });

  it("validates variant fields, size sets and compare-at pricing", () => {
    expect(productSchema.safeParse(product).success).toBe(true);
    expect(
      productSchema.safeParse({
        ...product,
        variants: [{ ...product.variants[0], compareAtPrice: "150.00" }],
      }).success,
    ).toBe(false);
    expect(
      productSchema.safeParse({
        ...product,
        variants: [product.variants[0], { ...product.variants[0], sku: "OXFORD-S-NAVY-2" }],
      }).success,
    ).toBe(false);
    expect(() => assertProductSizeSet("TOPS", [{ size: "XXXL" }])).toThrow();
  });

  it("prevents deleting categories with products or children", () => {
    expect(() => assertCategoryDeletable(0, 0)).not.toThrow();
    expect(() => assertCategoryDeletable(1, 0)).toThrow("1 product");
    expect(() => assertCategoryDeletable(0, 2)).toThrow("2 child categories");
  });
});

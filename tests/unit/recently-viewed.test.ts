import { describe, expect, it } from "vitest";

import { prioritizeRecentlyViewed } from "@/features/catalog/storage/recently-viewed";
import type { ProductCardData } from "@/features/catalog/types";

function product(id: string): ProductCardData {
  return {
    id,
    name: `Product ${id}`,
    slug: `product-${id}`,
    brand: "Diamond Selection",
    categoryName: "Shirts",
    price: 249900,
    compareAtPrice: null,
    discountPercent: 0,
    imageUrl: "/placeholder.svg",
    imageAlt: `Product ${id}`,
    inStock: true,
    isNew: false,
  };
}

describe("recently viewed products", () => {
  it("moves a revisited product to the front without duplicating it", () => {
    const result = prioritizeRecentlyViewed([product("a"), product("b")], product("b"));

    expect(result.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("keeps only the eight most recently viewed products", () => {
    const existing = Array.from({ length: 8 }, (_, index) => product(String(index)));

    expect(prioritizeRecentlyViewed(existing, product("new")).map((item) => item.id)).toEqual([
      "new",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });
});

import { describe, expect, it } from "vitest";

import { seedCategories, seedProducts } from "../../prisma/seed-data";

const topSizes = ["S", "M", "L", "XL", "XXL"];
const bottomSizes = ["28", "30", "32", "34", "36", "38", "40", "42"];
const freeSizeCategories = ["sarong-lungi", "socks", "gloves", "topis-caps"];

describe("demo storefront catalogue", () => {
  it("defines the requested top-level categories and winter children", () => {
    const parents = seedCategories.filter((category) => !category.parentSlug);
    const winterChildren = seedCategories.filter(
      (category) => category.parentSlug === "winter-wear",
    );

    expect(parents.map((category) => category.slug)).toEqual([
      "shirts",
      "t-shirts",
      "collar-t-shirts",
      "night-wear-t-shirts",
      "baggy-jeans",
      "formal-pants",
      "trousers",
      "shorts",
      "sarong-lungi",
      "winter-wear",
    ]);
    expect(winterChildren.map((category) => category.slug)).toEqual([
      "socks",
      "gloves",
      "topis-caps",
    ]);
  });

  it("provides two or three demo products per category with category-appropriate sizes", () => {
    for (const category of seedCategories) {
      const products = seedProducts.filter((product) => product.categorySlug === category.slug);
      expect(products.length, category.slug).toBeGreaterThanOrEqual(2);
      expect(products.length, category.slug).toBeLessThanOrEqual(3);

      for (const product of products) {
        if (freeSizeCategories.includes(category.slug))
          expect(product.sizes).toEqual(["Free Size"]);
        else if (
          ["shirts", "t-shirts", "collar-t-shirts", "night-wear-t-shirts", "winter-wear"].includes(
            category.slug,
          )
        ) {
          expect(product.sizes).toEqual(topSizes);
        } else {
          expect(product.sizes).toEqual(bottomSizes);
        }
      }
    }
  });
});

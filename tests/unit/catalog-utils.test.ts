import { describe, expect, it } from "vitest";

import { buildCatalogHref } from "@/features/catalog/utils";

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

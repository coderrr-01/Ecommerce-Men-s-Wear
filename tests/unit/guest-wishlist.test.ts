import { afterEach, describe, expect, it, vi } from "vitest";

import { localStorageWishlistStorage } from "@/features/wishlist/storage/guest-wishlist";
import type { ProductCardData } from "@/features/catalog/types";

const product: ProductCardData = {
  id: "product_1",
  name: "Sample shirt",
  slug: "sample-shirt",
  brand: "Sample label",
  categoryName: "Shirts",
  price: 249900,
  compareAtPrice: null,
  discountPercent: 0,
  imageUrl: "/placeholder.svg",
  imageAlt: "Sample shirt",
  inStock: true,
  isNew: false,
};

function installStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const localStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
  vi.stubGlobal("window", { localStorage });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe("guest wishlist storage", () => {
  it("writes and reads saved product-card data", () => {
    installStorage();

    localStorageWishlistStorage.write([product]);

    expect(localStorageWishlistStorage.read()).toEqual([product]);
  });

  it("rejects malformed saved data", () => {
    installStorage({ "storefront:guest-wishlist:v1": JSON.stringify([{ name: "incomplete" }]) });

    expect(() => localStorageWishlistStorage.read()).toThrow("Saved wishlist data is invalid.");
  });
});

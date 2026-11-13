import { describe, expect, it } from "vitest";

import {
  MAX_PRODUCT_IMAGE_BYTES,
  detectImageMime,
  validateProductImage,
} from "@/features/catalog/product-image.utils";
import { ValidationError } from "@/lib/errors";

describe("product image validation", () => {
  it("detects JPEG, PNG and WebP signatures", () => {
    expect(detectImageMime(Uint8Array.from([0xff, 0xd8, 0xff]))).toBe("image/jpeg");
    expect(
      detectImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe("image/png");
    expect(
      detectImageMime(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])),
    ).toBe("image/webp");
  });

  it("rejects MIME mismatches and payloads over 5 MB", () => {
    expect(() => validateProductImage(Uint8Array.from([0xff, 0xd8, 0xff]), "image/png")).toThrow(
      ValidationError,
    );
    expect(() =>
      validateProductImage(new Uint8Array(MAX_PRODUCT_IMAGE_BYTES + 1), "image/png"),
    ).toThrow("5 MB");
  });
});

import { describe, expect, it } from "vitest";

import { getSafeSocialImageUrl } from "@/features/seo/seo.utils";

describe("social image URL safety", () => {
  const siteUrl = "https://shop.example";
  const fallback = "https://shop.example/placeholder.svg";

  it("allows same-origin and Cloudinary images but rejects unknown or insecure hosts", () => {
    expect(getSafeSocialImageUrl("/placeholder.svg", siteUrl, false)).toBe(fallback);
    expect(
      getSafeSocialImageUrl("https://res.cloudinary.com/store/image/upload/a.jpg", siteUrl, false),
    ).toContain("res.cloudinary.com");
    expect(getSafeSocialImageUrl("http://169.254.169.254/latest/meta-data", siteUrl, true)).toBe(
      fallback,
    );
    expect(getSafeSocialImageUrl("https://untrusted.example/pixel", siteUrl, true)).toBe(fallback);
  });

  it("allows demo hosts only when explicitly enabled", () => {
    const url = "https://images.unsplash.com/photo-1";
    expect(getSafeSocialImageUrl(url, siteUrl, false)).toBe(fallback);
    expect(getSafeSocialImageUrl(url, siteUrl, true)).toBe(url);
  });
});

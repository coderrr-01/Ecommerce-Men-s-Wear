import "server-only";

import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";
import { findPublicSitemapData } from "@/features/seo/repositories/seo.repository";

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await findPublicSitemapData();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: absolute("/contact"), changeFrequency: "monthly", priority: 0.4 },
    ...(["shipping", "returns", "privacy", "terms"] as const).map((slug) => ({
      url: absolute(`/policies/${slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absolute(`/shop?category=${encodeURIComponent(category.slug)}`),
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absolute(`/products/${encodeURIComponent(product.slug)}`),
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    images: product.images.map((image) => absolute(image.url)),
  }));
  return [...staticEntries, ...categoryEntries, ...productEntries];
}

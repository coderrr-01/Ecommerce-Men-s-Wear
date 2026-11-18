import type { MetadataRoute } from "next";

import { getSitemap } from "@/features/seo/services/sitemap.service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemap();
}

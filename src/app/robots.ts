import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/checkout", "/order/", "/api/orders/"],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}

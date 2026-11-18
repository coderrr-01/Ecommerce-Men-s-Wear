import type { NextConfig } from "next";
import { readCspMode } from "./src/lib/security/csp";
import { isDemoAssetsEnabled } from "./src/config/site.config";

const secureHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const headers = [...secureHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    readCspMode();
    return [{ source: "/:path*", headers }];
  },
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/orders/*/invoice": ["./assets/fonts/**/*"],
    "/api/og/products/*": [
      "./assets/fonts/NotoSans-Regular.ttf",
      "./assets/fonts/NotoSans-Bold.ttf",
      "./assets/fonts/NotoSansDevanagari-Regular.ttf",
      "./assets/fonts/NotoSansGujarati-Regular.ttf",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      ...(isDemoAssetsEnabled
        ? [
            { protocol: "https" as const, hostname: "images.unsplash.com" },
            { protocol: "https" as const, hostname: "picsum.photos" },
          ]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

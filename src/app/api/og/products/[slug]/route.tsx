// ImageResponse rasterizes its img element server-side into the social preview.
/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site.config";
import { isDemoAssetsEnabled } from "@/config/site.config";
import { getProductDetail } from "@/features/catalog/services/catalog.service";
import { getSafeSocialImageUrl } from "@/features/seo/seo.utils";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await getProductDetail(slug);
  if (!product) return new Response(null, { status: 404 });

  const price = product.variants.length
    ? Math.min(...product.variants.map((variant) => variant.price))
    : 0;
  const image = getSafeSocialImageUrl(product.images[0]?.url, siteConfig.url, isDemoAssetsEnabled);
  const fontDirectory = join(process.cwd(), "assets", "fonts");
  const fonts = [
    {
      name: "Noto Sans",
      data: await readFile(join(fontDirectory, "NotoSans-Regular.ttf")),
      weight: 400 as const,
    },
    {
      name: "Noto Sans",
      data: await readFile(join(fontDirectory, "NotoSans-Bold.ttf")),
      weight: 700 as const,
    },
  ];
  const usesGujarati = /[\u0A80-\u0AFF]/.test(product.name);
  const usesDevanagari = /[\u0900-\u097F]/.test(product.name);
  const titleFont = usesGujarati
    ? "Noto Sans Gujarati"
    : usesDevanagari
      ? "Noto Sans Devanagari"
      : "Noto Sans";
  if (usesGujarati) {
    fonts.push({
      name: "Noto Sans Gujarati",
      data: await readFile(join(fontDirectory, "NotoSansGujarati-Regular.ttf")),
      weight: 400,
    });
  } else if (usesDevanagari) {
    fonts.push({
      name: "Noto Sans Devanagari",
      data: await readFile(join(fontDirectory, "NotoSansDevanagari-Regular.ttf")),
      weight: 400,
    });
  }

  const response = new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#101827",
        color: "#ffffff",
        fontFamily: "Noto Sans",
      }}
    >
      <img
        src={image}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(16,24,39,.94), rgba(16,24,39,.4))",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          maxWidth: 850,
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 7, textTransform: "uppercase" }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.08,
            fontFamily: titleFont,
          }}
        >
          {product.name.slice(0, 72)}
        </div>
        <div style={{ marginTop: 28, fontSize: 34 }}>{formatPrice(price)}</div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts },
  );
  response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  return response;
}

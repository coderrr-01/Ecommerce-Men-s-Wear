import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductPurchasePanel } from "@/features/catalog/components/product-purchase-panel";
import { ProductStory } from "@/features/catalog/components/product-story";
import { RecentlyViewedProducts } from "@/features/catalog/components/recently-viewed-products";
import { getProductDetail, getRelatedProducts } from "@/features/catalog/services/catalog.service";
import { siteConfig } from "@/config/site.config";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription ?? product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? product.description.slice(0, 155),
      images: product.images[0]?.url
        ? [{ url: product.images[0].url, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.slug);
  const prices = product.variants.map((variant) => variant.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const compareAtPrice =
    product.variants
      .map((variant) => variant.compareAtPrice)
      .filter((price): price is number => price !== null && price > lowestPrice)
      .sort((a, b) => b - a)[0] ?? null;
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const recentProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    categoryName: product.categoryName,
    price: lowestPrice,
    compareAtPrice,
    discountPercent: compareAtPrice
      ? Math.round(((compareAtPrice - lowestPrice) / compareAtPrice) * 100)
      : 0,
    imageUrl: product.images[0]?.url ?? PRODUCT_PLACEHOLDER_IMAGE,
    imageAlt: product.images[0]?.alt ?? product.name,
    inStock,
    isNew: false,
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand ?? siteConfig.name },
    category: product.categoryName,
    image: product.images.map((image) => image.url),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: siteConfig.currency,
      lowPrice: (lowestPrice / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-foreground">
          {product.categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-7 lg:py-2">
          <div className="space-y-3">
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {product.brand ?? siteConfig.name} · {product.categoryName}
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
            {product.rating.count > 0 ? (
              <p className="text-sm text-muted-foreground">
                <span aria-hidden="true" className="text-accent">
                  {"★".repeat(Math.round(product.rating.average))}
                </span>{" "}
                {product.rating.average.toFixed(1)} · {product.rating.count}{" "}
                {product.rating.count === 1 ? "review" : "reviews"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
            {product.shortDescription ? (
              <p className="text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>
            ) : null}
          </div>

          <ProductPurchasePanel variants={product.variants} />

          <dl className="grid gap-3 border-t border-border pt-5 text-sm">
            {product.fabric ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Fabric</dt>
                <dd className="text-right">{product.fabric}</dd>
              </div>
            ) : null}
            {product.fit ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Fit</dt>
                <dd className="text-right">{product.fit}</dd>
              </div>
            ) : null}
            {product.occasion ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Occasion</dt>
                <dd className="text-right">{product.occasion}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Price from</dt>
              <dd className="text-right">{formatPrice(lowestPrice)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <ProductStory product={product} related={related} />
      <RecentlyViewedProducts product={recentProduct} />
    </div>
  );
}

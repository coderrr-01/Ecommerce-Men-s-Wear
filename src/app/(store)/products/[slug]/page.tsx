import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ProductPurchasePanel } from "@/features/catalog/components/product-purchase-panel";
import { getProductDetail, getRelatedProducts } from "@/features/catalog/services/catalog.service";
import { siteConfig } from "@/config/site.config";
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
  const inStock = product.variants.some((variant) => variant.stock > 0);
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

      <div className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="font-serif text-2xl tracking-tight">The details</h2>
          <p className="mt-4 text-sm leading-7 whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>
        </section>
        <section className="rounded-md bg-secondary/60 p-6">
          <h2 className="text-xs font-semibold tracking-[0.18em] uppercase">Care & fit notes</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>
              Designed for a {product.fit?.toLowerCase() ?? "regular"} fit. Take your usual size.
            </li>
            <li>Cold machine wash. Dry flat in shade. Warm iron if needed.</li>
            <li>Questions about sizing? Write to {siteConfig.contact.email} and we will help.</li>
          </ul>
        </section>
      </div>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-serif text-2xl tracking-tight">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No reviews yet. Purchases can be reviewed from your account after delivery.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-md border border-border p-5">
                <p aria-label={`${review.rating} out of 5 stars`}>
                  <span aria-hidden="true" className="text-accent">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </p>
                {review.title ? <h3 className="mt-3 font-medium">{review.title}</h3> : null}
                {review.comment ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
                ) : null}
                <p className="mt-4 text-xs text-muted-foreground">
                  {review.author} ·{" "}
                  {review.createdAt.toLocaleDateString(siteConfig.locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-tight">You may also like</h2>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="text-sm underline underline-offset-4 hover:text-accent"
            >
              View all {product.categoryName.toLowerCase()}
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}

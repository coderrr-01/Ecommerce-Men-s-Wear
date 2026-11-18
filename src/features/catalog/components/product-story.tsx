import Link from "next/link";

import { ProductGrid } from "@/features/catalog/components/product-grid";
import type { ProductCardData, ProductDetailData } from "@/features/catalog/types";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { ReviewForm } from "@/features/reviews/components/review-form";
import type { ReviewSubmissionState } from "@/features/reviews/services/review.service";

interface ProductStoryProps {
  product: ProductDetailData;
  related: ProductCardData[];
  reviewState: ReviewSubmissionState;
}

export function ProductStory({ product, related, reviewState }: ProductStoryProps) {
  return (
    <>
      <section className="mt-14 border-t border-border">
        <details open className="border-b border-border py-5">
          <summary className="cursor-pointer list-none font-serif text-2xl tracking-tight [&::-webkit-details-marker]:hidden">
            Product details
          </summary>
          <div className="mt-5 grid gap-8 pb-2 lg:grid-cols-[1.4fr_1fr]">
            <p className="text-sm leading-7 whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
            <dl className="grid h-fit gap-3 text-sm">
              {product.fabric ? (
                <div className="flex justify-between gap-4 border-b border-border/70 pb-3">
                  <dt className="text-muted-foreground">Fabric</dt>
                  <dd className="text-right">{product.fabric}</dd>
                </div>
              ) : null}
              {product.fit ? (
                <div className="flex justify-between gap-4 border-b border-border/70 pb-3">
                  <dt className="text-muted-foreground">Fit</dt>
                  <dd className="text-right">{product.fit}</dd>
                </div>
              ) : null}
              {product.occasion ? (
                <div className="flex justify-between gap-4 border-b border-border/70 pb-3">
                  <dt className="text-muted-foreground">Occasion</dt>
                  <dd className="text-right">{product.occasion}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </details>

        <details className="border-b border-border py-5">
          <summary className="cursor-pointer list-none font-serif text-xl [&::-webkit-details-marker]:hidden">
            Care and fit
          </summary>
          <ul className="mt-4 max-w-2xl space-y-3 pb-2 text-sm leading-6 text-muted-foreground">
            <li>
              Designed for a {product.fit?.toLowerCase() ?? "regular"} fit. Take your usual size.
            </li>
            <li>Cold machine wash. Dry flat in shade. Warm iron if needed.</li>
            <li>
              Questions about sizing? Contact{" "}
              <a
                className="underline underline-offset-4"
                href={`mailto:${siteConfig.contact.email}`}
              >
                {siteConfig.contact.email}
              </a>
              .
            </li>
          </ul>
        </details>

        <details className="border-b border-border py-5">
          <summary className="cursor-pointer list-none font-serif text-xl [&::-webkit-details-marker]:hidden">
            Shipping and returns
          </summary>
          <p className="mt-4 max-w-2xl pb-2 text-sm leading-6 text-muted-foreground">
            Complimentary shipping on orders over{" "}
            {formatPrice(siteConfig.shipping.freeShippingThreshold)}. Returns and exchanges are
            available within {siteConfig.shipping.returnsWindowDays} days.
          </p>
        </details>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-serif text-3xl tracking-tight">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No reviews yet. Purchases can be reviewed from your account after delivery.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review) => (
              <article key={review.id} className="border border-border/70 bg-card p-5">
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
                {review.photos.length ? (
                  <div className="mt-3 flex gap-2">
                    {review.photos.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt="Customer review photo"
                        width={80}
                        height={80}
                        className="size-20 rounded object-cover"
                      />
                    ))}
                  </div>
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
        {reviewState === "ELIGIBLE" ? <ReviewForm productId={product.id} /> : null}
        {reviewState === "SIGN_IN" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link
              href={`/login?redirectTo=${encodeURIComponent(`/products/${product.slug}`)}`}
              className="underline"
            >
              Log in to review
            </Link>{" "}
            after a delivered purchase.
          </p>
        ) : null}
        {reviewState === "NOT_ELIGIBLE" ? (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Only customers who received this product can review it. If you ordered as a guest, claim
            the order from its private order link while signed in to an account with the same mobile
            number.
          </p>
        ) : null}
        {reviewState === "PENDING" ? (
          <p className="mt-4 text-sm text-muted-foreground">Your review is awaiting approval.</p>
        ) : null}
        {reviewState === "APPROVED" ? (
          <p className="mt-4 text-sm text-muted-foreground">Your review is published.</p>
        ) : null}
        {reviewState === "REJECTED" ? (
          <p className="mt-4 text-sm text-muted-foreground">Your review was not published.</p>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl tracking-tight">You may also like</h2>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="text-xs underline underline-offset-4 hover:text-accent"
            >
              View all {product.categoryName.toLowerCase()}
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </>
  );
}

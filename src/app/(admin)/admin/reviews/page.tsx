import { getAdminReviews } from "@/features/reviews/services/review.service";
import { AdminReviewControl } from "@/features/reviews/components/admin-review-control";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  return (
    <section className="space-y-5">
      <header>
        <h1 className="font-serif text-3xl">Reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only approved reviews appear on the storefront.
        </p>
      </header>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="space-y-3 rounded-lg border bg-card p-4">
            <header className="flex flex-wrap justify-between gap-2">
              <h2 className="font-medium">
                {review.product.name} · {review.rating}/5
              </h2>
              <span className="text-xs uppercase">{review.status}</span>
            </header>
            <p className="text-xs text-muted-foreground">
              {review.user.name ?? review.user.email} ·{" "}
              {review.createdAt.toLocaleDateString("en-IN")}
            </p>
            {review.title ? <h3 className="font-medium">{review.title}</h3> : null}
            {review.comment ? (
              <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
            ) : null}
            {review.photos.length ? (
              <div className="flex gap-2">
                {review.photos.map((photo) => (
                  <a
                    key={photo.url}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline"
                  >
                    View photo
                  </a>
                ))}
              </div>
            ) : null}
            <AdminReviewControl id={review.id} status={review.status} />
          </article>
        ))}
        {!reviews.length ? (
          <p className="text-sm text-muted-foreground">No reviews to moderate.</p>
        ) : null}
      </div>
    </section>
  );
}

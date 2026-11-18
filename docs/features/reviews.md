# Product reviews

Only a signed-in customer with a DELIVERED order, a non-null delivery timestamp and a matching
order item may submit one review per product. Guest orders become eligible after the owner claims
them from the token-protected order page using an account phone that matches the order phone. The
existing unique `(productId, userId)` constraint and service eligibility check prevent duplicates.
Ratings are 1-5 stars; title and review text are sanitized plain text. Up to three JPEG, PNG or
WebP photos (5 MB each) use the configured `StorageProvider`.

New reviews have `PENDING` status and do not appear publicly until STAFF/ADMIN approves them.
The owner sees "Awaiting approval" or "Published" on the product page after submission. A signed-out
customer gets a login link, and an ineligible signed-in customer is told the delivery and
signed-in-order requirements. Product cards, detail pages and Product JSON-LD aggregates count only
approved, non-deleted reviews. The JSON-LD `aggregateRating` property is omitted when none are
approved. STAFF/ADMIN moderate reviews at `/admin/reviews`.

Eligibility is scoped to the current user's own order rows, status and product items. The admin
moderation list and mutation remain role-protected; no other customer's review-submission state is
returned to the storefront.

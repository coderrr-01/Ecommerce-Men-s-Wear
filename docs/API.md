# API and actions

## Response envelope

Public handlers and non-form server actions use the shared types in `src/types/api.ts`:

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ApiErrorCode; message: string; details?: unknown } };
```

`ApiErrorCode` values: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_STOCK`, `PROVIDER_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`.

Form actions return state objects such as `{ status: "error", message }` or `{ status: "success", ... }` for `useActionState`.

## HTTP routes

### `GET /api/health`

Checks the database with `SELECT 1`. No authentication.

Healthy response, HTTP 200:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "ok",
    "timestamp": "2026-11-13T10:00:00.000Z"
  }
}
```

Degraded response, HTTP 503:

```json
{
  "success": false,
  "data": {
    "status": "degraded",
    "database": "unavailable",
    "timestamp": "2026-11-13T10:00:00.000Z"
  }
}
```

`Cache-Control: no-store` is always set.

### `/api/auth/[...nextauth]`

Auth.js handler (`GET`/`POST`): sign-in, callback, session, CSRF, sign-out and provider endpoints. Configuration lives in `src/auth.ts`.

## Server actions

### Admin catalog and inventory

Admin server actions use `executeAction`, validate with Zod and return `ApiResponse`. Each action
checks the current database-backed role server-side; the admin layout is not the only boundary.
ADMIN and STAFF may manage categories, products, image metadata/order and inventory. Category,
product and image deletion is ADMIN-only.

| Action                        | Input                                                               | Behaviour                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `createCategoryAction`        | Category fields                                                     | Creates a nested category after slug/parent checks.                                                                         |
| `updateCategoryAction`        | Category fields with `id`                                           | Updates an existing category.                                                                                               |
| `deleteCategoryAction`        | Category ID                                                         | ADMIN-only soft delete; returns `CONFLICT` if products or children remain.                                                  |
| `saveProductAction`           | Product fields and variants                                         | Creates/updates product and variants transactionally; validates size set, slug, SKU, price and stock; records stock deltas. |
| `checkProductSlugAction`      | `slug`, optional `id`                                               | Checks whether a product slug is available.                                                                                 |
| `bulkProductsAction`          | Unique product IDs and `activate`, `deactivate` or `delete`         | Updates product status; delete is ADMIN-only and soft-deletes products/variants.                                            |
| `updateProductImageAltAction` | `productId`, `imageId`, `altText`                                   | Saves image alt text.                                                                                                       |
| `reorderProductImagesAction`  | `productId`, ordered `imageIds`, `primaryImageId`                   | Updates image order and primary image as one transaction.                                                                   |
| `deleteProductImageAction`    | `productId`, `imageId`                                              | ADMIN-only soft delete and Cloudinary removal when the image has a provider ID.                                             |
| `updateVariantStockAction`    | `variantId`, target `stock`, optional `reason`                      | STAFF/ADMIN stock adjustment; writes the signed stock delta in the same transaction.                                        |
| `bulkUpdateStockAction`       | Up to 100 unique `{ variantId, stock }` items and optional `reason` | All-or-nothing transactional update with one audit row per changed variant.                                                 |

Stock targets must be whole numbers from 0 to 1,000,000. No movement is recorded when the target
equals the existing quantity. Products and variants use soft deletion; storefront queries continue
to exclude deleted/draft catalog records.

#### HTTP routes

| Method and path                             | Access      | Contract                                                                                                                                                                       |
| ------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/admin/products/{id}/images`      | STAFF/ADMIN | Multipart field `file`; JPEG/PNG/WebP detected from bytes, 5 MB maximum and eight active images per product. Returns an `ApiResponse` with the created image or a typed error. |
| `GET /api/admin/inventory/export?q=&state=` | STAFF/ADMIN | Downloads a CSV for the current search and `all`, `low` or `out` stock filter. Errors use the standard `ApiResponse` error envelope.                                           |

Image ordering uses native drag-and-drop plus keyboard-operable move controls; no drag/drop
dependency is required. Uploads use the configured `StorageProvider` (Cloudinary in this deployment).

### Authentication — `src/features/auth/actions/auth.actions.ts`

| Action           | Input                                       | Behaviour                                                                                    |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `loginAction`    | email, password, optional safe `redirectTo` | Validates, calls `signIn("credentials")`, redirects to a safe path or returns an error state |
| `registerAction` | name, email, password, confirm password     | Creates a customer, hashes the password, rejects duplicates, then redirects to login         |
| `logoutAction`   | none                                        | Signs out and redirects home                                                                 |

Redirect targets are checked by `isSafeRedirectPath` to prevent open redirects. Authentication errors are intentionally generic.

### Cart — `src/features/cart/actions/cart.actions.ts`

| Action                 | Input                 | Behaviour                                                                                                                                           |
| ---------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addToCartAction`      | `variantId`, quantity | Supports user or HTTP-only guest session; validates 1–10; rejects missing/inactive variants and insufficient stock; merges quantity transactionally |
| `updateCartItemAction` | `itemId`, quantity    | Requires ownership; validates quantity and stock; updates or redirects with an error                                                                |
| `removeCartItemAction` | `itemId`              | Requires ownership; deletes the item and revalidates `/cart`                                                                                        |

Cart actions scope all reads and mutations to the authenticated user or server-managed guest cookie.

### WhatsApp checkout and orders

`placeOrderAction(input)` returns the shared `ApiResponse` envelope:

```ts
{
  fullName: string;
  phone: string;           // 10-digit Indian mobile
  addressLine: string;
  city: string;
  state: string;
  pincode: string;         // 6 digits
  note?: string;
  expectedSubtotal: number; // stale-price check only; never used as order price
  idempotencyKey: string;   // UUID generated for the checkout form
  honeypot: string;         // must be empty
}
```

On success, `data` contains `{ orderNumber, whatsappUrl, successUrl }`. The service re-reads and
validates every cart variant and recomputes paise totals from database prices. A single transaction
creates the pending `WHATSAPP` order and item snapshots, then clears the cart. Stock is not changed
until an admin confirms the order.

An optional `couponCode` is trimmed and normalized. Coupon checks are rate limited and return a
generic invalid-code response; final coupon eligibility, per-customer/global usage and the discount
are rechecked against the database in the serializable order-creation transaction.

The page route `/order/{orderNumber}?token={token}` renders the order confirmation only when both the
human-readable order number and high-entropy token match. There is no lookup by order number alone.
Guest pages include status history and configured tracking details, but never internal admin notes.
Signed-in customers use `/account/orders` and `/account/orders/{orderNumber}`; repository queries
always scope reads to the authenticated `userId`.

`updateOrderStatusAction({ orderId, status })` is ADMIN/STAFF-only and returns
`ApiResponse<{ status }>`; allowed transitions are validated in the service. Confirming
conditionally deducts stock and writes `StockMovement` rows in the same transaction. Cancelling a
confirmed/unshipped order restores stock transactionally. `/admin/orders` supports order-number or
phone search, status filtering and pagination; `/admin/orders/{id}` displays the order and chat
action.

Order creation is limited to five per hour per phone and per available client IP using a
process-local in-memory limiter. Multi-instance production deployments should move this limiter to
a shared database/cache store.

#### Order experience routes and actions

| Method/path                                              | Access                                       | Contract                                                                                                                                   |
| -------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /account/orders`                                    | Signed-in customer                           | Paginated order list for the current user only.                                                                                            |
| `GET /account/orders/{orderNumber}`                      | Owning customer                              | Snapshot items, totals, address, status history and tracking; non-owned orders are 404.                                                    |
| `GET /api/orders/{orderNumber}/invoice`                  | ADMIN/STAFF, owning customer, or token guest | Downloads a PDF after confirmation; guests provide `?token=...`. Non-owned/missing/pending invoices return 404.                            |
| `GET /api/admin/orders/export?status=&dateFrom=&dateTo=` | STAFF/ADMIN                                  | CSV for the selected status and inclusive date range.                                                                                      |
| `saveAdminOrderDetailsAction`                            | STAFF/ADMIN                                  | Saves tracking fields and an internal note; only tracking fields are customer-visible.                                                     |
| `updateOrderStatusAction`                                | STAFF/ADMIN                                  | Validates transition, records a customer-visible sanitized status note/history atomically; compare-and-set prevents duplicate transitions. |

Invoice numbers use the configured annual prefix and a database counter updated in the invoice
transaction. The response is a private, no-store PDF generated with PDFKit on the Node.js runtime.

### Phase 5 Part B: wishlist, coupons, returns, reviews and communications

| Action/route                                                             | Access                      | Behavior                                                                                                                                      |
| ------------------------------------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `mergeWishlistAction(productIds)`                                        | Signed-in customer          | Merges up to 100 active product IDs into the owner's wishlist; database uniqueness removes duplicates.                                        |
| `toggleWishlistAction(productId)` / `clearWishlistAction()`              | Signed-in customer          | Mutates only the current customer's wishlist. Guests continue using the same localStorage adapter/UI.                                         |
| `checkCouponAction({ code, phone? })`                                    | Guest or customer           | Rate-limited preview; invalid, expired, inactive, exhausted and ineligible codes share one response.                                          |
| `saveCouponAction(input)` / `archiveCouponAction(id)`                    | STAFF/ADMIN                 | Create/update or soft-archive percent/fixed-paise coupons and their date/usage limits.                                                        |
| `requestReturnAction(FormData)`                                          | Owning customer             | Requires a delivered order item within `siteConfig.shipping.returnsWindowDays`; accepts optional up to three JPEG/PNG/WebP photos, 5 MB each. |
| `updateReturnRequestAction({ id, action })`                              | STAFF/ADMIN                 | Approve/reject, receive, then close as return/exchange. Stock is restored with a `StockMovement` only on receive.                             |
| `submitReviewAction(FormData)`                                           | Signed-in eligible customer | Requires a delivered order containing the product; one review per user/product, pending moderation, up to three validated photos.             |
| `moderateReviewAction({ id, status })`                                   | STAFF/ADMIN                 | Approve or hide a review. Only approved reviews contribute to catalog aggregates and JSON-LD.                                                 |
| `newsletterSignupAction({ email, honeypot })`                            | Public                      | Validates and rate limits; normalized duplicate emails return the same success response.                                                      |
| `contactFormAction({ name, email, phone?, subject, message, honeypot })` | Public                      | Validates, rate limits and stores plain text; no email-sent claim is shown.                                                                   |
| `GET /api/admin/messages/export?kind=newsletter\|contacts`               | STAFF/ADMIN                 | Downloads injection-safe CSV exports.                                                                                                         |

`/admin/coupons`, `/admin/returns`, `/admin/reviews` and `/admin/messages` are protected by both the
admin layout and role checks in every mutation/export boundary. Customer return reads are scoped to
the current account; review text is sanitized and rendered as text, never raw HTML.

## Not implemented

- Online payment capture and payment webhooks.
- Razorpay webhook handler and signature verification route.
- Public JSON catalogue API (storefront pages query services directly).
- Address CRUD, newsletter delivery campaigns, contact-message email notifications, customer
  management and settings actions.
- Password reset API.

When adding a route, keep the envelope, validate at the boundary, use service functions and never import Prisma from the route.

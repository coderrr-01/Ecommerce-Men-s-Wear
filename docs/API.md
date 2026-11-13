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

| Action | Input | Behaviour |
| --- | --- | --- |
| `createCategoryAction` | Category fields | Creates a nested category after slug/parent checks. |
| `updateCategoryAction` | Category fields with `id` | Updates an existing category. |
| `deleteCategoryAction` | Category ID | ADMIN-only soft delete; returns `CONFLICT` if products or children remain. |
| `saveProductAction` | Product fields and variants | Creates/updates product and variants transactionally; validates size set, slug, SKU, price and stock; records stock deltas. |
| `checkProductSlugAction` | `slug`, optional `id` | Checks whether a product slug is available. |
| `bulkProductsAction` | Unique product IDs and `activate`, `deactivate` or `delete` | Updates product status; delete is ADMIN-only and soft-deletes products/variants. |
| `updateProductImageAltAction` | `productId`, `imageId`, `altText` | Saves image alt text. |
| `reorderProductImagesAction` | `productId`, ordered `imageIds`, `primaryImageId` | Updates image order and primary image as one transaction. |
| `deleteProductImageAction` | `productId`, `imageId` | ADMIN-only soft delete and Cloudinary removal when the image has a provider ID. |
| `updateVariantStockAction` | `variantId`, target `stock`, optional `reason` | STAFF/ADMIN stock adjustment; writes the signed stock delta in the same transaction. |
| `bulkUpdateStockAction` | Up to 100 unique `{ variantId, stock }` items and optional `reason` | All-or-nothing transactional update with one audit row per changed variant. |

Stock targets must be whole numbers from 0 to 1,000,000. No movement is recorded when the target
equals the existing quantity. Products and variants use soft deletion; storefront queries continue
to exclude deleted/draft catalog records.

#### HTTP routes

| Method and path | Access | Contract |
| --- | --- | --- |
| `POST /api/admin/products/{id}/images` | STAFF/ADMIN | Multipart field `file`; JPEG/PNG/WebP detected from bytes, 5 MB maximum and eight active images per product. Returns an `ApiResponse` with the created image or a typed error. |
| `GET /api/admin/inventory/export?q=&state=` | STAFF/ADMIN | Downloads a CSV for the current search and `all`, `low` or `out` stock filter. Errors use the standard `ApiResponse` error envelope. |

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

| Action                 | Input                 | Behaviour                                                                                                                                                  |
| ---------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addToCartAction`      | `variantId`, quantity | Requires a signed-in user; validates 1–10; rejects missing/inactive variants and insufficient stock; merges quantity transactionally; redirects to `/cart` |
| `updateCartItemAction` | `itemId`, quantity    | Requires ownership; validates quantity and stock; updates or redirects with an error                                                                       |
| `removeCartItemAction` | `itemId`              | Requires ownership; deletes the item and revalidates `/cart`                                                                                               |

All cart actions revalidate `/cart` and redirect unauthenticated users to `/login?redirectTo=/cart`.

## Not implemented

- Checkout/order placement endpoint or action.
- Razorpay webhook handler and signature verification route.
- Public JSON catalogue API (storefront pages query services directly).
- Address, wishlist, review, coupon, order management, customer management and settings actions.
- Password reset API.

When adding a route, keep the envelope, validate at the boundary, use service functions and never import Prisma from the route.

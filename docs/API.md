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
- Address, wishlist, review, coupon and admin CRUD actions.
- Password reset API.

When adding a route, keep the envelope, validate at the boundary, use service functions and never import Prisma from the route.

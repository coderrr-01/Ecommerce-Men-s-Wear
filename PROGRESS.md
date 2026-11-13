# Progress

Last updated: 2026-11-13

## Status

Foundation and Phase 2 admin catalog management are implemented. Storefront browsing,
authentication and signed-in cart flows are in place. Checkout remains intentionally disabled.

## Completed

| Area            | State             | Notes                                                                            |
| --------------- | ----------------- | -------------------------------------------------------------------------------- |
| Project tooling | Done              | Next 16.4, TS strict, Tailwind v4, ESLint, Prettier, Vitest, pnpm approvals      |
| Config/env      | Done              | Zod env validation; brand, copy, contact, commerce and seed defaults centralised |
| Database schema | Done              | 18 models, enums, indexes, soft deletes, generated migrations                    |
| Seed            | Done              | 5 categories, 15 products, users, coupons, banner, settings; production guard    |
| Auth            | Done              | Credentials, register, logout, JWT roles, DB-backed guards, proxy                |
| UI shell        | Done              | Primitives, header/footer, account/admin layouts, policy pages                   |
| Storefront UI   | Done              | Premium responsive redesign, semantic theme tokens, editorial typography        |
| Catalogue       | Done              | Home, shop filters/sort/pagination, product detail                               |
| Cart            | Done (signed-in)  | Transactional merges, stock checks, totals, header count                         |
| Admin dashboard | Done              | Product/status/variant/stock/customer/order metrics; top-ten low-stock links     |
| Admin catalog   | Done              | Category, product, variant and Cloudinary image management; server role guards    |
| Inventory       | Done              | Filtered stock list, transactional adjustments, audit records and CSV export      |
| Health          | Done              | DB check, 200/503                                                                |
| Providers       | Done (interfaces) | Mock/Razorpay, Cloudinary, console/Resend, console SMS                           |
| Tests           | Done              | 8 files, 40 passing unit tests                                                   |
| Quality gates   | Done              | lint, typecheck, 40 unit tests and production build pass                          |
| Dev overlay     | Verified          | Fresh product-page load has no LCP or unused-preload warnings                    |
| Documentation   | Done              | Includes storefront design system, progress, and dated changelog                 |

## Verification

Verified locally:

```text
pnpm lint       -> pass
pnpm typecheck  -> pass
pnpm test       -> 8 files, 40 tests pass
pnpm build      -> pass
```

Storefront UI browser checks: `/`, `/shop`, `/products/classic-oxford-shirt`, `/login`,
`/register`, `/cart` and `/account` were checked at 360, 768, 1024 and 1440px with no horizontal
overflow. Mobile menu/search, filters, cart drawer, password visibility, product image zoom and
size-guide dialog were exercised. A fresh product-page load has no LCP or unused-preload warnings.

Database/admin verification:

- The `20261113114155_admin_catalog_stock_movements` migration was applied to PostgreSQL and
  `prisma migrate status` reported the schema up to date.
- Created and deleted a temporary category; confirmed deletion is blocked for a category with
  products.
- Created an active product with three variants through the admin UI, edited it, uploaded two
  Cloudinary images, updated image alt/primary/order metadata, and deleted both remote images.
- Verified prices persisted as 199900/249900 paise, soft-deleted the product and confirmed its
  storefront route returns 404. Temporary test images and category were removed.
- Inline and bulk inventory changes each wrote signed `StockMovement` rows attributed to ADMIN;
  the seeded variant was restored to stock 15.
- Logged-out admin navigation redirected to sign-in; CUSTOMER navigation was denied. The image
  upload route returned 401 for logged-out and 403 for CUSTOMER. Server actions and routes invoke
  `requireRole`; the role helper unit tests pass. A direct server-action replay was redirected by
  the proxy before its typed response body could be inspected.

Not verified yet:

- A typed response body for replayed server actions under CUSTOMER and logged-out sessions.

Storefront UI gaps: newsletter enrollment, wishlist persistence, alternate product-card imagery and
quick-add are not backed by existing contracts. The cart drawer remains a count/route summary,
exact product measurements are unavailable, and checkout remains disabled.

## Known issues and risks

- Checkout is disabled; there is no order placement, stock decrement transaction, tax/coupon calculation or payment webhook.
- The initial migration is committed; the admin migration was applied locally. Production migration
  deployment still requires the release procedure and a database backup.
- Store pages are dynamic because the header reads session/cart; this is correct but limits static caching.
- Proxy redirects are optimistic; authorization must always be re-checked in layouts/actions.
- Soft deletes are not automatic in Prisma queries.
- Tests cover pure logic only; no integration tests yet.
- Browser extensions that modify the DOM can create React hydration warnings in development; verify with a clean profile before treating them as application bugs.

## Next milestones

### P0 — Checkout and payments

1. Address selection/creation.
2. Server-side re-pricing, coupon, tax and shipping calculation.
3. Transactional order creation plus conditional stock decrement.
4. Razorpay order creation and verified, idempotent webhook.
5. Confirmation page and email; account/admin order views.

### P1 — Account completeness

1. Address CRUD.
2. Wishlist toggle and page.
3. Review submission tied to delivered orders; moderation queue.
4. Password reset with expiring single-use tokens.
5. Profile editing.

### P1 — Admin operations

1. Order status transitions, cancellation and refunds.
2. Coupon, banner, review and settings management.
3. Customer management, roles and deactivation.

### P2 — Hardening

1. Integration/e2e tests with a disposable PostgreSQL database.
2. Rate limiting for auth and payment endpoints.
3. Structured request IDs and error reporting.
4. CSP/security headers, audit logging and backup/retention runbook.
5. Search improvements and faceted filters.

## Definition of done for checkout and payments

- Database-backed integration tests pass in CI.
- Happy-path checkout works with mock payments and cannot oversell under concurrency.
- Webhook replay is idempotent.
- Order history is visible to customers and admins.
- Existing lint/typecheck/unit/build gates remain green.

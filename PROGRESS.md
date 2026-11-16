# Progress

Last updated: 2026-11-16

## Status

Foundation, Phase 2 admin catalog management and the Diamond Selection storefront refresh are
implemented. Storefront browsing, guest wishlist/recent history and signed-in cart flows are in
place. Checkout remains intentionally disabled.

## Completed

| Area            | State             | Notes                                                                             |
| --------------- | ----------------- | --------------------------------------------------------------------------------- |
| Project tooling | Done              | Next 16.4, TS strict, Tailwind v4, ESLint, Prettier, Vitest, pnpm approvals       |
| Config/env      | Done              | Zod env validation; brand, copy, contact, commerce and seed defaults centralised  |
| Database schema | Done              | 18 models, enums, indexes, soft deletes, generated migrations                     |
| Seed            | Done              | 13 categories, 30 products, users, coupons, banner, settings; production guard    |
| Auth            | Done              | Credentials, register, logout, JWT roles, DB-backed guards, proxy                 |
| UI shell        | Done              | Primitives, header/footer, account/admin layouts, policy pages                    |
| Storefront UI   | Done              | Diamond Selection brand, responsive shell, motion, PWA metadata and utilities     |
| Catalogue       | Done              | Home, search suggestions, filters, quick view, gallery and local recent strip     |
| Cart            | Done (signed-in)  | Transactional merges, stock checks, line-item drawer and totals                   |
| Admin dashboard | Done              | Product/status/variant/stock/customer/order metrics; top-ten low-stock links      |
| Admin catalog   | Done              | Category, product, variant and Cloudinary image management; server role guards    |
| Inventory       | Done              | Filtered stock list, transactional adjustments, audit records and CSV export      |
| Health          | Done              | DB check, 200/503                                                                 |
| Providers       | Done (interfaces) | Mock/Razorpay, Cloudinary, console/Resend, console SMS                            |
| Tests           | Done              | 12 files, 48 passing unit tests                                                   |
| Quality gates   | Done              | lint, typecheck, 48 unit tests and production build pass                          |
| Browser checks  | Partial           | Home, shop, product, wishlist and mobile overlays checked; see verification notes |
| Documentation   | Done              | Includes interaction guide, updated design system, progress and changelog         |

## Verification

Intro preloader changes:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (12 files, 48 tests) and `pnpm build` pass.
- Browser verification passed at 1440px and 390px for `?intro=1`, reduced-motion fade, repeat-visit
  skip, non-home route exclusion, full-viewport overlay sizing, no horizontal overflow and scroll
  cleanup. The slowed 4.5-second sequence was inspected in production at 1440px and 390px; the
  center line was transparent by the wordmark reveal. The intro had no console errors. During
  reduced-motion navigation, the existing `HomeHero` motion elements produced a hydration warning;
  this is outside the intro-only scope.
- No database reset or database verification was performed; this UI change does not alter data.

Verified locally:

```text
pnpm lint       -> pass
pnpm typecheck  -> pass
pnpm test       -> 12 files, 48 tests pass
pnpm build      -> pass
```

Browser checks on 2026-11-16:

- `/`, `/shop` and `/products/classic-oxford-shirt` showed no horizontal overflow at 360, 390,
  768, 1024 and 1440px.
- On mobile, the full-screen category menu and search suggestions opened and worked. Size guide,
  product image zoom and cart drawer opened and closed with Escape. `/wishlist` rendered its guest
  empty state without a runtime overlay.
- `/manifest.webmanifest` and `/icon` returned HTTP 200; the manifest identifies Diamond Selection.
- After final motion and image-loading fixes, the home carousel advanced through all slides and the
  shop wishlist toggle worked without a runtime overlay or console warning. The product route
  rendered, but product content still comes from legacy database records.
- Account/auth pages and other cart/wishlist states were not checked. The connected development
  database still serves legacy product records, so this is not verification of the new
  seed.

Historical database/admin verification (2026-11-13):

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

Not verified for the current storefront change:

- The new seed catalog against PostgreSQL. `pnpm db:reset` has not been run; run it only against a
  disposable development database.
- Account/auth browser behavior, complete cart flows and the new seed against PostgreSQL. No real
  database reset or live-seed verification was performed.

Storefront constraints: newsletter enrollment is disabled; guest wishlist/recent history are local
to the browser; quick view cannot select variants or add directly because the listing DTO lacks
variant data; price filtering is current-page-only and colour filtering is unavailable. Exact
garment measurements and checkout/order workflows are not implemented.

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
2. Account-synchronized wishlist.
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

# Progress

Last updated: 2026-11-13

## Status

Foundation complete. Storefront browsing and authentication work end to end; cart works for signed-in users. Checkout and admin CRUD are intentionally not enabled.

## Completed

| Area            | State             | Notes                                                                         |
| --------------- | ----------------- | ----------------------------------------------------------------------------- |
| Project tooling | Done              | Next 16.4, TS strict, Tailwind v4, ESLint, Prettier, Vitest, pnpm approvals   |
| Config/env      | Done              | Zod env validation, central site/theme/navigation config                      |
| Database schema | Done              | 17 models, enums, indexes, soft deletes, initial migration SQL                |
| Seed            | Done              | 5 categories, 15 products, users, coupons, banner, settings; production guard |
| Auth            | Done              | Credentials, register, logout, JWT roles, DB-backed guards, proxy             |
| UI shell        | Done              | Primitives, header/footer, account/admin layouts, policy pages                |
| Catalogue       | Done              | Home, shop filters/sort/pagination, product detail                            |
| Cart            | Done (signed-in)  | Transactional merges, stock checks, totals, header count                      |
| Admin dashboard | Done (read-only)  | Product/order/customer/low-stock metrics                                      |
| Health          | Done              | DB check, 200/503                                                             |
| Providers       | Done (interfaces) | Mock/Razorpay, Cloudinary, console/Resend, console SMS                        |
| Tests           | Done              | 5 files, 27 passing unit tests                                                |
| Quality gates   | Passing           | lint, typecheck, test, build                                                  |
| Documentation   | Done              | README, setup, architecture, DB, API, features, ADRs, changelog, agent guide  |

## Verification

Verified locally:

```text
pnpm lint       -> pass
pnpm typecheck  -> pass
pnpm test       -> 5 files, 27 tests pass
pnpm build      -> pass (Next.js 16.4.6, Turbopack)
```

Not verified locally:

- `pnpm db:migrate` and `pnpm db:seed` (no PostgreSQL server available).
- Runtime pages with real data, auth login, add-to-cart and admin metrics against a live database.
- Provider calls to Razorpay, Cloudinary or Resend (no credentials).

## Known issues and risks

- Checkout is disabled; there is no order placement, stock decrement transaction, tax/coupon calculation or payment webhook.
- The initial migration is offline-generated. Apply it to a disposable PostgreSQL instance before release and run the seed.
- Store pages are dynamic because the header reads session/cart; this is correct but limits static caching.
- Proxy redirects are optimistic; authorization must always be re-checked in layouts/actions.
- Soft deletes are not automatic in Prisma queries.
- Tests cover pure logic only; no integration tests yet.

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

1. Product/category/variant CRUD with Cloudinary uploads.
2. Inventory adjustments and audit trail.
3. Order status transitions, cancellation and refunds.
4. Coupon, banner, review and settings management.
5. Customer roles and deactivation.

### P2 — Hardening

1. Integration/e2e tests with a disposable PostgreSQL database.
2. Rate limiting for auth and payment endpoints.
3. Structured request IDs and error reporting.
4. CSP/security headers, audit logging and backup/retention runbook.
5. Search improvements and faceted filters.

## Definition of done for the next milestone

- Database-backed integration tests pass in CI.
- Happy-path checkout works with mock payments and cannot oversell under concurrency.
- Webhook replay is idempotent.
- Order history is visible to customers and admins.
- Existing lint/typecheck/unit/build gates remain green.

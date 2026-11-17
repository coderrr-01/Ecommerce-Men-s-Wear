# Progress

Last updated: 2026-11-17

## Status

Foundation, Phase 2 admin catalog management and the Diamond Selection storefront refresh are
implemented. WhatsApp checkout, admin fulfilment and Phase 5 Part A customer order experience are
implemented in code; see the verification notes below before production use.

## Completed

| Area             | State                | Notes                                                                              |
| ---------------- | -------------------- | ---------------------------------------------------------------------------------- |
| Project tooling  | Done                 | Next 16.4, TS strict, Tailwind v4, ESLint, Prettier, Vitest, pnpm approvals        |
| Config/env       | Done                 | Zod env validation; brand, copy, contact, commerce and seed defaults centralised   |
| Database schema  | Implemented (verify) | 21 models; Phase 5 Part A migration still needs interactive generation             |
| Seed             | Done                 | 13 categories, 30 products, users, coupons, banner, settings; production guard     |
| Auth             | Done                 | Credentials, register, logout, JWT roles, DB-backed guards, proxy                  |
| UI shell         | Done                 | Primitives, header/footer, account/admin layouts, policy pages                     |
| Storefront UI    | Done                 | Diamond Selection brand, responsive shell, motion, PWA metadata and utilities      |
| Catalogue        | Done                 | Home, search suggestions, filters, quick view, gallery and local recent strip      |
| Cart             | Done                 | Signed-in and cookie-backed guest carts, transactional merges and stock checks     |
| WhatsApp orders  | Implemented (verify) | Guest checkout, order snapshots, token lookup, admin fulfilment and stock audit    |
| Order experience | Implemented (verify) | Customer history, status history, tracking, admin notes/CSV and protected invoices |
| Admin dashboard  | Done                 | Product/status/variant/stock/customer/order metrics; top-ten low-stock links       |
| Admin catalog    | Done                 | Category, product, variant and Cloudinary image management; server role guards     |
| Inventory        | Done                 | Filtered stock list, transactional adjustments, audit records and CSV export       |
| Health           | Done                 | DB check, 200/503                                                                  |
| Providers        | Done (interfaces)    | Mock/Razorpay, Cloudinary, console/Resend, console SMS                             |
| Tests            | Done                 | 18 files, 72 passing unit tests                                                    |
| Quality gates    | Done                 | lint, typecheck, unit tests and production build pass                              |
| Browser checks   | Partial              | Storefront checks are historical; Phase 5 order pages await migration/app testing  |
| Documentation    | Done                 | Feature, API, database, architecture and deployment notes updated                  |

## Phase 5 Part A — Order experience (2026-11-17)

- Added `/account/orders` and owned order details with order snapshots, totals, delivery address,
  tracking data and a status timeline. Guest token order pages share the timeline and tracking
  presentation; customer-facing queries do not select internal admin notes.
- Every new order and status transition records `OrderStatusHistory` in the same transaction as the
  order/status write. Admin-only notes use a separate table. Tracking is validated as HTTPS.
- Added date/status-filtered admin order CSV and WhatsApp messages for confirmation, shipment with
  tracking, and delivery.
- Added authorized invoice PDFs for staff/admin, owning customers and token-authorized guests after
  confirmation. A per-year counter row and unique invoice-number field are updated in the same
  transaction; retries reuse the order's assigned number and roll back unassigned counters.
- Added PDFKit and bundled OFL Noto fonts for Latin, Devanagari, Gujarati and rupee glyphs. PDFKit
  is externalized for the Node.js route; Next output tracing includes the font files.
- The Phase 5 schema migration has not been generated/applied. `pnpm prisma migrate dev
--name phase5_order_experience` reached local PostgreSQL but Prisma refused because this command
  session is non-interactive; no migration SQL was written. Generate it in an interactive
  development terminal and review for additive changes only.
- Local PDF generation and lint/typecheck/test/build results are recorded after validation. Vercel
  runtime behavior requires a deployment to verify.
- Configure the invoice prefix, legal name/address and GSTIN/PAN before issuing production invoices.

### Phase 5 Part A verification (2026-11-17)

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (18 files, 72 tests) and `pnpm build` pass.
- `pnpm exec prisma validate` passes. PostgreSQL is reachable and `prisma migrate status`
  recognizes three existing migrations as applied. The Phase 5 Part A migration is not generated
  because this command environment is non-interactive; no order-experience schema changes have
  been applied or exercised in the database.
- A local 35-item invoice PDF was generated and read back from a temporary file. The PDF has
  multiple pages and ToUnicode maps; the rendering test checked invoice/order text, formatted
  rupee amounts, amount-in-words, Hindi/Gujarati font runs and item details. Next's production
  trace includes all bundled font/license assets.
- Browser verification of account orders, guest timelines, admin upgrades and invoice downloads
  remains blocked until the interactive schema migration is generated/applied. Vercel runtime
  behavior also needs post-deploy verification.

## Verification

WhatsApp checkout (2026-11-17):

- Guest product add-to-cart persisted in the browser; `/cart` displayed the item and checkout
  navigated to `/checkout` with delivery form and order summary. This used the existing local
  database/catalog; no order was submitted.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (15 files, 62 tests) and `pnpm build` pass.
- `prisma migrate status` connected to local PostgreSQL and found the existing schema up to date.
  `prisma migrate dev --name whatsapp_checkout` could not run in this non-interactive command
  session; it generated no migration. The owner will run it interactively in VS Code. No order or
  stock workflow has been verified against the database.
- The configured shop WhatsApp number is a placeholder, so the order action is intentionally
  blocked until the number is replaced in `src/config/site.config.ts`.
- After this historical verification, the owner ran and applied
  `20261117063053_whatsapp_checkout` and successfully regenerated Prisma Client after stopping the
  project dev server. The Phase 5 Part A migration remains separate and pending interactive
  `migrate dev`.

Intro preloader changes:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (12 files, 48 tests) and `pnpm build` pass.
- Browser verification passed at 1440px and 390px for automatic direct-home playback, reduced-motion
  fade, repeat-visit playback, non-home route exclusion, full-viewport overlay sizing, no horizontal overflow and scroll
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
garment measurements and online-payment workflows are not implemented.

## Known issues and risks

- The order-schema migration, live order creation, admin stock lifecycle and production release
  have not yet been verified. Tax/coupons, payment capture/webhooks, refunds and account order
  history remain out of scope.
- The initial migration is committed; the admin migration was applied locally. Production migration
  deployment still requires the release procedure and a database backup.
- Store pages are dynamic because the header reads session/cart; this is correct but limits static caching.
- Proxy redirects are optimistic; authorization must always be re-checked in layouts/actions.
- Soft deletes are not automatic in Prisma queries.
- Tests cover pure logic only; no integration tests yet.
- Browser extensions that modify the DOM can create React hydration warnings in development; verify with a clean profile before treating them as application bugs.

## Next milestones

### P0 — WhatsApp checkout release verification

1. Generate/apply the additive `whatsapp_checkout` migration interactively on the development DB.
2. Configure WhatsApp/canonical URL/shipping fields, submit a guest order, validate its URL and
   message, and verify the cart clears.
3. Confirm and cancel through admin; verify stock and `StockMovement` changes and role boundaries.
4. Run all quality gates; apply the committed migration in production after backup/release approval.

### P1 — Online payments

1. Add server-side payment initiation behind the existing `PaymentProvider`.
2. Add verified, idempotent Razorpay webhooks and refund workflows.
3. Add tax/coupon rules and customer order history as separate reviewed changes.

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

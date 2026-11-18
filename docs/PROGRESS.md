# Implementation progress

Last updated: 2026-11-18

## Status

Phase 2 Admin Catalog Management, the Diamond Selection storefront refresh, WhatsApp checkout,
Phase 5 Part A, and Phase 5 Part B are implemented in code. The Part A and Part B migrations have
been generated with Prisma and applied to the configured local PostgreSQL database.

## Phase 6 Part C1 security hardening (2026-11-18)

- Added report-only-by-default nonce CSP, response security headers, CSP reports, safe error
  boundaries, and strengthened structured log masking.
- Added atomic PostgreSQL rate-limit buckets for login, registration, orders, coupon checks,
  communications, reviews, returns, password reset and image uploads. Public flows fail open on
  limiter storage errors; login/reset fail closed.
- Added generic throttled login behavior, 10-character password checks, administrator/staff
  eight-hour token expiry, session-version revocation, password-reset request/consume flows and
  forced password-change support.
- Added audit records for catalog/product/image/stock/order/coupon changes, destructive action
  checks, and `pnpm admin:create -- <email> <password> <name> [--disable-demo]`.
- Migration `20261118070548_phase6_security_hardening` was generated using Prisma and applied to the
  configured local PostgreSQL database. A second `pnpm db:generate` completed after an initial
  Windows DLL rename lock.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` pass (20 files, 83 tests). An
  earlier default 20-worker test run once timed out the existing PDF test; subsequent standard runs
  passed.
- `pnpm audit` reports two high and one moderate transitive findings (details and rationale in
  `docs/features/security.md`); no safe fix was applied.
- Local HTTP smoke checks confirmed CSP report-only and enforce headers, standard security headers,
  auth/home responses and a 204 report endpoint response. No authenticated browser workflow was
  exercised.
- **Not yet verified:** Vercel serverless behavior, real provider email delivery, exhaustive Zod
  schema review, and interactive browser behavior. Role-change auditing is not applicable yet
  because no user-role management action exists.

## Phase 5 Part B (2026-11-17)

- Added signed-in wishlist persistence and idempotent guest localStorage merge through the existing
  wishlist context and UI.
- Added admin coupon management, rate-limited checkout coupon previews and race-safe server-side
  coupon usage/discount creation within the order transaction. Saved discounts flow into orders,
  WhatsApp messages and invoices.
- Added customer return/exchange requests with the configured delivery-based window and up to three
  StorageProvider photos. Staff can approve/reject, record item receipt and close as returned or
  exchanged; stock is restored with a `StockMovement` only on receipt.
- Added delivered-purchase-only, one-per-customer/product reviews with moderation and optional
  StorageProvider photos. Product ratings and Product JSON-LD aggregates use approved reviews only.
- Added newsletter/contact storage with validation, honeypots and process-local IP rate limits.
  Admin can list/export; contact success explicitly confirms storage, not email delivery.
- Added the generated additive migration `20261117122300_phase5_part_b`. PostgreSQL is reachable
  and Prisma applied the migration locally. Browser flows and external storage uploads were not
  exercised in this task.
- Focused rules tests cover coupon eligibility/discounts, return windows and review eligibility/
  sanitization.
- Final verification: `pnpm lint`, `pnpm typecheck`, `pnpm test` (19 files, 77 tests) and
  `pnpm build` pass. `pnpm prisma migrate status` reports the local PostgreSQL schema up to date
  with all five migrations applied. Only migration status was checked against PostgreSQL; feature
  workflows and browser flows remain unverified.

## Coupon and review fixes (2026-11-18)

- Coupon failures now distinguish unknown codes (generic) from actionable rule failures and log
  only reason codes. Admin values are explicitly labeled percent/paise and date-time fields are
  converted to UTC instants.
- Product detail shows login, eligibility, pending, published and rejected review states.
  Eligibility is scoped to the signed-in user's delivered order and matching item; guest orders
  cannot currently be claimed and that restriction is explained in the UI.
- Real PostgreSQL coupon test: saved a valid UTC 10% coupon (starts yesterday, expires next year,
  zero minimum, no limits) and applied lowercased, space-padded input to a populated signed-in
  cart. Subtotal 219700 paise, discount 21970, total 197730 paise. The temporary row was removed.
- Real PostgreSQL review check: two signed-in delivered orders with product items were found, and
  the eligibility service returned `ELIGIBLE` for a qualifying order.
- Authenticated browser review submission and moderation action were not exercised. Final
  verification results are recorded below.
- Running-app HTTP checks: product detail returned 200 with the Reviews section/login state;
  checkout returned 200 with a temporary cart and rendered coupon/apply controls, then the cart was
  removed. The admin review route redirected unauthenticated access. A temporary review was listed,
  approved through the moderation service, verified in the approved aggregate, and deleted. The
  authenticated browser action was not exercised.
- Final gates pass: `pnpm lint`, `pnpm typecheck`, `pnpm test` (19 files, 79 tests) and
  `pnpm build`. `pnpm prisma migrate status` reports five applied migrations and an up-to-date
  local PostgreSQL schema.

## Phase 5 Part A order experience (2026-11-17)

- Customer order list and owned order details are available at `/account/orders`; guest token order
  pages show the same status timeline. Customer data access is scoped to the signed-in user or the
  unguessable guest token.
- `OrderStatusHistory` is written atomically on order creation and every allowed status transition.
  Separate admin-only notes are excluded from customer and guest query selections.
- Staff/admin can set tracking details, add private notes, export orders by date/status and open
  status-specific customer WhatsApp messages.
- Confirmed-or-later invoices are downloadable by staff/admin, the owning customer or a guest with a
  valid order token. Annual invoice allocation uses a transactional counter and unique invoice
  number. Existing orders without history show inferred progress without fabricated event dates.
- PDFKit is used on the Node.js runtime with traced OFL Noto font assets for rupee, Hindi and
  Gujarati text. Vercel runtime behavior still needs post-deploy verification.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (18 files, 72 tests) and `pnpm build` pass. The PDF
  test generated/read a local 35-item multi-page document and checked amount, rupee and Indian
  script output paths. The production trace includes all font/license assets.
- PostgreSQL is reachable and the Phase 5 Part A migration is now applied locally. Order-page/
  invoice workflows have not been browser-tested in this task; Vercel runtime remains unverified.

## WhatsApp checkout and orders (2026-11-17)

- Added guest cart ownership via an HTTP-only session cookie without changing authentication.
- Added `/checkout`, server-side active product/variant/stock and price validation, atomic order/item
  snapshots and cart clearing, a unique human-readable order number, retry-safe idempotency and a
  token-protected guest confirmation route.
- Added compact/capped WhatsApp message generation, order summary and copy fallback. WhatsApp
  launches only from an explicit link.
- Added searchable/status-filtered/paginated admin orders and transactionally guarded fulfilment:
  conditional stock decrement and movement on confirm, stock restoration on eligible cancel.
- Dashboard order and pending counts already use live database counts.
- Added unit coverage for message encoding/length, DB-price repricing, totals, order number,
  transitions and stock commit/restoration.
- No dependencies added. Payment provider and auth implementation were not changed.

### Verification and blockers

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (15 files, 62 tests) and `pnpm build` pass.
- Guest product add-to-cart, cart persistence and checkout page/summary were exercised in the
  running browser. No order was placed because the configured WhatsApp number is the all-zero
  placeholder. The owner later generated/applied `20261117063053_whatsapp_checkout` interactively
  and regenerated Prisma Client after stopping the project dev server.
- The Phase 5 Part A migration was generated and applied after the initial implementation summary.
- No order creation, success-link verification, admin confirmation/cancellation, stock movement,
  or production migration was verified against the real database yet.

## Admin scope delivered

- Shared admin shell and `requireRole` boundaries. ADMIN and STAFF can manage categories,
  products, variants, images and inventory; destructive catalog/image operations are ADMIN-only.
- Category tree CRUD with slug checks and deletion protection when products or children exist.
- Product and variant editing with size-set validation, integer-paise pricing, stock history and
  soft deletion.
- Cloudinary image upload via a guarded route: JPEG/PNG/WebP, 5 MB per file and at most eight
  active images per product. Alt text, primary selection, ordering and delete controls are present.
- Inventory search/filtering, pagination, inline and bulk stock changes, CSV export and transactional
  `StockMovement` records.
- Dashboard counts for total/active/draft products, variants, low/out-of-stock variants, customers
  and orders, plus the ten lowest in-stock variants.

## Historical verification (2026-11-13)

| Check                                    | Result                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                              | Pass                                                                                                                            |
| `pnpm typecheck`                         | Pass                                                                                                                            |
| `pnpm test`                              | Pass — 8 files, 40 tests                                                                                                        |
| `pnpm build`                             | Pass                                                                                                                            |
| PostgreSQL migration                     | `20261113114155_admin_catalog_stock_movements` applied; migration status up to date                                             |
| Admin browser/responsive checks          | Pass — inventory checked at 360, 768, 1024 and 1440 px                                                                          |
| Category/product/variant CRUD on live DB | Pass — category and active 3-variant product created, edited and soft-deleted                                                   |
| Image uploads and Cloudinary deletion    | Pass — uploaded two PNGs, updated alt/primary/order, then deleted both                                                          |
| Inventory and audit history              | Pass — inline and bulk updates recorded signed deltas; seeded stock restored to 15                                              |
| Storefront visibility                    | Pass — product loaded while active and returned 404 after soft deletion                                                         |
| Customer/logged-out access               | Pass — admin navigation redirected/denied; image API returned 401/403                                                           |
| Server-action authorization              | Guards are present and role helper tests pass; direct browser replay was redirected before its response body could be inspected |

Previous storefront responsive and interaction checks cover the pre-refresh UI only.

## Diamond Selection storefront update (2026-11-16)

- Added the config-driven Diamond Selection identity, central motion presets, responsive header,
  category menus, mobile navigation, editorial home sections and localStorage guest wishlist.
- Added catalog quick view, debounced category/recent-search suggestions, page-local price control,
  product gallery crossfade/zoom controls, server-backed cart drawer, recently viewed strip, size
  suggestion helper, WhatsApp/back-to-top controls and PWA metadata.
- Replaced the demo catalog with 13 categories (10 top-level and 3 Winter Wear children) and 30
  products; added tests for category relationships, product counts and sizes.
- Current checks: `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (12 files, 48 tests).
- Browser verification: `/`, `/shop` and a product page had no horizontal overflow at 360, 390,
  768, 1024 and 1440px. Mobile menu/search, product size-guide/image-zoom Escape behavior, cart
  drawer Escape behavior, wishlist empty state, and HTTP 200 manifest/icon routes were checked.
- `pnpm build` passes. Account/auth pages, full cart flows and the new seed against PostgreSQL
  remain unverified. The requested `pnpm db:reset` has not been run; use it only against a
  disposable dev database.
- After the final fixes, the home carousel advanced through all slides and the shop wishlist toggle
  worked without Motion runtime or LCP warnings. The product route rendered using legacy database
  content, not the new demo seed.

## Home intro preloader (2026-11-16)

- Added an optional intro overlay mounted in the store layout; it plays automatically on each `/`
  visit and does not rely on query parameters or localStorage.
- The overlay waits at most three seconds for intro assets, respects reduced motion, uses configured
  theme variables and always removes the scroll lock on normal completion or unmount. The sequence
  now runs about 4.5 seconds with a slower letter/card stagger; the seed line fades before the
  wordmark reveal.
- Verification: `pnpm lint`, `pnpm typecheck`, `pnpm test` (12 files, 48 tests) and `pnpm build`
  pass. Browser checks passed at 1440px/390px, reduced motion, direct-home playback on repeat visits
  and excluded routes; the wordmark hierarchy and seed-line fade were verified at both widths, the
  overlay covered the 390px viewport without horizontal overflow and scroll-lock classes were
  cleaned. Reduced-motion navigation exposed an existing `HomeHero` Motion hydration warning,
  outside this intro-only scope. No database changes or DB verification.

## Known gaps

- Payment capture/webhooks, refunds and customer/settings management are not implemented.
- WhatsApp order placement is implemented; inventory is deliberately not reserved until admin
  confirmation. Payment capture and webhooks remain disabled.
- The denied server-action replay returned a browser redirect response; its typed error body was not
  independently inspected. Each mutation still invokes `requireRole` server-side.
- Production migration deployment still requires the release procedure and a database backup.
- Newsletter and contact submissions are now stored, but email campaigns/contact notifications are
  not sent. Guest wishlist IDs merge into the account on login; recently viewed stays local. Quick
  view cannot select variants or add directly because listing DTOs lack variant data, price
  filtering is current-page-only, and colour filters are unavailable.
- Exact garment measurements, online payment, order email and account order history are not
  implemented.

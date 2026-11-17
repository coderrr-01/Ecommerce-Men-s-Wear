# Implementation progress

Last updated: 2026-11-17

## Status

Phase 2 Admin Catalog Management and the Diamond Selection storefront refresh are implemented.
WhatsApp order requests, guest cart sessions and admin fulfilment UI are implemented in code;
the WhatsApp checkout migration has since been applied locally. Phase 5 Part A adds customer order
history, tracking, status history and invoices; see its verification status below.

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
- PostgreSQL is reachable with three prior migrations applied. No Phase 5 migration was generated
  in this non-interactive environment, so order pages/actions/invoice downloads have not been
  exercised against PostgreSQL or in the browser. Vercel runtime also remains unverified.
- Migration blocker: `pnpm prisma migrate dev --name phase5_order_experience` connected to the
  development PostgreSQL database but was refused because this execution environment is
  non-interactive. It generated no migration. Run it in an interactive development terminal; do not
  hand-write migration SQL or use `db push`.

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
- Phase 5 Part A's separate migration remains pending. In this execution Prisma reached local
  PostgreSQL but refused `migrate dev` because the command session is non-interactive; no migration
  SQL was generated. Run it in an interactive development terminal and review for additive changes.
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
- Newsletter enrollment is disabled; guest wishlist/recent history are local to the browser. Quick
  view cannot select variants or add directly because listing DTOs lack variant data, price
  filtering is current-page-only, and colour filters are unavailable.
- Exact garment measurements, online payment, order email and account order history are not
  implemented.

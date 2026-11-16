# Implementation progress

Last updated: 2026-11-16

## Status

Phase 2 Admin Catalog Management and the Diamond Selection storefront refresh are implemented:
categories, products/variants, product images, inventory operations, dashboard metrics, responsive
storefront motion and server-side role checks. Checkout and order placement remain disabled.

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

- Order workflows, payment capture/webhooks, refunds and customer/settings management are not
  implemented.
- Checkout remains disabled; order placement must perform conditional transactional stock
  decrement before it can be enabled.
- The denied server-action replay returned a browser redirect response; its typed error body was not
  independently inspected. Each mutation still invokes `requireRole` server-side.
- Production migration deployment still requires the release procedure and a database backup.
- Newsletter enrollment is disabled; guest wishlist/recent history are local to the browser. Quick
  view cannot select variants or add directly because listing DTOs lack variant data, price
  filtering is current-page-only, and colour filters are unavailable.
- Exact garment measurements and checkout/order workflows are not implemented.

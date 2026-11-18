# Documentation changelog

## 2026-11-18 — Coupon validation and review eligibility fixes

- Coupon application now returns rule-specific safe reasons, logs reason codes without customer
  data, keeps money input units explicit and converts admin date-time values to UTC instants.
- Product detail shows explicit eligibility/login states and the existing review status; guest
  orders are clearly documented as not claimable for reviews at this time.
- A temporary valid coupon was saved and applied to a populated local PostgreSQL cart using
  lowercase/space-padded input, then removed. Review eligibility resolved against a qualifying
  delivered database order.
- Local HTTP checks confirmed the product Reviews/login state and checkout coupon controls; admin
  review page redirects unauthenticated access. A temporary review was listed and approved through
  the moderation service, its aggregate updated, and the fixture was deleted. All quality gates
  pass, including 19 test files and 79 tests.

## 2026-11-17 — Phase 5 Part B

- Added account-backed wishlist sync and guest-list merge, transactional coupon discounts,
  order-item return/exchange requests, verified moderated reviews and newsletter/contact persistence.
- Added admin pages/CSV exports for coupons, returns, reviews and messages, plus focused rule tests.
- Generated and applied the additive `20261117122300_phase5_part_b` migration with Prisma.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (19 files, 77 tests) and `pnpm build` pass.
- PostgreSQL reports all five migrations applied and the schema up to date. Feature workflows,
  browser flows and external image uploads remain unverified.

## 2026-11-17 — Phase 5 Part A order experience

- Added customer-owned order listing/detail pages and status timelines on account and guest routes.
- Added append-only order status history, private admin notes, customer-visible tracking details,
  date/status-filtered order CSV and order-status WhatsApp messages.
- Added authorized PDF invoices with race-safe annual invoice numbers, Indian amount-in-words,
  PDFKit and bundled OFL Noto fonts.
- Lint, typecheck, 18 unit-test files and production build pass. A local 35-item multi-page PDF
  verified rupee text, Hindi/Gujarati font runs and amount-in-words; Next tracing includes its
  bundled fonts. The Part A migration was later generated and applied locally; browser order
  workflows remain unverified.

## 2026-11-17 — WhatsApp checkout and orders

- Added guest cart sessions, checkout with server-side repricing, transactional pending order
  snapshots and cart clearing, idempotency, rate limiting, token-protected order lookup and
  click-to-chat WhatsApp confirmation.
- Added admin order search/detail/status workflow with conditional stock deduction and audited
  restoration on cancellation.
- Added focused unit tests and updated order, cart, API, database, architecture and deployment docs.
- Schema changes are additive. The owner must run `pnpm exec prisma migrate dev --name
whatsapp_checkout` in the interactive VS Code terminal; migration generation and order lifecycle
  verification remain pending.
- Guest add-to-cart, cart persistence and checkout rendering were checked in the local browser.
  `pnpm lint`, `pnpm typecheck`, `pnpm test` (15 files, 62 tests) and `pnpm build` pass.
  Configured WhatsApp order submission and the real DB stock lifecycle remain pending.

## 2026-11-16 — Storefront intro preloader

- Added the home intro with a scoped stylesheet, site-config timings and theme-token colors. It
  plays automatically on every home visit, respects reduced motion and has a preload timeout; no
  new dependencies or database changes were introduced.
- Tuned the reveal pacing to about 4.5 seconds and faded the seed line out before the wordmark
  handoff.
- Added [the intro-preloader feature guide](features/intro-preloader.md) and documented the
  shared motion/accessibility constraints in `features/ui-design-system.md`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass. The requested viewport and
  behavior checks passed at 1440px and 390px, including reduced motion, direct home playback on
  repeat visits, route exclusion, wordmark sizing and the seed-line fade. Reduced-motion navigation
  exposed a pre-existing `HomeHero` Motion hydration warning; the intro itself had no console errors.

## 2026-11-16 — Diamond Selection storefront

- Updated catalog, design-system, setup and progress documentation for the rebrand, motion rules,
  responsive interactions, PWA metadata and 13-category/30-product seed.
- Added `features/storefront-interactions.md` with explicit client-only persistence and unavailable
  backend constraints.
- Recorded local wishlist persistence in ADR 0009; no schema or API contract changed.
- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (12 files, 48 tests). Responsive browser
  checks covered the home, shop, product and wishlist pages plus mobile overlays and PWA endpoints.
- `pnpm build` passes. Fixed hero-slide loading, LCP image/thumbnail state and Escape closure for
  native storefront dialogs; switched the wishlist burst to a tween to avoid spring/keyframe
  runtime errors. After those fixes, the hero carousel and wishlist toggle ran without console
  warnings. The database reset and new seed verification remain intentionally unrun.

## 2026-11-13 — Admin catalog management

- Documented the admin shell, categories, products/variants, Cloudinary image workflow, inventory
  adjustments and stock audit model in `features/admin-panel.md`, `features/inventory.md`,
  `features/catalog.md`, `DATABASE.md` and `API.md`.
- Updated root and docs progress reports and recorded the Sonner dependency in ADR 0007.
- Implementation files: `src/app/(admin)/admin`, `src/app/api/admin`,
  `src/features/catalog`, `src/features/inventory`, `src/features/admin-dashboard`,
  `src/features/auth/role.utils.ts`, `src/lib/providers/storage/index.ts`, and unit tests.
- Live PostgreSQL verification covered category deletion rules, a 3-variant product lifecycle,
  paise conversion, inline/bulk stock movement audits and storefront 404 after soft deletion.
  Two Cloudinary test images were uploaded, metadata/reordering controls exercised, and both
  remote assets deleted. Logged-out/CUSTOMER admin page and image-route denials were verified.
- Fixed `src/features/catalog/components/product-form.tsx` to reset React Hook Form state after a
  successful edit, preventing a stale unsaved-changes warning on navigation.
- Updated `docs/PROGRESS.md` and `PROGRESS.md` with live verification results and remaining checks.

## 2026-11-13 — Storefront UI refresh

- Added the storefront token/typography/component guide at `features/ui-design-system.md`.
- Updated `src/app/globals.css`, store/auth/account route-group layouts, storefront page routes,
  shared UI primitives, layout components, and catalog/auth/cart feature components.
- Updated `src/features/catalog/components/product-gallery.tsx` to eagerly load the active image
  and defer thumbnails after verifying the responsive-image preload warnings in the browser.
- No dependencies or architecture decisions were added.
- The project-wide changelog remains [the root changelog](../CHANGELOG.md).

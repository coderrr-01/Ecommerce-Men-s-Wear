# Changelog

All notable changes to Diamond Selection are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow SemVer.

## 2026-11-17 — Phase 5 Part A order experience

### Added

- Added owner-scoped account order history and detail pages with status timelines; guest order links
  now show the same timeline and customer-visible shipping tracking.
- Added transactional status-history entries, staff-only internal notes, tracking details, filtered
  order CSV export and status-specific WhatsApp messages.
- Added protected invoice PDF downloads with transactional annual numbering, amount-in-words and
  config-driven seller details. Added PDFKit and OFL-licensed Noto fonts for rupee and Indian-script
  text support.

### Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (18 files, 72 tests) and `pnpm build` pass.
- A local 35-item PDF was generated and read back from a temporary file; it contains multiple pages,
  Unicode font maps, rupee amounts, amount-in-words and Hindi/Gujarati font runs. Build tracing
  includes the font files.
- PostgreSQL is reachable with three existing migrations applied. The new Phase 5 migration could
  not be generated in this non-interactive command environment; browser/database order workflows
  and Vercel runtime remain unverified.

## 2026-11-17 — WhatsApp checkout and orders

### Added

- Added signed-in and guest cart checkout, server-side variant/price/stock validation, atomic order
  and item snapshots, idempotency and token-protected guest confirmation links.
- Added a length-limited, encoded WhatsApp order message with explicit click-to-chat and copy
  fallback. No online payment is collected.
- Added searchable/paginated admin order list and details, validated status transitions, transactional
  stock deduction on confirmation and stock restoration on eligible cancellation.
- Added unit tests for message output/encoding/length, DB-price totals, order number uniqueness,
  status transitions and stock changes. No dependencies added.

### Verification

- Guest cart addition, cart persistence and checkout summary rendered in the running browser.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (15 files, 62 tests) and `pnpm build` pass.
- Local PostgreSQL was reachable, but `prisma migrate dev` requires the owner's interactive VS Code
  terminal. No migration or order lifecycle was verified against the database.
- Configure the shop WhatsApp number and canonical URL before order submission.

## 2026-11-16 — Storefront intro preloader

### Added

- Added a config-driven home intro that plays on each home visit, with a responsive product-card
  reveal, wordmark, optional counter and reduced-motion fade. It does not run on other routes and
  no query parameter is needed.
- Added a CSS-only pre-hydration guard and timeout fallback, image/font readiness check, and
  scroll-lock cleanup. The home hero remains independently responsible for its LCP image.
- Slowed the intro sequence to about 4.5 seconds, eased the staggered reveals, and faded out the
  center seed line before the wordmark finishes.
- Documented the timings, theme-token use and troubleshooting in
  [the intro-preloader guide](docs/features/intro-preloader.md).

### Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- Browser-checked automatic home playback at 1440px and 390px, reduced-motion fade,
  repeat-visit playback, non-home route exclusion, full-viewport overlay bounds and scroll-lock cleanup. The intro had no
  console errors; the updated wordmark sizes and seed-line fade were also checked in the production
  browser. Reduced-motion navigation surfaced an existing `HomeHero` Motion hydration warning,
  outside this intro-only scope. No database changes were made.

## 2026-11-16 — Diamond Selection storefront

### Added

- Rebranded the storefront, configured diamond mark, shared reduced-motion presets, responsive
  navigation, animated home sections, product quick view, guest wishlist and recently viewed strip.
- Added debounced category/recent-search suggestions, a server-backed cart drawer, size suggestion
  helper, WhatsApp/back-to-top/scroll-progress controls and PWA install metadata.
- Expanded the idempotent demo catalog to 13 categories and 30 products, including nested Winter
  Wear accessories and category-appropriate size sets.
- Added interaction documentation and focused tests for local storage, size suggestions and seed
  category/product requirements.

### Changed

- Updated setup, progress, catalog, design-system, agent and README guidance to the Diamond
  Selection brand and current implementation constraints.
- Recorded the localStorage wishlist decision in ADR 0009; motion and carousel dependencies are
  recorded in ADR 0008.
- Preloaded only the first hero slide, kept previously shown slides eager, separated the winter
  banner image URL from its hero duplicate, and aligned the selected gallery thumbnail's loading
  state with the LCP image.
- Used a tween for the wishlist heart's multi-keyframe burst; kept spring transitions for
  single-target motion and made Escape explicitly close storefront dialogs.

### Verification

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (12 files, 48 tests).
- `pnpm build` passes.
- Browser-checked responsive layouts, mobile navigation/search, product dialogs, cart drawer,
  wishlist empty state and toggle, all hero slides, manifest and icon. No Motion runtime or LCP
  warnings appeared after the final fixes; the database still contains legacy catalog data.
- PostgreSQL seed verification remains pending; do not run `pnpm db:reset` except on a disposable
  development database.

## [Unreleased]

### Added

- Admin catalog operations for nested categories, product/variant management, Cloudinary-backed
  product image uploads, audited inventory adjustments, CSV export and live dashboard metrics.
- `StockMovement` audit history and product size-set/care/new-arrival fields through the generated
  `20261113114155_admin_catalog_stock_movements` migration.
- Sonner feedback for admin mutations, role-protected inventory/image endpoints and unit coverage
  for admin validation and stock rules.

### Changed

- Refreshed the storefront with config-driven semantic theme aliases, editorial typography,
  responsive home sections, a scroll-aware header with mobile/search/cart dialogs, revised
  catalogue/product/cart/auth UI, and accessible loading/empty states. See
  `docs/features/ui-design-system.md`.
- Updated admin catalog, inventory and dashboard documentation; added the admin-panel and
  inventory feature guides and the Sonner ADR.
- Successful product edits reset React Hook Form's dirty state, so navigation no longer triggers a
  false unsaved-changes warning.

### Added

- Storefront copy configuration for the announcement bar, home hero, home sections and footer in `src/config/site.config.ts`; hero/editorial imagery and alt text are configurable too.
- Demo seed names and email defaults in `siteConfig.seed`, consumed by `prisma/seed.ts` and `scripts/db-check.ts`.
- Brand customisation guide in `docs/SETUP.md` and ADR 0006.

### Changed

- The seed and DB-check script now read brand, contact, shipping, tax, policy and store-settings defaults from `site.config.ts` instead of duplicating placeholders.
- The default `EMAIL_FROM` now derives from the configured brand name and contact email.

### Fixed

- Removed the Next.js 16 dev overlay warning `Detected scroll-behavior: smooth on the <html> element` by declaring `data-scroll-behavior="smooth"` on the root `<html>` element.
- Load the active product-gallery image eagerly and defer offscreen thumbnails; keep preloads limited to stable LCP candidates and avoid unused responsive-image preloads.

## [0.1.0] - 2026-11-13

### Added

- Next.js 16.4 App Router project with TypeScript strict, Tailwind CSS v4, ESLint, Prettier, Vitest and pnpm 12 build approvals.
- Config layer: validated environment (`src/env.ts`), brand/store config (`src/config/site.config.ts`), runtime theme variables, navigation, constants and shared API/error/logging utilities.
- Prisma 6.19 schema and initial PostgreSQL migration covering users, addresses, categories, products, variants, images, carts, orders, items, payments, coupons, wishlist, reviews, banners, size guides and store settings.
- Idempotent seed with 5 categories, 15 menswear products, variants, images, size guides, demo users, coupons, banner and settings; production demo-data guard and overridable credentials.
- Auth.js credentials authentication, registration, logout, JWT role sessions, DB-backed session guards, Next 16 proxy protection and auth pages.
- UI primitives, generated theme CSS, store header/footer, account/admin layouts and shared components.
- Catalogue service/repository plus home, shop (search, category, sort, pagination) and product detail pages.
- Server-persisted cart with transactional quantity merges, stock checks, totals in paise, cart page and header count badge.
- Account and admin shells, admin dashboard metrics, policy pages and health endpoint.
- Payment, storage, email and SMS provider interfaces with mock, Razorpay, Cloudinary, console and Resend adapters.
- Unit tests for money/redirects, cart totals, catalogue URLs, validation schemas and stock rules (27 tests).
- Documentation: README, setup, architecture, database, API, feature guides, ADRs and agent instructions.

### Changed

- Replaced the default `db` export with a named `prisma` singleton.
- Moved storefront sort values into shared constants to avoid client/server type drift.
- Removed the deprecated `package.json#prisma` block; seeding now uses `tsx prisma/seed.ts`.
- Converted product breadcrumbs to `next/link` to satisfy ESLint.
- Added `Product.basePrice` for database-level price sorting.
- Ignored TypeScript build info in git.

### Security

- Credentials errors are generic; unknown-email logins run a dummy bcrypt hash.
- Passwords use bcrypt cost 12; seed credentials are development-only and production-gated.
- Role checks are DB-backed even when proxy redirects are bypassed.
- Redirect parameters are validated against open redirects.
- Razorpay signature helpers use HMAC and timing-safe comparison where applicable.

### Known limitations

- Checkout, order placement, transactional stock decrement, payment verification/webhooks and confirmation emails are not implemented. Checkout remains disabled.
- Password reset, email verification and login rate limiting are not implemented.
- Address CRUD, wishlist persistence, review submission/moderation, coupon application and admin CRUD are scaffolded only.
- The migration was generated offline with `prisma migrate diff` and has not been applied to a live database in this environment; the seed was not executed here.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass; runtime database smoke tests still require PostgreSQL.

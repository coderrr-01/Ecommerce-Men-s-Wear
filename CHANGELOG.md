# Changelog

All notable changes to Meridian are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow SemVer.

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

# Documentation changelog

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

# Documentation changelog

## 2026-11-13 — Storefront UI refresh

- Added the storefront token/typography/component guide at `features/ui-design-system.md`.
- Updated `src/app/globals.css`, store/auth/account route-group layouts, storefront page routes,
  shared UI primitives, layout components, and catalog/auth/cart feature components.
- Updated `src/features/catalog/components/product-gallery.tsx` to eagerly load the active image
  and defer thumbnails after verifying the responsive-image preload warnings in the browser.
- No dependencies or architecture decisions were added.
- The project-wide changelog remains [the root changelog](../CHANGELOG.md).

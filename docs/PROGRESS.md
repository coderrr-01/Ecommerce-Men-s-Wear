# Storefront UI progress

Last updated: 2026-11-13

## Status

The storefront UI redesign is complete. Changes are limited to the UI surfaces and their
documentation; existing business logic, data fetching contracts, authentication logic, and the
database were not changed.

## Verification

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass — 5 files, 27 tests |
| `pnpm build` | Pass — Next.js 16.4.6, Turbopack |
| Browser layout | No horizontal overflow at 360, 768, 1024, and 1440px across storefront, product and auth routes; protected cart/account routes redirected to login as expected |
| Browser interactions | Mobile navigation/search, product filters, cart drawer, password visibility, product-image zoom, and size-guide dialog checked |
| Product image loading | Fresh product-page load produced no LCP or unused-preload warnings |

Database connectivity and seed behavior were not verified as part of this UI-only change.

## Known UI gaps

- Newsletter signup has no enrollment backend.
- Wishlist persistence and product-card quick-add/alternate imagery are unavailable in current
  feature contracts.
- The cart drawer is a count and navigation summary; cart lines and totals remain on the full cart
  page.
- Exact garment measurements are not available in the size guide.
- Checkout remains disabled until order placement, stock, and payment work is implemented.

See the [design-system guide](./features/ui-design-system.md) for tokens, typography, components,
rebranding, and motion rules. The project-wide implementation status and next milestones remain in
the [root progress file](../PROGRESS.md).

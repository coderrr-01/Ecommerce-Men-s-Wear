# Implementation progress

Last updated: 2026-11-13

## Status

Phase 2 Admin Catalog Management is implemented: categories, products/variants, product images,
inventory operations, dashboard metrics and server-side role checks. Checkout and order placement
remain disabled.

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

## Verification

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass — 8 files, 40 tests |
| `pnpm build` | Pass |
| PostgreSQL migration | `20261113114155_admin_catalog_stock_movements` applied; migration status up to date |
| Admin browser/responsive checks | Pass — inventory checked at 360, 768, 1024 and 1440 px |
| Category/product/variant CRUD on live DB | Pass — category and active 3-variant product created, edited and soft-deleted |
| Image uploads and Cloudinary deletion | Pass — uploaded two PNGs, updated alt/primary/order, then deleted both |
| Inventory and audit history | Pass — inline and bulk updates recorded signed deltas; seeded stock restored to 15 |
| Storefront visibility | Pass — product loaded while active and returned 404 after soft deletion |
| Customer/logged-out access | Pass — admin navigation redirected/denied; image API returned 401/403 |
| Server-action authorization | Guards are present and role helper tests pass; direct browser replay was redirected before its response body could be inspected |

Previous storefront responsive and interaction checks are documented in
[ui-design-system.md](./features/ui-design-system.md).

## Known gaps

- Order workflows, payment capture/webhooks, refunds and customer/settings management are not
  implemented.
- Checkout remains disabled; order placement must perform conditional transactional stock
  decrement before it can be enabled.
- The denied server-action replay returned a browser redirect response; its typed error body was not
  independently inspected. Each mutation still invokes `requireRole` server-side.
- Production migration deployment still requires the release procedure and a database backup.

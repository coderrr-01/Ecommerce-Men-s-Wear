# Inventory management

## Route and filters

`/admin/inventory` lists all non-deleted variants whose products are not deleted, including variants
belonging to drafts. Search matches product name or SKU. The `state` query supports `all`, `low` and
`out`; rows are paginated 25 at a time and the current filter is preserved in page links and CSV
export.

The low-stock threshold comes from `siteConfig.inventory.lowStockThreshold`. A variant is:

- **Out of stock** when stock is zero.
- **Low** when stock is from one through the configured threshold.
- **In stock** when stock is above the threshold.

## Adjustments and audit

STAFF and ADMIN can save a row's stock or set one target quantity for up to 100 selected variants.
Targets must be integers from 0 to 1,000,000. The whole batch succeeds or rolls back. The
repository re-reads current quantities, uses a serializable Prisma transaction and conditionally
updates stock to avoid overwriting concurrent changes.

Each changed variant receives a `StockMovement` in the same transaction:

- `variantId` — variant being adjusted.
- `delta` — signed target-minus-previous quantity.
- `reason` — inline or bulk adjustment reason.
- `userId` — authenticated staff/admin user.
- `createdAt` — automatic UTC timestamp.

Unchanged quantities produce no audit row. Product form stock edits, initial stock and variant
removal/deletion also write movements. Order placement is not yet implemented and does not decrement
stock.

## CSV export

`GET /api/admin/inventory/export?q=&state=` exports the complete filtered result set, not just the
current page. It is protected by the same STAFF/ADMIN guard and escapes CSV fields, including
spreadsheet-formula prefixes.

See [admin-panel.md](./admin-panel.md), [catalog.md](./catalog.md) and [API.md](../API.md).

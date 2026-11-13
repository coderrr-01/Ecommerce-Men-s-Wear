# Admin panel

## Access and role boundaries

`/admin/*` is guarded by the Next.js proxy for navigation and by the admin layout through the
database-backed `requireRole(["ADMIN", "STAFF"])`. Every admin server action and API route also
checks access on the server; proxy redirects are not an authorization boundary.

| Capability | ADMIN | STAFF |
| --- | --- | --- |
| View dashboard and inventory | Yes | Yes |
| Create/update categories | Yes | Yes |
| Create/update products and variants | Yes | Yes |
| Upload, reorder and edit image alt text | Yes | Yes |
| Adjust inventory | Yes | Yes |
| Delete categories, products or images | Yes | No |
| Manage users, settings or roles | Planned | No |

Authorization failures use the shared `ApiResponse` error shape with `UNAUTHORIZED` or `FORBIDDEN`.
The guard reloads the user from the database, so inactive, deleted or role-changed accounts lose
access immediately.

## Routes

- `/admin` — real counts for total/active/draft products, variants, low/out-of-stock variants,
  customers and orders; low-stock list contains up to ten direct edit links.
- `/admin/categories` — nested category list and create/edit form.
- `/admin/products` — searchable, filterable, URL-paginated catalog and bulk status actions.
- `/admin/products/new` and `/admin/products/{id}/edit` — product fields and inline variant
  management; the edit screen includes the image manager.
- `/admin/inventory` — searchable and state-filtered variant inventory with inline/bulk stock
  updates and CSV export.
- `/admin/orders`, `/admin/customers` and `/admin/settings` — placeholders until their respective
  workflows are implemented.

The shared shell provides responsive navigation, breadcrumbs, current-user menu, sign-out and
Sonner notifications. Admin interfaces reuse the tokens and primitives described in
[`ui-design-system.md`](./ui-design-system.md).

## Catalog and media

Category and product actions follow
`UI -> server action/route -> service -> repository -> Prisma`. Inputs are Zod-validated at the
server boundary. Category deletion is blocked when it has active products or children. Products
and variants are soft-deleted; storefront queries explicitly filter deleted and draft products.

Product forms validate their size set and variant combinations, persist prices in paise, record
stock deltas in `StockMovement`, and warn before leaving unsaved edits. A successful save clears
the dirty state. Image uploads use the existing server-side `StorageProvider`.
Cloudinary is optional in local development; if unconfigured, upload and Cloudinary-backed delete
controls explain the missing provider instead of crashing.

## Remaining work

Order lifecycle/refunds, customer administration, settings, coupons, banners, review moderation and
size-guide administration are not implemented. See [API.md](../API.md) for action contracts and
[PROGRESS.md](../PROGRESS.md) for verification status.

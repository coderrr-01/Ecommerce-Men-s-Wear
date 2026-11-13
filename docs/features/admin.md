# Admin

## Access

- `/admin/*` is guarded in `src/proxy.ts` and again by `src/app/admin/layout.tsx` through `requireRole(["ADMIN", "STAFF"])`.
- The DB-backed check means deactivated users and role changes take effect immediately.
- The store header shows an admin link only for admin/staff users.

## Implemented

- Admin layout with shared navigation and sign-out.
- Dashboard at `/admin` with counts for active products, orders, customers and low-stock variants.
- Low-stock threshold is defined in the dashboard repository.
- Module placeholder component for unfinished screens.

## Placeholder routes

- `/admin/products`
- `/admin/orders`
- `/admin/inventory`
- `/admin/customers`
- `/admin/settings`

These render honest “coming soon” shells; they do not expose write operations.

## Intended architecture for CRUD

Follow the existing layering:

1. Zod schema in `features/<module>/schemas`.
2. Server action validates, calls `requireRole`, then a service.
3. Service applies business rules and provider calls.
4. Repository performs Prisma reads/writes.
5. UI uses server components for tables and client components only for interactive forms.
6. `revalidatePath` after writes; return a serialisable action state.

## Known gaps

- Product/category/variant CRUD, image upload through `StorageProvider`.
- Order status transitions, cancellation, refunds and notes.
- Inventory adjustments with audit trail.
- Customer management and role assignment.
- Coupon, banner, review and size-guide management.
- Settings form backed by `StoreSettings`.
- Dashboard charts and date filtering.

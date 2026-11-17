# Cart

## Scope

Server-persisted cart for signed-in users and guests. Guest carts use the existing `Cart.sessionId`
field and a cryptographically random HTTP-only, SameSite=Lax cookie. Every cart read/mutation is
scoped to the current user or guest session. A guest cart is not merged automatically after login.

## Behaviour

- One active cart per user (`Cart.userId` unique).
- One guest cart per opaque session (`Cart.sessionId` unique).
- `CartItem` is unique per `(cartId, variantId)`; adding an existing variant increments quantity.
- Quantity is constrained to 1–10 at the action boundary.
- Variants must exist, be active, belong to an active product and have sufficient stock.
- Cart quantity merges run inside a transaction to avoid race conditions.
- Totals are computed in paise:
  - `subtotal = sum(unitPrice * quantity)`
  - shipping is free at/above `siteConfig.shipping.freeShippingThreshold`, otherwise the standard fee
  - `grandTotal = subtotal + shippingTotal`
  - `freeShippingRemaining` supports the progress message
- No tax line is added at cart or WhatsApp checkout. Tax is not collected in this phase.

## Files

- `src/features/cart/schemas/cart.schema.ts` — input validation.
- `src/features/cart/guest-session.ts` — guest cookie ownership.
- `src/features/cart/repositories/cart.repository.ts` — transactions and Prisma access.
- `src/features/cart/services/cart.service.ts` — ownership checks, mapping, totals.
- `src/features/cart/utils.ts` — pure totals.
- `src/features/cart/actions/cart.actions.ts` — add/update/remove.
- `src/features/cart/components/*` — quantity stepper and cart presentation.
- `src/app/(store)/cart/page.tsx` — cart page.
- `src/components/layout/site-header.tsx` — item-count lookup.
- `src/components/layout/cart-drawer.tsx` — lightweight count/route drawer; item details stay on `/cart`.

## Error handling

Service errors are `AppError` subclasses (`ValidationError`, `NotFoundError`, `InsufficientStockError`). Actions redirect with a user-facing message rather than throwing raw Prisma errors. Unexpected errors are logged through `logger`.

## Checkout

The cart page links to `/checkout`; guest checkout is supported. Order placement re-prices active
variants from PostgreSQL, snapshots the order, clears the cart transactionally and then offers
click-to-chat on WhatsApp. Stock is intentionally not reserved or decremented at order placement;
admin confirmation performs the conditional stock decrement.

## Known gaps

- Guest cart merge after login.
- Tax, coupons and shipping-method selection.
- Saved-for-later and stock reservation.

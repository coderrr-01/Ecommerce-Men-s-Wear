# Cart

## Scope

Server-persisted cart for signed-in users. Guest carts are represented in the schema (`Cart.sessionId`) but guest cart actions are not enabled yet; unauthenticated users are redirected to login with `redirectTo=/cart`.

## Behaviour

- One active cart per user (`Cart.userId` unique).
- `CartItem` is unique per `(cartId, variantId)`; adding an existing variant increments quantity.
- Quantity is constrained to 1–10 at the action boundary.
- Variants must exist, be active, belong to an active product and have sufficient stock.
- Cart quantity merges run inside a transaction to avoid race conditions.
- Totals are computed in paise:
  - `subtotal = sum(unitPrice * quantity)`
  - shipping is free at/above `siteConfig.shipping.freeShippingThreshold`, otherwise the standard fee
  - `grandTotal = subtotal + shippingTotal`
  - `freeShippingRemaining` supports the progress message
- No tax line is added at cart stage. Tax rules are configuration/model fields for the future checkout flow.

## Files

- `src/features/cart/schemas/cart.schemas.ts` — input validation.
- `src/features/cart/repositories/cart.repository.ts` — transactions and Prisma access.
- `src/features/cart/services/cart.service.ts` — ownership checks, mapping, totals.
- `src/features/cart/utils.ts` — pure totals.
- `src/features/cart/actions/cart.actions.ts` — add/update/remove.
- `src/features/cart/components/*` — summary, quantity form, remove button.
- `src/app/(store)/cart/page.tsx` — cart page.
- `src/components/layout/site-header.tsx` — item-count badge via `getCartItemCount`.

## Error handling

Service errors are `AppError` subclasses (`ValidationError`, `NotFoundError`, `InsufficientStockError`). Actions redirect with a user-facing message rather than throwing raw Prisma errors. Unexpected errors are logged through `logger`.

## Checkout status

The cart page shows a disabled “Checkout coming soon” action. Order placement, tax calculation, coupon application, address selection and payment capture are not implemented. Do not enable checkout until the stock decrement/order transaction and payment webhook are in place.

## Known gaps

- Guest carts and cart merge after login.
- Checkout, tax, coupons and shipping-method selection.
- Saved-for-later and stock reservation.

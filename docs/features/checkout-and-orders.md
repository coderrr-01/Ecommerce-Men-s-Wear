# Checkout and orders

## Status: not implemented

The schema, status labels and provider adapters exist, but checkout is intentionally disabled. This prevents orders from being created without transactional stock handling or payment verification.

## What exists

- `Order`, `OrderItem` and `Payment` models with money in paise and address snapshots.
- `OrderStatus` and `PaymentStatus` enums.
- Mock and Razorpay payment adapters under `src/lib/providers/payment/`.
- Razorpay HMAC signature helpers.
- Order-number generation helper.
- Admin and account order shells.
- Empty feature folders for checkout, orders, payments and coupons.

## Required before enabling checkout

1. **Address selection/creation** owned by the signed-in user.
2. **Pricing service**: re-price variants server-side; never trust client totals. Apply coupon, tax and shipping from `StoreSettings`/config.
3. **Order transaction**: create order/items, decrement variant stock with a conditional update, update coupon usage and clear the cart in one transaction. Roll back on any failure.
4. **Payment initiation**: create provider order for Razorpay, persist `Payment` with `PENDING`.
5. **Webhook**: verify HMAC, idempotently update payment/order status, handle failures/refunds.
6. **Order confirmation** page and email via `EmailProvider`.
7. **Cancellation/return** transitions with stock restoration policy.
8. **Tests** for totals, coupons, stock races and webhook idempotency.
9. **Rate limiting and audit logging** for payment endpoints.

## Non-negotiable rules

- Client-submitted prices are ignored.
- Stock decrement and order creation share a transaction.
- Payment success is accepted only from a verified server-side source.
- Order items store name/SKU/size/colour/price snapshots so later catalogue edits do not alter history.
- Soft-deleted users/products must not break historical orders.

## Acceptance criteria for the milestone

- Happy path: add to cart -> address -> payment -> verified webhook -> confirmed order -> stock reduced once.
- Replayed webhook does not double-decrement or duplicate payments.
- Concurrent purchases cannot drive stock below zero.
- Failed payment leaves stock and cart in a recoverable state.
- Order confirmation is visible in `/account/orders` and `/admin/orders`.

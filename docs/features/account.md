# Account, wishlist, reviews and addresses

## Account

- `/account` requires authentication and shows profile details and links.
- `/account/orders`, `/account/addresses` and `/account/wishlist` are guarded shells.
- Sign-out is a server action.
- The header exposes account/admin links based on the session.
- The account shell uses the shared storefront typography and responsive navigation.

## Addresses

- `Address` supports shipping/billing types, default flag and soft delete.
- No CRUD actions or forms yet.
- Checkout will need address selection plus an immutable snapshot copied into `Order.shippingAddress`.

## Wishlist

- `Wishlist` enforces one row per user/product; server actions and repositories scope every query to
  the signed-in user.
- The existing product-card controls use the same context for guests and signed-in customers.
  Guest localStorage IDs are merged idempotently after login and cleared only after success.
- `/wishlist` and `/account/wishlist` show the saved products.

## Reviews

- Reviews require a delivered order item for the product and are unique per customer/product.
- New reviews are pending until staff approval; plain text is sanitized, optional images use the
  configured storage provider, and only approved reviews affect product ratings/JSON-LD.

## Returns

- Customers may request a return/exchange on an owned delivered order item within the configured
  window. Each item can have one active request at a time.
- Staff approve/reject, record item receipt, then complete a return or exchange. Stock restoration
  and audit movement happen only when receipt is recorded, transactionally.

## Password reset

- `/forgot-password` collects an email and shows a generic confirmation.
- No token table, email delivery or reset form exists.
- Add rate limiting and single-use, expiring tokens before enabling.

## Next steps

1. Address CRUD with server actions and ownership checks.
2. Wishlist toggle with optimistic UI and a cached count.
3. Review submission tied to delivered orders, plus admin moderation.
4. Password reset token model and email flow.
5. Account profile editing and optional password change.

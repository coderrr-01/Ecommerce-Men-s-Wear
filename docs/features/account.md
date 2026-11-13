# Account, wishlist, reviews and addresses

## Account

- `/account` requires authentication and shows profile details and links.
- `/account/orders`, `/account/addresses` and `/account/wishlist` are guarded shells.
- Sign-out is a server action.
- The header exposes account/admin links based on the session.

## Addresses

- `Address` supports shipping/billing types, default flag and soft delete.
- No CRUD actions or forms yet.
- Checkout will need address selection plus an immutable snapshot copied into `Order.shippingAddress`.

## Wishlist

- `Wishlist` enforces one row per user/product.
- No toggle action, persistence or page implementation yet.
- Product cards do not show a wishlist control.

## Reviews

- `Review` has rating, title, comment, moderation status and verified-purchase flag.
- Default status is `PENDING`; storefront rating aggregates only count approved reviews (service-level).
- No submission form, moderation queue or verified-purchase calculation yet.

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

# Wishlist

Guest wishlists remain in versioned localStorage behind the existing `WishlistStorage` interface.
Signed-in wishlists use the existing `Wishlist` table through owner-scoped repository, service and
server-action layers. Storefront cards keep the same wishlist context and controls.

After login, the provider sends guest product IDs to an authenticated merge action. The service
deduplicates IDs, filters unavailable products, and the `(userId, productId)` unique constraint
makes the merge safe to retry. Local guest data is cleared only after a successful server merge.

`/wishlist` works for both guest and signed-in visitors; `/account/wishlist` shows the same saved
items inside the account shell. See ADR 0009 for the adapter and merge decision.

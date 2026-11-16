# Decision 0009: Guest wishlist storage

## Status

Accepted

## Context

The storefront needs a usable wishlist before account wishlist persistence is implemented. No
server-side wishlist action or repository is available, and wishlist backend work is outside this
storefront-only change.

## Decision

- Implement guest wishlist persistence behind the `WishlistStorage` interface.
- Use a versioned browser `localStorage` key and subscribe to same-tab and cross-tab updates.
- Surface unavailable or malformed browser storage with an explicit toast/state instead of silently
  pretending a save succeeded.
- Keep saved entries limited to serializable storefront product-card data; the existing signed-in
  wishlist route and persistence remain unchanged.

## Consequences

Guest saves are device- and browser-specific and are not synchronized to accounts or other devices.
They may be cleared by browser settings. Replacing the adapter with a database-backed implementation
will require an authenticated server contract and migration behavior.

# Decision 0009: Guest wishlist storage with account synchronization

## Status

Accepted

## Context

Guests need an immediate browser-backed wishlist, while signed-in customers need wishlist data that
persists across devices.

## Decision

- Keep guest wishlist persistence behind the existing `WishlistStorage` interface.
- Use a versioned browser `localStorage` key and subscribe to same-tab and cross-tab updates.
- Surface unavailable or malformed browser storage with an explicit toast/state instead of silently
  pretending a save succeeded.
- Keep guest entries limited to serializable storefront product-card data.
- For signed-in users, use the same storefront wishlist context and UI with a server-backed adapter.
  Merge guest product IDs into the account wishlist after login; the database unique constraint
  makes the merge idempotent and duplicate-free. Clear local guest entries only after the merge
  succeeds.

## Consequences

Guest saves remain device- and browser-specific until login and may be cleared by browser settings.
Authenticated saves are database-backed, owner-scoped and synchronized across devices.

# ADR 0002: Prisma with PostgreSQL and integer paise

- Status: Accepted
- Date: 2026-11-13

## Context

The store needs relational integrity for catalogue variants, carts, orders and payments; transaction support for stock; and a migration history. Money must be exact for INR checkout and refunds.

## Decision

- Use PostgreSQL with Prisma 6.19 pinned exactly.
- Model all monetary amounts as integers in paise. Format only in the UI via `formatPrice`.
- Use `@@map`/`@map` for snake_case database naming.
- Keep soft deletes (`deletedAt`) on user-facing and catalogue entities; order history keeps snapshots.
- Commit the initial SQL migration. Prefer `prisma migrate dev` when a database is available; otherwise generate SQL with `prisma migrate diff`.
- Store `Product.basePrice` so catalogue price sorting happens in PostgreSQL.

## Consequences

- No floating-point money bugs; all arithmetic is integer.
- Every repository must explicitly filter `deletedAt: null`; Prisma does not do it automatically.
- Discounts/tax must round deterministically to paise at defined boundaries in the checkout service.
- Schema changes require a migration and regenerated client.
- The initial migration was generated without a live database, so it must be applied and smoke-tested in a real environment.

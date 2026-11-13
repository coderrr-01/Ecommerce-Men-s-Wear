# ADR 0005: Layered features and server actions

- Status: Accepted
- Date: 2026-11-13

## Context

Mixing database queries, provider calls and UI in pages becomes hard to test and secure as a store grows. The project must be reusable and safe to extend.

## Decision

- Organise by feature under `src/features/<feature>`.
- Enforce `UI -> action/route -> service -> repository -> Prisma`.
- UI never imports Prisma or repositories.
- Validate all external input with Zod at the action/route boundary.
- Return `{ success, data?, error? }` from API-like actions, and small serialisable states from form actions.
- Use `AppError` subclasses and central logging.
- Keep pure rules in utility modules free of `server-only` so Vitest can test them without a database.
- Run dependent writes in `prisma.$transaction`.

## Consequences

- Repositories are the only place Prisma appears, simplifying testing and future data-source changes.
- Services become the home for pricing/stock/provider rules.
- Features add some boilerplate; this is intentional for separation and reviewability.
- Checkout must follow this pattern, with order creation and stock decrement in one transaction.

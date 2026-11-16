<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Diamond Selection project guide

Diamond Selection is a menswear-only e-commerce foundation in `D:\mens-wear` (package `meri-shop`). Read `README.md`, `docs/ARCHITECTURE.md` and `PROGRESS.md` before large changes. Keep the managed Next.js block above intact.

## Stack

- Next.js 16.4 App Router, React 19, TypeScript strict, Tailwind CSS v4.
- Prisma 6.19.3 (pinned) with PostgreSQL; do not upgrade casually.
- Auth.js / NextAuth 5 beta, credentials + JWT roles.
- Zod 4, Vitest 5, pnpm 12.

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before declaring work complete. Do not claim database verification unless PostgreSQL was actually reachable.

## Non-negotiable architecture

```
UI -> server action / route -> service -> repository -> Prisma
```

- UI must never import Prisma or repositories.
- Repositories own Prisma queries. Services own business rules, DTO mapping and providers.
- Validate external input with Zod at actions/routes.
- Use `AppError` subclasses; return `{ success, data?, error? }` for API-like actions and serialisable states for `useActionState`.
- Use `prisma.$transaction` for dependent writes (stock checks, cart merges, future orders).
- Pure logic must not import `server-only`, repositories or Prisma so it stays unit-testable.

## Data rules

- Money is integer paise. Format only with `formatPrice`; never use floats for money.
- Filter `deletedAt: null` explicitly; Prisma does not hide soft-deleted rows.
- Product price sorting uses `Product.basePrice`.
- Storefront sort keys live in `src/config/constants.ts`.
- Order/items must snapshot name, SKU, size, colour, price and image.
- Stock decrement must be conditional and transactional at order placement.

## Auth and security

- `src/proxy.ts` is the only proxy; never add `middleware.ts`. Proxy redirects are optimistic only.
- Re-check authorization in layouts/actions with `requireUser`/`requireRole`.
- Roles: `CUSTOMER`, `STAFF`, `ADMIN`; admin accepts staff and admin.
- Use `isSafeRedirectPath` for redirect parameters.
- Never log or commit secrets. Do not expose provider secrets to client components.

## Next.js 16 specifics

- Read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- Await `params` and `searchParams`; they are promises.
- Add `export const dynamic = "force-dynamic"` to DB-backed pages.
- Remote image hosts must be added to `next.config.ts`.
- The store header reads session/cart, so store pages are request-time dynamic.

## UI and config

- Brand, contact, shipping, tax, policies and theme values belong in `src/config/site.config.ts`; do not hardcode brand text.
- Theme CSS variables are generated from config in `src/config/theme.ts`.
- Use existing primitives in `src/components/ui` and `cn` from `src/lib/utils.ts`.
- Follow existing component style. Do not add comments unless they explain non-obvious constraints.
- Client components only for interaction; keep data fetching server-side.

## Providers

- Depend on interfaces in `src/lib/providers/`; select via factories/env.
- Development defaults: mock payments, console email/SMS.
- Razorpay requires a verified, idempotent webhook before real payments can be enabled.
- Cloudinary signing stays server-side.

## Seed and demo accounts

- `pnpm db:seed` is idempotent and production-gated by `ALLOW_DEMO_SEED`.
- Dev admin: `admin@diamondselection.example` / `Admin@12345`.
- Dev customer: `customer@diamondselection.example` / `Customer@12345`.
- Override with `SEED_*` variables; never use demo passwords in production.

## Documentation is part of the change

After behaviour changes, update at least:

- `CHANGELOG.md` with a dated entry.
- `PROGRESS.md` status, verification and known gaps.
- The relevant `docs/features/*.md`.
- `docs/DATABASE.md` and `docs/API.md` when schema/contracts change.
- A new ADR in `docs/decisions/` for architectural decisions.

## Known incomplete areas

Checkout/order placement, payment webhooks, transactional stock decrement, password reset, addresses, wishlist, reviews, admin CRUD and integration tests are not implemented. Checkout stays disabled until order/stock/payment work is complete. See `PROGRESS.md` for priorities.

## Definition of done

- Types, lint, tests and build pass.
- No Prisma in UI; no `server-only` in unit tests.
- Auth and input validation exist at the server boundary.
- Money stays in paise.
- Docs and changelog reflect the change.
- Unverified items are stated honestly.

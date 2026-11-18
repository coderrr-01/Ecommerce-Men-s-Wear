# Diamond Selection

A premium, menswear-only e-commerce foundation built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma and Auth.js.

Diamond Selection keeps its branding, contact details, shipping thresholds, tax defaults and design tokens in one place, while catalogue, authentication and cart flows follow a strict layered architecture.

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`.

PostgreSQL must be running and `DATABASE_URL` must point to an empty database before `db:migrate`.

### Seeded accounts (development)

| Role     | Email                               | Password         |
| -------- | ----------------------------------- | ---------------- |
| Admin    | `admin@diamondselection.example`    | `Admin@12345`    |
| Customer | `customer@diamondselection.example` | `Customer@12345` |

Override these with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_EMAIL` and `SEED_CUSTOMER_PASSWORD`. The seed refuses to run in production unless `ALLOW_DEMO_SEED=true`.

## Commands

| Command                  | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `pnpm dev`               | Development server                         |
| `pnpm build`             | Production build                           |
| `pnpm start`             | Start the production build                 |
| `pnpm lint`              | ESLint                                     |
| `pnpm typecheck`         | TypeScript, no emit                        |
| `pnpm test`              | Vitest unit suite                          |
| `pnpm test:watch`        | Vitest watch mode                          |
| `pnpm format`            | Prettier write                             |
| `pnpm db:generate`       | Generate Prisma client                     |
| `pnpm db:migrate`        | Create/apply a development migration       |
| `pnpm db:migrate:deploy` | Apply committed migrations in production   |
| `pnpm db:seed`           | Run the idempotent development seed        |
| `pnpm db:reset`          | Reset a development database and reseed it |
| `pnpm db:studio`         | Prisma Studio                              |

## Implemented

- Next.js App Router with route groups for store, auth, account and admin.
- Brand/store configuration in `src/config/site.config.ts`; theme CSS variables generated from it.
- PostgreSQL schema with users, addresses, catalogue, variants, carts, orders, payments, coupons, wishlist, reviews, banners, size guides and settings.
- Generated migrations plus an idempotent seed: 13 categories (including nested winter accessories), 30 products with size/colour variants, 2 users, coupons and a banner.
- Auth.js credentials authentication, registration, JWT sessions, role checks and route protection through `src/proxy.ts` plus server-side guards.
- Animated responsive storefront, category navigation, product quick view, catalogue filtering/pagination, detail gallery, cart drawer and policy pages.
- Guest wishlist and recently viewed products stored locally in the browser; PWA manifest and generated diamond icon.
- Account and admin shells; role-guarded category/product/variant management, product image
  uploads, audited inventory adjustments/CSV export, and live dashboard metrics.
- Guest and signed-in WhatsApp order requests with server-repriced order snapshots, token-protected
  confirmation links, and admin fulfilment/stock audit flow. No online payment is collected.
- Account-synced wishlist with guest merge, transactional coupons, return/exchange approvals,
  verified moderated reviews, and persisted/rate-limited newsletter and contact submissions.
- Provider adapters for payment (mock/Razorpay), storage (Cloudinary) and email/SMS (console/Resend).
- Unit tests for money formatting, redirects, catalogue URLs, cart totals, validation and stock rules.
- Passed `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.

## Current limitations

- Online payment capture/webhooks, refunds and stock reservation are not implemented. Stock is
  committed when staff confirms an order request.
- Newsletter/contact submissions are stored, but email campaigns and contact notifications are not
  sent. Search suggestions are category/recent-query based; variant-aware product suggestions and
  colour filtering need richer catalog DTOs.
- Recently viewed data remains browser/device-specific. Guest wishlist entries merge into the
  account wishlist after login.
- Password reset email is not enabled.
- Admin catalog fields and stock-audit tables are tracked in the generated migration
  `20261113114155_admin_catalog_stock_movements`; database verification status is recorded in
  [progress](docs/PROGRESS.md).
- WhatsApp checkout, order-experience and Phase 5 Part B schema changes are additive and recorded in
  generated Prisma migrations. Production applies them with `pnpm prisma migrate deploy`.

## Documentation

- [Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Features](docs/features/catalog.md)
- [Decisions](docs/decisions/0001-nextjs-16-app-router.md)
- [Progress](PROGRESS.md)
- [Changelog](CHANGELOG.md)

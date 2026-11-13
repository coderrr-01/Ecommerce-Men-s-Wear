# Meridian

A production-minded, menswear-only e-commerce foundation built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma and Auth.js.

Meridian is intended as a reusable starting point: branding, contact details, shipping thresholds, tax defaults and design tokens live in one place, while catalogue, authentication and cart flows follow a strict layered architecture.

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

| Role     | Email                       | Password         |
| -------- | --------------------------- | ---------------- |
| Admin    | `admin@meridian.example`    | `Admin@12345`    |
| Customer | `customer@meridian.example` | `Customer@12345` |

Override these with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_EMAIL` and `SEED_CUSTOMER_PASSWORD`. The seed refuses to run in production unless `ALLOW_DEMO_SEED=true`.

## Commands

| Command                  | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `pnpm dev`               | Development server                       |
| `pnpm build`             | Production build                         |
| `pnpm start`             | Start the production build               |
| `pnpm lint`              | ESLint                                   |
| `pnpm typecheck`         | TypeScript, no emit                      |
| `pnpm test`              | Vitest unit suite                        |
| `pnpm test:watch`        | Vitest watch mode                        |
| `pnpm format`            | Prettier write                           |
| `pnpm db:generate`       | Generate Prisma client                   |
| `pnpm db:migrate`        | Create/apply a development migration     |
| `pnpm db:migrate:deploy` | Apply committed migrations in production |
| `pnpm db:seed`           | Run the idempotent development seed      |
| `pnpm db:studio`         | Prisma Studio                            |

## Implemented

- Next.js App Router with route groups for store, auth, account and admin.
- Brand/store configuration in `src/config/site.config.ts`; theme CSS variables generated from it.
- PostgreSQL schema with users, addresses, catalogue, variants, carts, orders, payments, coupons, wishlist, reviews, banners, size guides and settings.
- Generated initial migration plus an idempotent seed: 5 categories, 15 products with size/colour variants, 2 users, coupons and a banner.
- Auth.js credentials authentication, registration, JWT sessions, role checks and route protection through `src/proxy.ts` plus server-side guards.
- Storefront home, catalogue listing/filtering/pagination, product detail, cart and policy pages.
- Account and admin shells; admin dashboard metrics.
- Provider adapters for payment (mock/Razorpay), storage (Cloudinary) and email/SMS (console/Resend).
- Unit tests for money formatting, redirects, catalogue URLs, cart totals, validation and stock rules.
- Passed `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.

## Current limitations

- Checkout, order creation, payment capture/webhooks and transactional stock decrement are not wired yet.
- Address CRUD, wishlist toggling, reviews submission and admin CRUD screens are scaffolded but not implemented.
- Password reset email is not enabled.
- The local machine used to build this had no PostgreSQL instance, so the migration was generated with `prisma migrate diff` and the seed was not executed here.

## Documentation

- [Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Features](docs/features/catalog.md)
- [Decisions](docs/decisions/0001-nextjs-16-app-router.md)
- [Progress](PROGRESS.md)
- [Changelog](CHANGELOG.md)

# Setup

## Requirements

- Node.js 22+ (the repository has been verified on Node 22.23.0).
- pnpm 12+ (`packageManager` is pinned in `package.json`).
- PostgreSQL 15+.

## 1. Install

```bash
pnpm install
```

pnpm 12 build scripts are approved in `pnpm-workspace.yaml` via `allowBuilds`. `package.json#pnpm.onlyBuiltDependencies` is not used by pnpm 12.

## 2. Environment

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: at least 32 characters. Generate with `openssl rand -base64 32`.
- `NEXT_PUBLIC_SITE_URL`: canonical site URL.

Optional providers:

- Payment: `PAYMENT_PROVIDER=mock|razorpay`; Razorpay requires key ID, key secret and webhook secret.
- Storage: Cloudinary credentials.
- Email: `EMAIL_PROVIDER=console|resend`.
- SMS: console adapter only for now.

All environment access is validated in `src/env.ts`.

## 3. Database

Create the database, then:

```bash
pnpm db:migrate
```

For a fresh production database:

```bash
pnpm db:migrate:deploy
```

The initial migration is committed at `prisma/migrations/20261113000000_init`. It was generated without a live database using:

```bash
pnpm exec prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  -o prisma/migrations/20261113000000_init/migration.sql
```

### Seed

```bash
pnpm db:seed
```

The seed is idempotent for catalogue content and users. It does not reset `StoreSettings`, coupon usage counts or banners created by operators.

Development seed accounts:

- Admin: `admin@meridian.example` / `Admin@12345`
- Customer: `customer@meridian.example` / `Customer@12345`

Production safety:

- The seed refuses to run when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=true`.
- In production, `SEED_ADMIN_PASSWORD` and `SEED_CUSTOMER_PASSWORD` are required.
- Change or remove demo credentials before going live.

## 4. Run

```bash
pnpm dev
```

Quality gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Troubleshooting

### Prisma cannot reach the database

Check PostgreSQL is running and `DATABASE_URL` uses the correct database, user and password. URL-encode special characters in the password.

### Auth redirects to `/login`

Ensure `AUTH_SECRET` is set and the browser is not blocking the session cookie. `AUTH_URL` should match the URL used to access the site.

### Images do not load

Allowed remote image hosts are configured in `next.config.ts` (`images.unsplash.com`, `res.cloudinary.com`, `picsum.photos`). Add any new host there.

### Seed says it is refusing production data

That is intentional. Use `ALLOW_DEMO_SEED=true` only for an intentional demo environment, never for a live store with real customers.

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

### Brand and storefront copy

Edit `src/config/site.config.ts` before launching a real shop. Nothing brand-facing should be hardcoded in components or seed data.

| Area               | Fields to edit                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity           | `name`, `shortName`, `legalName`, `tagline`, `description`, `logo.wordmark`                                                                 |
| Contact            | `contact.email`, `contact.phone`, `contact.whatsapp`, `contact.hours`                                                                       |
| Address            | `address.line1`, `address.line2`, `address.city`, `address.state`, `address.postalCode`, `address.country`                                  |
| Social links       | `social[]` (`label`, `href`)                                                                                                                |
| Announcement bar   | `announcement.shipping`                                                                                                                     |
| Home hero          | `hero.eyebrow`, `hero.titleLines`, `hero.description`, `hero.imageUrl`, `hero.imageAlt`, `hero.primaryCta`, `hero.secondaryCta`             |
| Home sections      | `home.benefits`, `home.categories`, `home.featured`, `home.editorial`                                                                       |
| Footer             | `footer.contactHeading`, `footer.rightsNote`, `footer.policyLinks`                                                                          |
| Shipping           | `shipping.freeShippingThreshold` (paise), `shipping.standardFee`, `shipping.codFee`, `shipping.estimatedDays`, `shipping.returnsWindowDays` |
| Tax                | `tax.label`, `tax.rateBps`, `tax.pricesIncludeTax`                                                                                          |
| Policies           | `policies.exchangeWindowDays`, `policies.returnWindowDays`, `policies.refundProcessingDays`                                                 |
| SEO                | `seo.titleTemplate`, `seo.keywords`                                                                                                         |
| Feature flags      | `features.wishlist`, `features.reviews`, `features.coupons`, `features.guestCheckout`, `features.cod`                                       |
| Demo seed accounts | `seed.adminName`, `seed.adminEmail`, `seed.customerName`, `seed.customerEmail`                                                              |
| Theme              | `theme.*` colour tokens and `theme.radius`                                                                                                  |
| Locale/currency    | `locale`, `currency`, `currencySymbol`, `defaultCountry`, `timezone`; canonical URL comes from `NEXT_PUBLIC_SITE_URL`                       |

Money values are integer paise: `149900` is ₹1,499.00.

After changing seed-related values, run `pnpm db:seed` to refresh product brands, SEO titles and seeded accounts. The current idempotent catalog seed contains 13 categories and 30 products, including nested Winter Wear categories. `StoreSettings` is only created when absent and is not overwritten, so update it in the database (or reset a disposable database) if it already exists. `EMAIL_FROM` defaults to the configured brand and contact email when left empty.

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

- Admin: `admin@diamondselection.example` / `Admin@12345`
- Customer: `customer@diamondselection.example` / `Customer@12345`

To replace the demo catalog on a disposable development database, run `pnpm db:reset`. This resets
the database and reseeds it, including the demo accounts; do not run it against a database whose
data must be preserved.

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

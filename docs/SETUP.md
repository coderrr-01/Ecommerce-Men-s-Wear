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
- Password reset email: set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and `EMAIL_FROM`. The console
  provider does not send reset links; reset requests clearly report the missing email configuration.
- CSP rollout: `CSP_MODE=report-only` (default), `enforce`, or `off` for temporary diagnosis.

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
| Policy copy        | `policies.pages.*`; all current policy copy is draft and must be replaced before launch                                                     |
| Invoice identity   | `invoice.prefix`, `legalName`, `address.*`, `tax.gstin`, `tax.pan`                                                                          |
| Demo images/intro  | `NEXT_PUBLIC_DEMO_ASSETS_ENABLED`; production intro is off unless `NEXT_PUBLIC_INTRO_PRELOADER_ENABLED=true`                                |

Money values are integer paise: `149900` is ₹1,499.00.

### WhatsApp order requests

Before enabling checkout for customers, set `contact.whatsapp` to the shop number with country
code, set `contact.countryCallingCode` (for example `91`), and set shipping
`standardFee`/`freeShippingThreshold` in paise. The canonical `siteConfig.url` is read from
`NEXT_PUBLIC_SITE_URL`; configure that environment variable to the public HTTPS origin so product
links and token-protected order links are absolute and usable. Replace the checked-in placeholder
WhatsApp number before placing real orders.

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

For the WhatsApp checkout schema change, generate and apply a migration on development first, commit
the generated migration directory, back up production, then deploy the committed migration:

```powershell
# Development, interactive terminal:
pnpm exec prisma migrate dev --name whatsapp_checkout

# Production release, after setting production DATABASE_URL:
pnpm prisma migrate deploy
pnpm db:generate
pnpm build
```

Required production environment variables remain `DATABASE_URL`, `AUTH_SECRET` and
`NEXT_PUBLIC_SITE_URL`. Do not point production at a development/shadow database and do not run
`migrate dev` or `db reset` in production.

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
- To create an operator account and disable the configured demo admin without deleting it, run
  `pnpm admin:create -- <email> <password> <name> --disable-demo`. The account must use a unique,
  strong password. The command deactivates the configured `siteConfig.seed.adminEmail` account and
  revokes its sessions.

### Security operations

- Review [the security guide](./features/security.md) and test CSP in report-only mode before setting
  `CSP_MODE=enforce`.
- Rotate `AUTH_SECRET`: generate a new random value, update the deployment secret, and redeploy.
  Existing sessions will become invalid.
- Rotate PostgreSQL credentials at the database provider, update `DATABASE_URL` in the deployment
  secret store, and redeploy. Never paste secrets into logs, issues or source control.
- Before production, run `pnpm prisma migrate deploy` against the production `DATABASE_URL`, then
  regenerate/build and deploy. Do not run `migrate dev` in production.

## Production launch checklist

- [ ] Point the production domain/DNS and TLS certificate at Vercel. Set
      `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to the same canonical HTTPS origin.
- [ ] Set production `DATABASE_URL` to Prisma Postgres and `AUTH_SECRET` to a new random value of
      at least 32 characters. Keep credentials in Vercel environment settings, not source control.
- [ ] Configure Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
      `CLOUDINARY_API_SECRET`) and replace sample Unsplash imagery in `site.config.ts` and demo catalog
      records with approved store imagery. Keep `NEXT_PUBLIC_DEMO_ASSETS_ENABLED=false`; only turn it
      on for an intentional demo deployment.
- [ ] Configure `contact.whatsapp` with the shop's digits-only country-code number,
      `contact.countryCallingCode`, shipping fees/threshold, `shipping.returnsWindowDays`,
      `policies.returnWindowDays`, `invoice.prefix`, legal name/address and tax `gstin`/`pan`.
- [ ] Replace every policy draft in `siteConfig.policies.pages` and review shipping, returns,
      privacy, terms and contact text with qualified counsel. **REPLACE BEFORE LAUNCH** is displayed
      on the draft policy pages and remains a required manual task.
- [ ] Back up PostgreSQL and deploy only reviewed committed migrations:

  ```powershell
  $env:DATABASE_URL = "<production Prisma Postgres URL>"
  pnpm prisma migrate deploy
  pnpm db:generate
  pnpm build
  ```

- [ ] Create your production administrator using
      `pnpm admin:create -- <email> <strong-password> <name> --disable-demo`. Confirm the configured
      demo admin is disabled and revoke any demo sessions. Do not run `pnpm db:reset` in production.
- [ ] Keep `ALLOW_DEMO_SEED=false`, remove seed credentials from deployment variables and remove
      demo products/banners through the admin UI before launch. The production seed is explicitly
      gated; do not enable it for a live store.
- [ ] Configure a real email provider (`EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM`) if
      password-reset email is required. Console email is development-only and does not send mail.
- [ ] Leave `CSP_MODE=report-only` while testing the manual CSP checklist below; inspect reports
      and only then set `CSP_MODE=enforce`. Production CSP omits `unsafe-eval`; demo image hosts are
      omitted unless demo assets are explicitly enabled.
- [ ] Verify `GET /api/health`, Vercel logs/alerts, admin audit records and database backups/restore
      procedures. The health endpoint exposes only a generic database status and timestamp.
- [ ] Measure Lighthouse mobile scores on the production-like home and product pages and target at
      least 85. The production intro preloader is disabled by default to avoid delaying LCP; enable it
      only after measuring again.
- [ ] No analytics or cookie notice is included. Vercel Analytics can be considered after launch;
      it was intentionally not added.

### CSP browser checklist before enforce

Test on staging with report-only enabled: home with intro (if enabled), product detail and its
social image, cart, checkout, WhatsApp link, admin dashboard, Cloudinary image upload, invoice
download, and PWA manifest/install. Also check reduced-motion behavior and mobile navigation.

### Isolated Playwright E2E tests

Playwright is a development-only dependency. The runner refuses to start without an explicit
`E2E_DATABASE_URL` whose database name contains `e2e` or `test`, and requires a separately configured
`DATABASE_URL` to check that the URLs do not resolve to the same database. Keep `DATABASE_URL` set
to the normal development database while running E2E. Use a disposable database, never development
or production:

```powershell
$env:E2E_DATABASE_URL = "postgresql://<user>:<password>@<host>:5432/meri_shop_e2e?schema=public"
$env:DATABASE_URL = $env:E2E_DATABASE_URL
pnpm prisma migrate deploy
Remove-Item Env:DATABASE_URL
pnpm exec playwright install chromium
pnpm test:e2e
```

The E2E fixtures create and clean up uniquely prefixed products, users, coupons and orders in that
database. Browser installation is deliberately manual and is not part of normal install or Vercel
builds. E2E tests exercise coupon checkout, decoded WhatsApp content, guest-order claiming, admin
confirmation/stock, invoice download, customer isolation and the customer-to-admin redirect.

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

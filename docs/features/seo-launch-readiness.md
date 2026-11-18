# SEO and launch readiness

## Public indexing and metadata

- `/sitemap.xml` queries active, non-deleted categories and products whose category and at least one
  variant are also active. It adds public shop, contact and policy URLs.
- `/robots.txt` points crawlers to the configured site URL's sitemap and disallows admin, account,
  checkout, token-order and invoice paths. Private page layouts also emit `noindex`; invoice success
  and error responses emit `X-Robots-Tag: noindex`.
- Home, shop/category, product, contact and policy pages expose canonical URLs from
  `NEXT_PUBLIC_SITE_URL`/`siteConfig.url`, descriptions, Open Graph and Twitter metadata.
- Product link previews use `/api/og/products/{slug}`, a server-rendered 1200×630 bitmap containing
  the current product image, name and price. Product JSON-LD includes offers/availability,
  breadcrumb JSON-LD and approved-review aggregates only. The root layout emits Organization JSON-LD.

## Policies and legal review

Shipping, returns, privacy, terms and contact copy is stored in
`siteConfig.policies.pages`. Drafts are visibly marked **REPLACE BEFORE LAUNCH** and use configured
shipping, return-window, contact and address values. Review and replace all draft text before
production; this code does not provide legal advice.

## Guest-order claiming

See [orders.md](./orders.md). The single-use ownership transition requires the unguessable order
token and a matching account mobile number. It is rate limited and audited in the same transaction.
Claiming makes the order available in account history and the existing delivered-order review
eligibility query. Old token-only access to the order page and invoice ends on claim.

## Production images and LCP

`NEXT_PUBLIC_DEMO_ASSETS_ENABLED` controls Unsplash/Picsum CSP and Next Image allowlists in
production; Cloudinary remains allowed. Replace sample assets before launch and leave the flag
off. `unsafe-eval` is development-only. The intro preloader is enabled in development but disabled
in production unless `NEXT_PUBLIC_INTRO_PRELOADER_ENABLED=true`, avoiding a multi-second LCP
overlay by default.

## E2E tests

`pnpm test:e2e` runs Playwright tests against `E2E_DATABASE_URL`, whose database name must contain
`e2e` or `test` and must differ from `DATABASE_URL`. Fixtures use randomized identifiers and are
deleted after the run. Install Chromium manually with `pnpm exec playwright install chromium`.
Never point the E2E URL at development or production data.

The suite covers coupon checkout, decoded WhatsApp content, guest-order claim, admin confirmation,
stock decrement, invoice download, order/invoice ownership isolation and customer access to `/admin`.
Browser execution requires the separate database and manually installed browser.

## Verification limits

Prisma-generated launch indexes and local database application are recorded in the current
`docs/PROGRESS.md`. Lighthouse mobile scores, actual social previews on WhatsApp, authenticated
browser flows and Vercel serverless behavior require staging verification. Target Lighthouse mobile
score is at least 85 on home and product pages.

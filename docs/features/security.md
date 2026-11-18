# Security hardening

## Headers and CSP

`next.config.ts` adds MIME sniffing protection, a strict referrer policy, a restrictive
Permissions-Policy, frame denial and production HSTS. `src/proxy.ts` creates a per-request nonce
and attaches a Content Security Policy. `CSP_MODE` defaults to `report-only`; `enforce` applies it,
and `off` disables CSP temporarily. The policy supports Next.js nonce scripts/styles, local fonts,
Cloudinary and storefront image hosts, Cloudinary uploads, the intro guard script, workers and the
PWA manifest. CSP reports are bounded and omit full URLs.

Before enforcement, manually test:

1. Home page and intro preloader, including reduced-motion mode.
2. Product details, image gallery and review section.
3. Cart and checkout.
4. WhatsApp click-to-chat link.
5. Admin dashboard and catalog pages.
6. Cloudinary image upload.
7. Invoice PDF download.
8. PWA manifest and install flow.

Production `script-src` omits `unsafe-eval`. Unsplash/Picsum image hosts are enabled in development
or when `NEXT_PUBLIC_DEMO_ASSETS_ENABLED=true`; production should leave the flag off after replacing
sample imagery. The production intro is disabled unless `NEXT_PUBLIC_INTRO_PRELOADER_ENABLED=true`,
so it cannot cover the home page's LCP by default.

## Rate limiting and authentication

The shared limiter stores only HMAC-SHA-256 key hashes (keyed by `AUTH_SECRET`) and fixed-window counters in PostgreSQL. Expired
rows are opportunistically removed in small batches. Public actions fail open if the limiter
database is unavailable; login and reset flows fail closed. Login attempts are scoped to normalized
email plus IP with a 15-minute window; all login failures have the same public message.

Passwords require at least ten characters, a letter and a number, and reject a common-password
denylist. Password reset uses a random one-time token whose SHA-256 hash is stored for 30 minutes.
Consumption and password/session-version updates are transactional. Reset requests never reveal
account existence. Email must be configured with Resend; the console adapter is not treated as an
email service. Password updates revoke all existing sessions; ADMIN/STAFF sessions expire after
eight hours.

## Admin boundary and audit

Server actions and admin API routes re-check the active user and role. Sensitive catalog, stock,
order and coupon changes create `AdminAuditLog` records. Audit details must contain only entity IDs,
operation names and non-PII state. Destructive catalog/image/coupon archival actions are ADMIN-only.
There is no user-role management action yet; future role changes must be ADMIN-only and audited.

| Surface                                | Guard                                                           |
| -------------------------------------- | --------------------------------------------------------------- |
| Product save, slug check, bulk change  | ADMIN/STAFF; product delete ADMIN                               |
| Category create/update/delete          | ADMIN/STAFF; delete ADMIN                                       |
| Product image metadata/order/delete    | ADMIN/STAFF; delete ADMIN                                       |
| Product image upload route             | ADMIN/STAFF; DB rate limit, byte-signature MIME and size checks |
| Inventory update/bulk/export           | ADMIN/STAFF                                                     |
| Order status/details/export            | ADMIN/STAFF                                                     |
| Coupon save/check                      | ADMIN/STAFF for save; public rate-limited check                 |
| Coupon archive                         | ADMIN                                                           |
| Review moderation and return decisions | ADMIN/STAFF                                                     |
| Admin messages export                  | ADMIN/STAFF                                                     |

Image bytes are validated as JPEG, PNG or WebP; request size is bounded. User-facing errors do not
include stack traces. Structured logs redact email, phone and address fields and mask email/phone
patterns in free text.

## Deployment checklist

1. Back up production data and deploy the additive migration with `pnpm prisma migrate deploy`.
2. Set `DATABASE_URL`, a unique 32+ character `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`,
   `CSP_MODE=report-only`, and Resend variables if password-reset email is enabled.
3. Create a private admin account with `pnpm admin:create -- <email> <password> <name> --disable-demo`.
4. Verify the CSP report endpoint and manual pages listed above before changing `CSP_MODE=enforce`.
5. Rotate `AUTH_SECRET` by generating a new value and redeploying; this invalidates current sessions.
6. Rotate PostgreSQL credentials at the provider, update `DATABASE_URL`, and redeploy.
7. Run `pnpm audit` and review findings during each dependency update.

## Verification gaps

Local migration application and Prisma Client generation are confirmed. Browser CSP coverage, Vercel
serverless behavior, production email delivery and the complete server-action/schema audit still
require deployment/manual verification. No external monitoring dependency was added.

## Dependency audit findings (2026-11-18)

`pnpm audit` reports three transitive advisories:

| Severity | Package                   | Advisory summary                                                                                        | Decision                                                                                                                              |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| High     | `deepmerge-ts` `<8.0.0`   | Stack exhaustion with recursive object graphs; arrives through pinned Prisma 6.19.3 / `@prisma/config`. | Not overridden: v8 is a major version outside the Prisma dependency range; upgrade Prisma only after separate compatibility review.   |
| High     | `picomatch` `<=4.0.7`     | ReDoS through repeated extglobs; arrives through `eslint-config-next`.                                  | The audit currently lists no patched version; keep the dependency chain unchanged and monitor upstream.                               |
| Moderate | `minimatch` `>=7 <11.0.1` | Glob-parts amplification; the flagged copy is a transitive TypeScript/ESLint tool dependency.           | The fix requires a major override to v11, which may violate consumer ranges; defer until the toolchain publishes a compatible update. |

No dependency was added or upgraded as part of this hardening task.

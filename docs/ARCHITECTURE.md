# Architecture

## Stack

- Next.js 16.4 App Router, React 19, TypeScript strict.
- Tailwind CSS v4 and vendored shadcn/ui-compatible primitives.
- Prisma 6.19 with PostgreSQL.
- Auth.js / NextAuth 5 beta with credentials and JWT sessions.
- Zod 4 for validation.
- Vitest 5 for unit tests.

## Layering

```
UI (pages, components)
  -> server action / route handler
    -> feature service (business rules, mapping)
      -> feature repository (Prisma queries)
        -> Prisma client
```

Rules:

1. UI never imports Prisma. Server components call services; client components call server actions.
2. Server actions and route handlers validate input and return `{ success, data?, error? }` where an API shape is needed. Form actions return a small serialisable state object.
3. Repositories own database access. Services own business decisions, DTO mapping and provider calls.
4. Pure rules (money, stock, URL building) live outside `server-only` modules so they can be unit tested.
5. Database writes that depend on a read (stock checks, cart quantity merges) run inside `prisma.$transaction`.

Feature modules live under `src/features/<feature>/` with `actions`, `components`, `schemas`, `repositories`, `services`, `types`, `hooks` and optionally `utils.ts`.

## Rendering and caching

- Database-backed pages declare `export const dynamic = "force-dynamic"`.
- `SiteHeader` reads the session and cart count, so every store page is request-time.
- Next 16 route `params` and `searchParams` are promises and must be awaited.
- Next 16 renamed middleware to Proxy. The only proxy file is `src/proxy.ts`; do not add `middleware.ts`.
- Proxy performs optimistic redirects only. Every account/admin layout and server action re-checks authorization against the database.

## Authentication

- `src/auth.ts` defines NextAuth: credentials provider, JWT strategy, role in token/session.
- `src/features/auth/services/session.service.ts` exposes cached `getCurrentUser`, `requireUser` and `requireRole`.
- `getCurrentUser` re-reads the user and checks `isActive`/`deletedAt`, so deactivation and role changes take effect without waiting for token expiry.
- Passwords are hashed with bcrypt (cost 12). Unknown emails still run a dummy bcrypt comparison to reduce timing leakage.
- Roles: `CUSTOMER`, `STAFF`, `ADMIN`. Admin routes accept `ADMIN` and `STAFF`.

## Configuration

- `src/config/site.config.ts` is the single source for brand, contact, social, storefront copy (announcement, hero, home sections, footer), shipping, tax, policies, SEO and demo-seed defaults.
- `src/config/theme.ts` converts theme values into CSS variables injected by the root layout.
- `prisma/seed.ts`, `prisma/seed-data.ts` and operational scripts read brand/contact/commerce defaults from `site.config.ts`; do not reintroduce literals there.
- Root layout must keep `data-scroll-behavior="smooth"` while `globals.css` enables smooth scrolling, otherwise Next.js 16 emits a dev overlay warning.
- `src/config/navigation.ts` owns store, account and admin navigation.
- `src/config/constants.ts` owns page sizes, sort options, status labels and placeholders.

## Providers

Provider contracts are in `src/lib/providers/`:

- Payment: mock (development) and Razorpay; factory `getPaymentProvider`.
- Storage: Cloudinary upload/delete behind `StorageProvider`.
- Email: console and Resend.
- SMS: console only.

Business logic must depend on the interfaces, not provider SDKs. Razorpay is implemented with `fetch` and HMAC verification helpers.

## Errors and money

- `AppError` subclasses carry stable API codes and HTTP statuses.
- `executeAction` wraps non-form server actions and normalises/logs failures.
- Money is always an integer in paise. Formatting happens only at the presentation boundary with `formatPrice`.
- Order numbers are generated server-side (`DS-YYYYMMDD-XXXXXXXX`) and protected by a unique
  database constraint; collisions are retried.
- WhatsApp checkout creates the pending order/items and clears its user/guest cart transactionally.
  Stock is decremented when staff confirms the order and restored on eligible cancellation.
- Guest orders are viewed only through a high-entropy token paired with the human-readable order
  number; sequential order numbers alone are not authorization.
- Customer order history is scoped by `userId`; customer invoice queries use an owner-scoped
  database filter, staff role or guest bearer token and return 404 for unauthorized order numbers.
- Status history is transactional and separate from admin-only internal notes. Invoice counters
  and assignments commit together to prevent gaps from retries.

## Testing

- `tests/unit/**/*.test.ts`; no database is required.
- Tests must not import `server-only` modules, repositories or services that touch Prisma.
- Pure logic is extracted to `utils.ts`, schemas or stock rules.
- Quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Known gaps

- Online payment capture/webhooks, refunds, tax/coupons and stock reservation are not implemented.
  The current WhatsApp flow records order requests and does not collect money.
- PDF invoice generation is server-side through PDFKit on Node.js and requires deployment tracing
  for its bundled OFL fonts.
- Category/product/variant CRUD, product images, inventory adjustments, order management, dashboard
  metrics and account order history are implemented in feature layers; customer management,
  settings, wishlist, reviews, address management and password reset remain incomplete.

See `PROGRESS.md` for the next milestones.

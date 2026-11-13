# ADR 0001: Next.js 16 App Router and Proxy

- Status: Accepted
- Date: 2026-11-13

## Context

The project targets Next.js 16.4, which changes conventions from earlier App Router versions:

- Middleware is named Proxy (`src/proxy.ts`). Having both `middleware.ts` and `proxy.ts` is an error.
- Route `params` and `searchParams` are promises.
- The default runtime for proxy is Node.js.
- Turbopack is the build/dev bundler, with Tailwind v4 handled by `@tailwindcss/turbopack`.
- Agent guidance in `AGENTS.md` requires reading the bundled docs before coding.

## Decision

- Use the App Router exclusively under `src/app` with route groups: `(store)`, `(auth)`, `(account)`, `admin`.
- Put the single proxy at `src/proxy.ts`. Use it only for optimistic cookie redirects, never as the sole authorization layer.
- Await all dynamic route values.
- Mark DB-backed pages `force-dynamic`.
- Keep branding and design tokens in config modules and generate CSS variables at runtime.

## Consequences

- Developers must consult `node_modules/next/dist/docs/` for APIs that differ from older versions.
- Proxy handles redirect UX; layouts/actions enforce authorization against the database.
- Static optimisation is limited on storefront pages because the header depends on session/cart state. This is acceptable for a commerce app with personalised navigation.
- Do not reintroduce `middleware.ts` or synchronous `params`.

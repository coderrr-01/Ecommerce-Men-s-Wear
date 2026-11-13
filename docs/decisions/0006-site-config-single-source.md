# ADR 0006: Site config is the single source for brand and storefront copy

- Status: Accepted
- Date: 2026-11-13

## Context

Brand name, contact details, social links, hero copy, footer labels, shipping thresholds and demo seed values were spread across components, seed files and scripts. Renaming the shop required edits in several places and risked inconsistencies between the storefront and seeded database content.

## Decision

- Keep brand identity, contact details, social links, announcement/hero/home/footer copy, shipping/tax/policy defaults, SEO defaults and demo-seed names/emails in `src/config/site.config.ts`.
- Components, `prisma/seed.ts`, `prisma/seed-data.ts`, `scripts/db-check.ts` and `src/env.ts` read these values from config instead of duplicating literals.
- Derive brand-dependent values (SEO title template, editorial eyebrow, demo admin name, default email sender) from the configured brand name.
- Keep the seed's `StoreSettings` upsert non-destructive: config is the default for a new database, while an existing database may hold operator overrides.
- Keep money values in integer paise in config.

## Consequences

- Changing the shop name, contact details or storefront copy is a single-file edit.
- Seeded product brands and SEO titles refresh on `pnpm db:seed`; existing `StoreSettings` must be updated manually or in a disposable database.
- The config is imported by both server and client components, so it must remain free of secrets and server-only imports. Provider secrets stay in environment variables.

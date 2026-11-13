# Catalogue and storefront

## Routes

| Route              | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `/`                | Config-driven hero, featured products, category tiles and editorial section |
| `/shop`            | Catalogue listing with filters, sorting, pagination                         |
| `/products/[slug]` | Gallery, variant selection, stock state, add-to-cart panel                  |

All catalogue pages are `force-dynamic` because the header reads the session/cart and the content comes from PostgreSQL. The home page's announcement, hero, benefit strip, section headings, editorial copy and images come from `src/config/site.config.ts`; product and category content come from services and the database.

## Data flow

```
page (server component)
  -> catalog.service
    -> catalog.repository (Prisma)
      -> map to catalogue DTOs
        -> ProductCard / ProductGrid / Gallery / PurchasePanel
```

Repositories filter `deletedAt: null` and `isActive: true` (plus active category and variants where relevant). Services map prices into presentation data and compute rating aggregates.

## Filters and sorting

`/shop` accepts:

- `q` — case-insensitive name/description search.
- `category` — category slug.
- `sort` — `newest`, `price-asc`, `price-desc`, `name-asc`, `name-desc`.
- `page` — 1-based page.

DEFAULTS: 12 items per page, maximum 60. Sorting by price uses `Product.basePrice`, maintained by the seed/admin writes, so it is database-sortable rather than in-memory. Query strings are built through `catalog.utils` and covered by unit tests.

## Product detail

- Loaded by unique slug with images and active variants.
- Variant selection drives price, compare-at price, stock and add-to-cart input.
- Gallery uses the first image as primary fallback.
- Metadata is generated from product SEO fields/name/description.
- Missing or inactive products call `notFound()`.

## Images

Allowed next/image hosts are declared in `next.config.ts`:

- `images.unsplash.com`
- `res.cloudinary.com`
- `picsum.photos`

Fallback asset: `public/placeholder.svg`.

Above-the-fold primary images use `preload`, and gallery thumbnails use `loading="eager"` so Next.js does not emit LCP dev warnings. The `priority` prop is deprecated in Next.js 16.

## Seed catalogue

`prisma/seed-data.ts` provides 5 categories and 15 menswear products with size/colour variants, images and size guides. Product brand values and store settings come from `src/config/site.config.ts`. Product `basePrice` is derived from the lowest/first variant price so list sorting matches displayed pricing.

## Known gaps

- No faceted size/colour/price filters yet.
- No search index or fuzzy search; current search uses `contains` with `mode: "insensitive"`.
- No category landing pages beyond `/shop?category=`.
- No stock reservation while browsing; stock is checked when adding/updating the cart.

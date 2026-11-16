# Catalogue and storefront

## Routes

| Route              | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `/`                | Config-driven hero, featured products, category tiles and editorial section |
| `/shop`            | Catalogue listing with filters, sorting, pagination                         |
| `/products/[slug]` | Gallery, variant selection, stock state, add-to-cart panel                  |

All catalogue pages are `force-dynamic` because the header reads the session/cart and the content comes from PostgreSQL. The home page's announcement, hero, benefit strip, section headings, editorial copy and images come from `src/config/site.config.ts`; product and category content come from services and the database.

## Storefront presentation

- The home page uses a full-bleed configured hero, category tiles, trust-benefit strip, configurable
  shipping promotion, horizontally scrollable featured products and an editorial grid.
- Shop filters use existing catalog query contracts for category, size, sort and text search; a local
  price slider applies only to the currently loaded page, and colour filters remain disabled until
  variant data is part of the listing DTO.
- Product imagery supports thumbnail selection, mobile swipe and a native image zoom dialog.
  Purchase controls keep the existing server action and include a mobile sticky add-to-bag bar.
- Product cards expose a quick-view detail link and guest wishlist control. Recently viewed products
  are stored in localStorage. Search offers debounced category suggestions and recent terms.
- The cart drawer renders the signed-in cart snapshot, shipping threshold progress and line items;
  quantity changes/removals remain on the full cart page.
- Shop loading and storefront not-found UI are route-group components. PWA metadata and a
  theme-configured diamond icon support install prompts without offline caching.
- See `ui-design-system.md` for tokens, typography, motion and rebranding.

## Data flow

```
page (server component)
  -> catalog.service
    -> catalog.repository (Prisma)
      -> map to catalogue DTOs
        -> ProductCard / ProductGrid / Gallery / PurchasePanel
```

Repositories filter `deletedAt: null` and `isActive: true` (plus active category and variants where relevant). Services map prices into presentation data and compute rating aggregates.

## Admin catalog management

The admin routes `/admin/categories` and `/admin/products` provide nested category CRUD,
search/filter/paginated products, bulk status changes, and product/variant create and edit forms.
Product inputs use Zod schemas, unique slug/SKU checks and size-set validation. Prices are entered
as rupees and converted exactly to integer paise before persistence. Product and variant changes are
written through the catalog service/repository layers; stock deltas create `StockMovement` records.

The edit screen manages up to eight images per product. Its guarded multipart route validates
JPEG/PNG/WebP bytes and a 5 MB file limit before using the `StorageProvider`. Image order, primary
selection and alt text are persisted; deletion is ADMIN-only and soft-deletes the gallery record.
Cloudinary credentials are server-only. When storage is unconfigured the editor explains the
limitation rather than crashing.

Draft and soft-deleted products remain excluded from storefront product queries. Soft-deleted
images are likewise excluded from product cards and product detail galleries.

See [admin-panel.md](./admin-panel.md), [inventory.md](./inventory.md) and [API.md](../API.md) for
roles, action contracts and audit behavior.

## Filters and sorting

`/shop` accepts:

- `q` — case-insensitive name/description search.
- `category` — category slug.
- `sort` — `newest`, `price-asc`, `price-desc`, `name-asc`, `name-desc`.
- `page` — 1-based page.

The listing's optional price slider filters only the products loaded on the current page; it does
not claim a database-wide price facet. Available filters are category, size, search and sort.

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

The active product-gallery image is loaded eagerly with responsive `sizes`; offscreen thumbnails
remain deferred. The `priority` prop is deprecated in Next.js 16.

## Seed catalogue

`prisma/seed-data.ts` provides 13 categories (10 top-level and 3 Winter Wear children) and 30
menswear products with size/colour variants, images and size guides. Tops use S–XXL, bottoms use
waist sizes 28–42, and socks/gloves/topis/sarong use `Free Size`. Product brand values and store
settings come from `src/config/site.config.ts`. Product `basePrice` is derived from the lowest/first
variant price so list sorting matches displayed pricing. Run `pnpm db:reset` on a disposable
development database to apply the updated demo catalog.

## Known gaps

- No database-backed price facet or colour filter yet; the price control is current-page-only.
- No search index or fuzzy search; current search uses `contains` with `mode: "insensitive"`.
- No category landing pages beyond `/shop?category=`.
- No stock reservation while browsing; stock is checked when adding/updating the cart.
- Product cards expose one image and no variants, so quick view routes to the detail page instead of selecting options or adding directly to cart.
- Per-product garment measurements are not part of the detail DTO; the size helper is only a general suggestion, and the guide directs customers to contact support.
- Guest wishlist and recently viewed items are local to the browser and do not sync with accounts.

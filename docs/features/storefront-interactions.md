# Storefront interactions

## Motion and navigation

- Shared animation values live in `src/lib/motion.ts`; the root `MotionProvider` honors the user's
  reduced-motion preference.
- The store header responds to scroll direction, exposes grouped desktop/mobile category navigation
  and provides a debounced search dialog with category suggestions and recent terms.
- Search terms and recently viewed products are stored in browser `localStorage`; blocked or invalid
  storage is surfaced instead of silently reporting success.
- The home hero supports manual controls and touch swipes. Product galleries support thumbnails,
  touch/keyboard navigation and click-to-zoom.
- The floating scroll-progress indicator, back-to-top control and WhatsApp link are configured from
  site settings. WhatsApp stays hidden until a real number replaces the placeholder.

## Catalog and product selection

- Catalog category, size, sort and text-search controls reuse the existing server-backed listing
  contract. The local price range only filters the currently loaded page; colour filtering is
  disabled because listing data does not include variant colours.
- Product quick view is a detail-page shortcut. Variant selection and add-to-cart remain on the
  product page, where active variant data is available.
- The size helper uses height, weight, fit preference and in-stock letter sizes to make a general
  suggestion. It is not a garment-measurement chart; numeric/free-size styles require support
  guidance.
- Guest wishlist and recently viewed entries use versioned localStorage records containing only
  serializable product-card data. On login, wishlist IDs merge into the authenticated database
  wishlist; recently viewed history remains device-specific.

## Cart and unavailable services

- The cart drawer displays the signed-in server cart, line items and progress toward the configured
  free-shipping threshold. Adding an item opens the drawer after the existing action succeeds and
  refreshes the server-rendered cart summary.
- Quantity changes and removals continue through existing cart actions on `/cart`. WhatsApp
  checkout recomputes coupon discounts from the database inside order creation; no online payment is
  collected.
- Newsletter signup and `/contact` now store submissions through validated, rate-limited actions.
  Contact success confirms storage only and does not claim an email was sent.
- The PWA manifest and generated theme-colored icon enable installation metadata only. No offline
  caching or service worker is included.

## Verification boundaries

Unit tests cover local wishlist storage, recently viewed ordering/capacity, size suggestion rules
and catalog seed category/size requirements. Browser/device checks and real-database seed
verification must be recorded separately; successful build or unit tests do not imply either.

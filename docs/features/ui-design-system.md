# Storefront design system

The storefront UI is built on Tailwind CSS v4 utilities and the shared primitives in
`src/components/ui`. The theme is light-first and uses CSS custom properties so a future dark
theme can override the same semantic names.

## Tokens

`src/config/theme.ts` injects the configured theme from `siteConfig.theme` into `:root`.
`src/app/globals.css` maps those variables to Tailwind colors and adds semantic aliases:

The current Diamond Selection palette uses deep ink/navy, diamond white and a restrained gold
accent. Edit `src/config/site.config.ts` only; generated storefront icons and CSS variables read
the same config values.

| Token                        | Source                                       |
| ---------------------------- | -------------------------------------------- |
| `background` / `foreground`  | `siteConfig.theme.background` / `foreground` |
| `surface`                    | `siteConfig.theme.card`                      |
| `muted` / `muted-foreground` | `siteConfig.theme.muted` / `mutedForeground` |
| `border` / `input` / `ring`  | Matching `siteConfig.theme` entries          |
| `primary` / `accent`         | `siteConfig.theme.primary` / `accent`        |
| `success`                    | Alias of `accent`                            |
| `danger`                     | Alias of `destructive`                       |

Components should use semantic utilities such as `bg-background`, `bg-surface`,
`text-muted-foreground`, `border-border`, `text-accent`, `text-success`, and `text-danger`.
Do not add brand palette literals to component files.

## Typography and layout

`src/components/shared/fonts.ts` loads DM Sans for interface text and Cormorant Garamond for
editorial headings with `next/font`. Store, auth and account layouts apply the font variables
within their route groups. `font-sans` and `font-serif` are mapped in `globals.css`, with system
fallbacks available outside those route groups.

Use the existing Tailwind spacing scale (4px increments, with common section spacing at 16/24),
the configured `--radius` scale, and subtle border/shadow utilities. Content widths are capped at
1440px for the storefront and should remain fluid on small screens.

## Shared components

- `src/components/ui`: Button, Input, Label, Badge and Card.
- `src/components/layout`: responsive storefront header, menu/search/cart dialogs and footer.
- `src/features/catalog/components`: product cards/grids, home sections, filters, gallery, purchase
  panel, size guide and product story.
- `src/features/cart/components`: cart quantity stepper.
- `src/features/auth/components`: login and registration forms with password visibility controls.

Keep data access in server pages and existing services. Interaction-only components use existing
server actions and DTOs; they must not import Prisma or repositories.

## Rebranding

Change brand identity, copy, contact details, social links, shipping threshold, and the theme in
`src/config/site.config.ts`. `src/config/theme.ts` carries the configured color values into CSS, and
the storefront reads its hero, navigation, benefits and footer content from existing configuration.
No component-level brand palette needs updating for a theme change.

## Motion and accessibility

- `src/lib/motion.ts` is the source for shared durations, easing curves, spring presets and reveal
  variants. `MotionProvider` applies `reducedMotion="user"` globally.
- Use tween/easing transitions for animations with more than two keyframes; spring transitions
  support single-target or two-keyframe motion.
- Animate opacity and transforms only. Avoid layout-affecting motion, large blurred surfaces and
  animated shadows; use `whileInView`/IntersectionObserver reveals once per section.
- Route transitions, hero slide changes, navigation indicators, gallery crossfades, cart drawer
  entrance and small control feedback use the shared motion system. CSS keyframes are reserved for
  simple marquee/skeleton effects and must honor the reduced-motion media query.
- The home header transitions from transparent over the hero to a blurred solid surface; it hides on
  downward scroll and returns on upward scroll. The progress bar and parallax do not change layout.
- Touch and keyboard must expose the same actions as hover: image controls, quick view, wishlist,
  category navigation, size selection and cart actions all have semantic buttons/links and visible
  focus states.
- `prefers-reduced-motion` disables parallax and nonessential movement; retain concise opacity
  changes and make programmatic scroll behavior non-animated.
- Keep keyboard focus visible, use native `dialog` and `details` controls, label icon-only buttons,
  preserve descriptive image alt text, and retain loading/status/error semantics.
- Load the active product-gallery image eagerly and defer inactive thumbnails. Keep a selected
  thumbnail's loading state aligned when it shares the LCP image URL; preload only the first hero
  slide and keep slides eager once shown. Avoid duplicate image URLs for distinct layout roles,
  preload only stable LCP candidates, and set responsive `sizes` on `next/image`.

## Responsive layout

- Use a mobile-first layout and preserve 44px minimum interactive targets and safe-area insets.
- Store pages reserve room for the mobile bottom navigation and floating controls.
- Verify at 360, 390, 768, 1024 and 1440px before release; do not infer browser verification from
  typecheck or build output.
- The search overlay, menu and cart use native dialogs for Escape handling and focus management.

## Known UI constraints

- Product-card data contains one image and no variant choices. Quick view links to the product page
  for size/colour selection; it does not offer a fabricated card-level add-to-cart action or image
  crossfade.
- Search suggestions come from categories and browser-local recent terms; actual product search is
  submitted to the existing catalog listing.
- Guest wishlist and recently viewed products use localStorage and are not account-synchronized.
- Newsletter enrollment is disabled and marked as coming soon. Checkout remains disabled.
- Size suggestions are a general heuristic for available lettered sizes, not a garment-measurement
  guarantee. Numeric/free-size styles direct shoppers to contact support.

# Storefront design system

The storefront UI is built on Tailwind CSS v4 utilities and the shared primitives in
`src/components/ui`. The theme is light-first and uses CSS custom properties so a future dark
theme can override the same semantic names.

## Tokens

`src/config/theme.ts` injects the configured theme from `siteConfig.theme` into `:root`.
`src/app/globals.css` maps those variables to Tailwind colors and adds semantic aliases:

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

- The home header transitions from a transparent hero state to a solid sticky state after scroll.
- Dialogs and cart/menu drawers use short CSS transitions; product and category imagery use
  transform-only hover zoom.
- Home sections use the CSS view timeline where supported. `prefers-reduced-motion` disables
  nonessential animation and smooth scrolling.
- Keep keyboard focus visible, use native `dialog` and `details` controls, label icon-only buttons,
  preserve descriptive image alt text, and retain loading/status/error semantics.
- Load the active product-gallery image eagerly and defer offscreen thumbnails. Preload only stable
  LCP candidates, and set responsive `sizes` on `next/image`.

## Known UI constraints

Wishlist persistence, newsletter enrollment, and checkout are not implemented. The product-card DTO
currently exposes one image and no variants, so cards do not claim a second-image preview or
quick-add. The cart drawer is a lightweight count/route summary; detailed line items and totals stay
on the full cart page. These surfaces should be connected when their underlying feature contracts
are available.

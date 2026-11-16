# Decision 0008: Storefront motion and carousel libraries

## Status

Accepted

## Context

The storefront needs consistent, responsive motion and touch-friendly product carousels without
introducing a broad animation framework stack.

## Decision

- Use `motion` (the Framer Motion package) for focused interactive animations.
- Use `embla-carousel-react` for drag-enabled storefront carousels.
- Centralize durations, easing curves, spring presets and reusable variants in `src/lib/motion.ts`.
- Set Motion's `reducedMotion` mode to `user` globally; keep CSS fallbacks compatible with
  `prefers-reduced-motion`.
- Keep animations to opacity and transforms, and load heavy interactive surfaces only where needed.

## Consequences

Interactive components add client JavaScript, so server-rendered page content remains the default.
No additional animation or carousel dependencies are approved by this decision.

# Home intro preloader

The optional intro is mounted once in the store layout, but only displays on the home route (`/`).
It is a visual overlay: it does not replace the home page or its hero. The normal hero image remains
the page's LCP candidate. No dependency, route, server action, database, or checkout behavior is
added.

## Behavior

- The intro runs on the first eligible home visit, then skips until its configured replay interval
  expires. Add `?intro=1` to the home URL to force a replay.
- It does not run on product, cart, account, auth, or admin routes.
- Before hydration, a tiny inline guard checks the route and local timestamp to avoid flashing the
  page through. Intro image requests use low fetch priority; fonts and images have a three-second
  readiness limit. A timeout or unavailable asset skips the full sequence and uses a short fade.
- Scroll is locked only while the overlay is active and is restored on completion or unmount. The
  intro overlay is removed from the DOM when finished.
- Reduced-motion users receive a 300ms fade instead of the animated sequence.
- Its accessible status is announced while active; the page content remains in the accessibility
  tree, and the status is hidden during handoff.

## Configuration

Edit `intro` in `src/config/site.config.ts`. Accent/background/surface colors are not duplicated in
the component or stylesheet: they use the semantic CSS variables generated from `siteConfig.theme`.

| Setting                                       | Current value       | Purpose                                                      |
| --------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| `enabled`                                     | `true`              | Enables or disables the intro                                |
| `brandWord`                                   | `DIAMOND SELECTION` | Two-line wordmark; “SELECTION” is styled at 65% of “DIAMOND” |
| `images`                                      | 6                   | Product-card images and descriptive config alt text          |
| `durations.seedMs`                            | 500ms               | Diamond mark and center line; line fades out after drawing   |
| `durations.buildMs`                           | 2300ms              | Wordmark and product-card reveal phase                       |
| `durations.cardEnterMs` / `cardStaggerMs`     | 600ms / 300ms       | Individual card entrance and stagger                         |
| `durations.letterEnterMs` / `letterStaggerMs` | 600ms / 85ms        | Letter reveal and stagger                                    |
| `durations.glitchMs`                          | 100ms               | Brief letter accent glitch                                   |
| `durations.counterMs`                         | 3000ms              | Counter progression while the sequence builds                |
| `durations.exitMs`                            | 450ms               | Card and counter exit                                        |
| `durations.curtainMs`                         | 800ms               | Wordmark and curtain transition                              |
| `durations.handoffMs`                         | 450ms               | Final overlay fade                                           |
| `durations.reducedMotionMs`                   | 300ms               | Reduced-motion / skipped-asset fade                          |
| `durations.preloadTimeoutMs`                  | 3000ms              | Maximum wait for fonts and intro images                      |
| `durations.failsafeMs`                        | 5500ms              | CSS guard fallback for an interrupted client start           |
| `playOnceHours`                               | 24                  | Time before the normal first-visit intro can replay          |
| `rotationRangeDeg`                            | 10                  | Card rotation range, from -10° to +10°                       |
| `counterEnabled`                              | `true`              | Enables or disables the 000–100 counter                      |

Change image sources and their alt text together. The number of cards is the number of entries in
`images`; no separate card-count setting is needed. The configured theme values remain the source
for foreground, background, surface and accent colors.

## Troubleshooting

- **Overlay looks stuck:** wait for the configured failsafe, then reload. Confirm the browser can
  load all configured image URLs and that `intro.enabled` is true. `?intro=1` bypasses the normal
  timestamp check for testing.
- **Scroll remains locked:** a normal finish, route change, or unmount removes the lock. Reloading
  clears any stale document state; the CSS failsafe also releases the initial guard if startup is
  interrupted.
- **Fonts arrive late:** the preloader waits no longer than `preloadTimeoutMs`; it skips the full
  animation if assets are not ready. The site remains available and the home hero loads independently.
- **Intro does not play again:** clear `diamond-selection:intro:last-played` in localStorage or use
  `?intro=1`. A forced replay still only applies on `/`.

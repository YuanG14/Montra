# Phase 13 — Animations & Micro-interactions

## Included
- Brief, restrained entrance motion for page content, panels, subscription cards and dashboard metrics.
- Staggered appearance for the first subscription cards without adding artificial loading delays.
- Press feedback for buttons and calendar cells.
- Small tile feedback on subscription-card hover.
- Animated menu opening, toast appearance and dialog/backdrop entrance.
- Focus and interaction transitions remain subtle and consistent in light and dark themes.
- `prefers-reduced-motion: reduce` disables entrance animations and nonessential transitions.

## Preserved
- Existing React components, routes, subscription fields and calculations.
- Existing localStorage key `subtrack.v1` and theme toggle behavior.
- No new dependencies, backend, or data migrations.

## Verification
- Run `npm test` for automated utility and static regression tests.
- Run `npm run build` after installing dependencies.
- Manually inspect desktop/mobile layouts in both themes, dialog open/close behavior, and reduced-motion mode in a browser.

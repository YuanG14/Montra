# Montra — Subscription tracker

Version 0.15.0 — Responsive & Mobile Experience

Montra is a React + Vite subscription tracker focused on helping people keep track of recurring subscriptions, understand their spending, and remember upcoming renewals. Subscription data is stored locally in the browser in this release.

## Run it

1. Install Node.js (LTS recommended).
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the local address Vite prints (usually `http://localhost:5173`).

Production build: `npm run build`  
Preview a production build: `npm run preview`  
Run core utility tests: `npm test`

## Current features

- Public landing page with product overview, feature highlights, how-it-works steps and calls to action. The dashboard remains available separately at `#/overview`.
- Shared UI design system with semantic color, spacing, radius and shadow tokens; consistent controls, cards, dialogs, focus states and responsive refinements.

- Overview: monthly and yearly subscription totals, budget ring, upcoming renewals and overlap tip.
- Cards: search, filter, sort, add, edit, pause, cancel and delete subscriptions.
- Cancel guide: cancellation guidance for popular services.
- Calendar: monthly renewal calendar, selected-day details and upcoming renewal list.
- Insights: monthly and annual recurring-spend estimates, category breakdown, budget usage, highest recurring costs and billing-frequency mix.
- Reminders: in-app renewal reminders and reminder timing settings.
- Settings: currency, monthly budget and reminder preferences.

## Data compatibility

Existing subscription data remains under the original localStorage key `subtrack.v1` so the Montra rebrand does not discard existing browser data. Removing the import feature does not delete or migrate subscription records. Clearing browser site data will still erase locally stored subscriptions.

## Project structure

- `src/App.jsx`: app shell and navigation.
- `src/pages.jsx`: Overview, Cards and Cancel Guide.
- `src/CalendarPage.jsx`: monthly renewal calendar and selected-day details.
- `src/InsightsPage.jsx`: recurring-spend insights and category analytics.
- `src/lib/insights.js`: pure calculations for spending summaries and breakdowns.
- `src/lib/calendar.js`: renewal occurrence and month-grid calculations.
- `src/lib/store.js`: browser storage abstraction; future backend work will replace this layer.
- `src/lib/utils.js`: date, currency and renewal calculations.
- `src/lib/reminders.js`: renewal reminder calculations.
- `src/lib/cancel.js`: cancellation guide content and URL helpers.
- `src/Dialogs.jsx`: add/edit, settings, reminders and cancellation dialogs.
- `tests/`: Node.js tests for subscription calculation utilities.
- `public/logos/`: optional service logos.

## Current limitations

- No bank connections, statement uploads or transaction importing.
- No backend, MongoDB, user accounts or cloud sync yet.
- Reminders appear only while the app is open.
- Backup/restore, dark mode and external notifications remain planned features. Insights are estimates from entered subscription data, not actual payment history.

## Phase 5 — Calendar & Renewal Management

The in-app calendar displays active weekly, monthly and yearly renewal dates. Select a day to inspect its renewals and edit a subscription. Use the month controls to browse previous and upcoming months. See `PHASE-5-CALENDAR-TEST-CHECKLIST.md` for manual browser testing.


## Phase 6 — Insights & Analytics

The Insights page summarizes active subscriptions using normalized monthly-equivalent costs. It includes monthly/yearly projections, category spending, budget utilization, highest recurring costs, billing frequency and an estimate of renewals due in the next 30 days. These are projections based on the user-entered prices and cycles, not actual bank transactions or payment history.

## Phase 7 — Public Landing Page

The public landing page is the default entry point when no app hash is present. Its calls to action open the existing local subscription tracker at `#/overview`. The landing page is responsive and does not change the local subscription storage format or add backend dependencies.


## Phase 8 — UI Consistency & Design System

This phase establishes shared visual tokens for color, spacing, radii and elevation, then applies consistent styling to the dashboard navigation, buttons, icon controls, subscription cards, panels, form fields, menus, dialogs, calendar controls and insight panels. Hover, focus-visible, disabled and reduced-motion states are included. No subscription data structure, localStorage key, routing behavior or backend dependency is changed.


## Phase 9 — Dashboard Redesign & Visual Polish

The Overview page now has a clearer dashboard hierarchy: a page heading with the current date, a prominent monthly-spend summary with its yearly equivalent, compact counts for active subscriptions, renewals due within 30 days and paused subscriptions, and a more clearly labeled upcoming-renewals panel with a direct calendar link. The existing budget indicator, subscription cards, smart tip and reminder controls remain available. All figures are calculated from existing local subscription data; no schema, storage key, routing or backend behavior was changed.


## Phase 10 — Subscription Cards, Forms & Modal Improvements

Subscription cards now use a clearer hierarchy for service identity, category, price, billing cycle, renewal date and status. Paused and cancelled subscriptions have distinct status treatments, while trials and notes remain visible. The add/edit form is organized into basic and optional details, includes popular-service quick picks, a live brand tile preview, selectable brand colors and clearer inline validation. The existing subscription fields, status behavior, localStorage key and data format are preserved.


## Phase 11 — Responsive & Mobile Experience

The app shell and primary navigation now adapt to compact screens with a horizontally scrollable top navigation, while cards, filters, insights, calendar panels and dashboard summaries reflow for phone and tablet widths. Form dialogs use viewport-aware sizing and scrolling, calendar cells become more compact on narrow phones, and interactive controls retain touch-friendly target sizes. These changes are CSS-only and preserve existing routes, subscription data, and the `subtrack.v1` localStorage key.

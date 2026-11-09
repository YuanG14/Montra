# Phase 12 — Dark Mode & User Preferences

## Implemented
- Added Light, Dark and Use device setting appearance options to Settings.
- Persisted the appearance preference alongside existing settings in the current localStorage record.
- Added system appearance detection and live response to operating-system theme changes while System is selected.
- Added dark-theme styling for the app shell, navigation, dashboard, subscription cards, forms, dialogs, calendar, insights, menus and common status treatments.
- Kept Light as the default visual experience for existing users through the System preference when their device is in light mode.
- Preserved the `subtrack.v1` storage key and existing subscription record format.

## Automated checks
- `npm test` — run the core utility and theme contract tests.
- `npm run build` — verify the production bundle when dependencies are installed.

## Manual browser checks
- Open Settings and switch between Light, Dark and Use device setting.
- Save and reload; confirm the selected appearance persists.
- In System mode, change the operating-system appearance and confirm Montra follows it.
- Inspect Overview, Cards, Calendar, Insights, Cancel Guide, reminders and all dialogs in both themes.
- Confirm text, focus indicators, inputs, calendar selection and status labels remain legible.
- Confirm existing subscriptions remain available after changing appearance.

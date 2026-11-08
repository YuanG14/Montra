# Phase 8 — UI Consistency & Design System Test Checklist

## Shared visual language
- [ ] Confirm the light theme uses the shared neutral surfaces and purple accent consistently.
- [ ] Confirm spacing, corner radii, borders and shadows feel consistent across pages.
- [ ] Confirm subscription brand colors remain visible without overpowering card content.

## Navigation and controls
- [ ] Check top navigation active, hover and keyboard-focus states.
- [ ] Check primary and secondary buttons on Overview, Cards, Calendar and Insights.
- [ ] Check icon buttons, subscription overflow menus and disabled controls.
- [ ] Check search fields, selects, date inputs and form controls.

## Cards, panels and dialogs
- [ ] Compare subscription cards across Overview and Cards pages.
- [ ] Check panel styling on Overview, Calendar and Insights.
- [ ] Open Add/Edit, Settings, Reminders and Cancel dialogs; verify spacing and backdrop.
- [ ] Check toast appearance after saving or changing a subscription.

## Responsive and accessibility
- [ ] Check desktop width (1440px), tablet width (768px) and mobile width (390px).
- [ ] Verify navigation wraps/scrolls without hiding controls.
- [ ] Tab through controls and confirm visible focus indicators.
- [ ] Enable reduced motion and confirm decorative transitions are minimized.

## Regression checks
- [ ] Add, edit, pause, resume, cancel and delete a subscription.
- [ ] Confirm Calendar and Insights still reflect subscription changes.
- [ ] Confirm currency and monthly budget settings still work.
- [ ] Confirm existing local data remains under `subtrack.v1`.
- [ ] Confirm no import or bank-connection feature has been reintroduced.

# Montra — Phase 5: Calendar & Renewal Management

## Installation

```bash
npm install
npm test
npm run dev
```

## Browser checklist

- [ ] Calendar appears in the top navigation.
- [ ] Calendar opens and initially selects today's date.
- [ ] Previous and next month buttons change the displayed month.
- [ ] Today returns to the current month and selects today's date.
- [ ] Active weekly subscriptions appear on each renewal date.
- [ ] Active monthly subscriptions appear on their monthly renewal date.
- [ ] Month-end dates behave correctly (for example, January 31 rolls to February 28/29 and March 31).
- [ ] Active yearly subscriptions appear in the correct month.
- [ ] Paused and cancelled subscriptions do not appear.
- [ ] Selecting a date shows that date's renewals and amounts.
- [ ] Edit opens the existing subscription editor for the selected renewal.
- [ ] Upcoming this month lists future renewals in date order.
- [ ] Adding a subscription updates the calendar after saving.
- [ ] The layout remains usable on a narrow/mobile screen.
- [ ] Existing subscription records remain intact.

## Scope notes

This phase adds an in-app renewal calendar only. It does not yet export `.ics` files, sync with Google Calendar/Apple Calendar, or send notifications while the app is closed. Those remain separate future features.

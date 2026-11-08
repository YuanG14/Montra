# Phase 6 — Insights & Analytics test checklist

## Before testing
- Back up the current Montra project.
- Install dependencies with `npm install`.
- Run `npm test` and `npm run dev`.

## Navigation and empty state
- [ ] Insights appears in the top navigation.
- [ ] Selecting Insights opens `#/insights`.
- [ ] With no active subscriptions, the empty state appears and Add subscription opens the existing form.

## Metrics and calculations
- [ ] Active subscriptions contribute to recurring-spend totals.
- [ ] Paused and cancelled subscriptions are excluded from active recurring-spend totals.
- [ ] Weekly prices are converted to monthly equivalents using 52 weeks / 12 months.
- [ ] Yearly prices are divided by 12 for monthly equivalents.
- [ ] Monthly / Yearly switch changes the displayed projections.
- [ ] Average recurring cost is based on active subscriptions.
- [ ] Next 30 days estimate reflects upcoming renewal dates and billing cycles.

## Breakdowns
- [ ] Category breakdown shows active spending by category.
- [ ] Missing categories appear as Other.
- [ ] Budget usage compares monthly-equivalent costs against the monthly budget.
- [ ] Budget overage is clearly indicated.
- [ ] Highest recurring costs are sorted by monthly-equivalent price.
- [ ] Billing frequency counts match active subscriptions.

## Data and privacy
- [ ] Editing a subscription updates Insights after returning to the page.
- [ ] Pausing or cancelling a subscription updates Insights.
- [ ] Insights does not upload or save any additional financial data.
- [ ] Disclaimer explains that values are estimates, not actual payment history.
- [ ] Existing subscription records remain intact under `subtrack.v1`.

## Responsive checks
- [ ] Desktop layout displays metric cards and two-column panels.
- [ ] Tablet and mobile layouts remain readable without horizontal overflow.

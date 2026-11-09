import test from 'node:test';
import assert from 'node:assert/strict';
import { addCycle, monthly, r2, iso } from '../src/lib/utils.js';

test('monthly cost converts weekly and yearly billing cycles', () => {
  assert.equal(r2(monthly({ cost: 100, cycle: 'weekly' })), 433.33);
  assert.equal(monthly({ cost: 1200, cycle: 'yearly' }), 100);
  assert.equal(monthly({ cost: 149, cycle: 'monthly' }), 149);
});

test('monthly billing is safe at the end of a month', () => {
  assert.equal(iso(addCycle(new Date(2026, 0, 31), 'monthly')), '2026-02-28');
  assert.equal(iso(addCycle(new Date(2024, 0, 31), 'monthly')), '2024-02-29');
});

test('weekly and yearly billing dates advance correctly', () => {
  assert.equal(iso(addCycle(new Date(2026, 10, 8), 'weekly')), '2026-11-15');
  assert.equal(iso(addCycle(new Date(2026, 10, 8), 'yearly')), '2027-11-08');
});

import { renewalsInMonth, monthGrid } from '../src/lib/calendar.js';

test('calendar returns monthly renewals in the selected month', () => {
  const events = renewalsInMonth([
    { id: 'netflix', name: 'Netflix', status: 'active', nextDate: '2026-01-15', cycle: 'monthly', cost: 549 },
    { id: 'paused', name: 'Paused', status: 'paused', nextDate: '2026-01-15', cycle: 'monthly', cost: 100 }
  ], 2026, 2);
  assert.equal(events.length, 1);
  assert.equal(iso(events[0].date), '2026-03-15');
});

test('calendar handles weekly renewals and month-end billing anchors', () => {
  const events = renewalsInMonth([
    { id: 'weekly', name: 'Weekly', status: 'active', nextDate: '2026-03-01', cycle: 'weekly', cost: 10 },
    { id: 'monthend', name: 'Month end', status: 'active', nextDate: '2026-01-31', cycle: 'monthly', cost: 20 }
  ], 2026, 2);
  assert.deepEqual(events.map(x => iso(x.date)), ['2026-03-01', '2026-03-08', '2026-03-15', '2026-03-22', '2026-03-29', '2026-03-31']);
});

test('calendar grid always contains six full weeks', () => {
  const cells = monthGrid(2026, 1);
  assert.equal(cells.length, 42);
  assert.equal(cells.filter(x => x.inMonth).length, 28);
});


test('calendar includes yearly renewals only in their billing month', () => {
  const events = renewalsInMonth([
    { id: 'yearly', name: 'Annual', status: 'active', nextDate: '2025-11-08', cycle: 'yearly', cost: 1200 }
  ], 2026, 10);
  assert.equal(events.length, 1);
  assert.equal(iso(events[0].date), '2026-11-08');
  assert.equal(renewalsInMonth([
    { id: 'yearly', name: 'Annual', status: 'active', nextDate: '2025-11-08', cycle: 'yearly', cost: 1200 }
  ], 2026, 9).length, 0);
});

import { buildInsights } from '../src/lib/insights.js';

test('insights normalize active weekly, monthly and yearly costs', () => {
  const result = buildInsights([
    { id: 'w', name: 'Weekly', status: 'active', cost: 100, cycle: 'weekly', category: 'Music' },
    { id: 'm', name: 'Monthly', status: 'active', cost: 150, cycle: 'monthly', category: 'Music' },
    { id: 'y', name: 'Yearly', status: 'active', cost: 1200, cycle: 'yearly', category: 'Storage' },
    { id: 'p', name: 'Paused', status: 'paused', cost: 500, cycle: 'monthly', category: 'Gaming' }
  ], 1000);
  assert.equal(result.activeCount, 3);
  assert.equal(result.pausedCount, 1);
  assert.equal(result.monthlyTotal, 683.33);
  assert.equal(result.yearlyTotal, 8199.96);
  assert.equal(result.budgetPercent, 68);
  assert.equal(result.categories[0].name, 'Music');
  assert.equal(result.topSubscriptions[0].name, 'Weekly');
});

test('insights safely handle empty data and missing categories', () => {
  const empty = buildInsights([], 0);
  assert.equal(empty.activeCount, 0);
  assert.equal(empty.monthlyTotal, 0);
  assert.equal(empty.budgetPercent, 0);
  const result = buildInsights([{ name: 'Unknown', status: 'active', cost: 10, cycle: 'monthly' }]);
  assert.equal(result.categories[0].name, 'Other');
});

test('insights exclude cancelled subscriptions and invalid costs', () => {
  const result = buildInsights([
    { name: 'Cancelled', status: 'cancelled', cost: 50, cycle: 'monthly' },
    { name: 'Invalid', status: 'active', cost: 'not-a-number', cycle: 'monthly' },
    { name: 'Valid', status: 'active', cost: 25, cycle: 'monthly' }
  ]);
  assert.equal(result.activeCount, 1);
  assert.equal(result.monthlyTotal, 25);
});

import { readFileSync } from 'node:fs';

test('subscription card and form refinements preserve the existing data contract', () => {
  const components = readFileSync(new URL('../src/components.jsx', import.meta.url), 'utf8');
  const dialogs = readFileSync(new URL('../src/Dialogs.jsx', import.meta.url), 'utf8');
  const store = readFileSync(new URL('../src/lib/store.js', import.meta.url), 'utf8');
  assert.match(components, /sub-card-price-row/);
  assert.match(components, /sub-category/);
  assert.match(components, /aria-label=\{`Options for \$\{s\.name\}`\}/);
  assert.match(dialogs, /BRAND_COLORS/);
  assert.match(dialogs, /form-error/);
  assert.match(dialogs, /cancelUrl/);
  assert.match(store, /subtrack\.v1/);
});

test('subscription form keeps trial and recurring billing fields', () => {
  const dialogs = readFileSync(new URL('../src/Dialogs.jsx', import.meta.url), 'utf8');
  for (const field of ['trial', 'nextDate', 'cycle', 'category', 'notes', 'cancelUrl']) assert.ok(dialogs.includes(field), `missing ${field}`);
});

test('responsive phase keeps mobile layout rules and existing app storage intact', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const store = readFileSync(new URL('../src/lib/store.js', import.meta.url), 'utf8');
  assert.match(css, /Phase 11 — responsive and touch-friendly experience/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /overscroll-behavior-x:contain/);
  assert.match(css, /max-height:calc\(100dvh - 20px\)/);
  assert.match(app, /className="tabs"/);
  assert.match(store, /subtrack\.v1/);
});

test('responsive stylesheet includes compact calendar, filters and reduced-motion support', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.calendar-day\{min-height:58px/);
  assert.match(css, /\.tools\{grid-template-columns:1fr/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});


test('appearance preference supports light, dark and system defaults without changing storage key', () => {
  const store = readFileSync(new URL('../src/lib/store.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const dialogs = readFileSync(new URL('../src/Dialogs.jsx', import.meta.url), 'utf8');
  assert.match(store, /const KEY = 'subtrack\.v1'/);
  assert.match(store, /theme: 'system'/);
  assert.match(app, /prefers-color-scheme: dark/);
  assert.match(dialogs, /role="switch"/);
  assert.match(dialogs, /aria-checked=\{darkEnabled\}/);
  assert.match(dialogs, /toggleAppearance/);
  assert.match(app, /theme-toggle/);
  assert.match(app, /store\.setSettings\(\{ theme \}\)/);
});

test('theme toggle has visible focus, motion-aware styling and dark-state feedback', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.switch-control:focus-visible/);
  assert.match(css, /\.switch-control\.is-on/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});

test('dark theme defines accessible surfaces and form controls', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /color-scheme:dark/);
  assert.match(css, /:root\[data-theme="dark"\] dialog/);
  assert.match(css, /:root\[data-theme="dark"\] input/);
});

test('phase 13 adds subtle motion, interaction feedback and reduced-motion fallbacks', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /@keyframes montra-enter/);
  assert.match(css, /@keyframes montra-dialog-in/);
  assert.match(css, /button:not\(:disabled\):active/);
  assert.match(css, /dialog\[open\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
});

test('phase 13 keeps animation styling scoped to UI and preserves dark-mode styling', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /main \.sub/);
  assert.match(css, /:root\[data-theme="dark"\] button:not\(:disabled\):active/);
  const store = readFileSync(new URL('../src/lib/store.js', import.meta.url), 'utf8');
  assert.match(store, /subtrack\.v1/);
});

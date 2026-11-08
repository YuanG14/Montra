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

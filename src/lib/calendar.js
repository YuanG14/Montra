import { addCycle, iso, parse } from './utils.js';

// Return every active subscription renewal that falls inside a local calendar month.
// Dates are calculated from the saved billing anchor, not from the current date,
// so users can inspect both previous and future months.
export function renewalsInMonth(subs, year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const events = [];

  for (const sub of subs) {
    if (sub.status !== 'active' || !sub.nextDate) continue;
    const anchor = parse(sub.nextDate);
    if (Number.isNaN(anchor.getTime())) continue;

    let date = anchor;
    let step = 0;
    // Fast-forward old anchors without constructing every historical event.
    while (date < start && step < 12000) {
      step += 1;
      date = addCycle(anchor, sub.cycle, step);
    }
    // A guard protects the UI from malformed billing data.
    while (date < end && step < 12000) {
      if (date >= start) events.push({ key: `${sub.id}:${iso(date)}`, id: sub.id, sub, date });
      step += 1;
      date = addCycle(anchor, sub.cycle, step);
    }
  }

  return events.sort((a, b) => a.date - b.date || a.sub.name.localeCompare(b.sub.name));
}

export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, key: iso(date), inMonth: date.getMonth() === month };
  });
}

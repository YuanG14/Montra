import { nextRenewal, daysUntil, iso } from './utils.js';
// Active subscriptions due within the reminder window. Free trials and yearly plans get at least 7 days.
export function dueSoon(subs, remind, dismissed) {
  return subs.filter(s => s.status === 'active').map(s => {
    const d = nextRenewal(s), days = daysUntil(d);
    const win = (s.trial || s.cycle === 'yearly') ? Math.max(remind, 7) : remind;
    return { s, d, days, key: s.id + ':' + iso(d), win };
  }).filter(x => x.days <= x.win && !dismissed.includes(x.key)).sort((a, b) => a.d - b.d);
}

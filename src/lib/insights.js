import { monthly, r2, nextRenewal, addCycle, today } from './utils.js';

const activeOnly = subs => (subs || []).filter(s => s && s.status === 'active' && Number.isFinite(Number(s.cost)) && Number(s.cost) >= 0);

export function buildInsights(subs, budget = 0, now = today()) {
  const active = activeOnly(subs);
  const monthlyTotal = r2(active.reduce((sum, s) => sum + monthly({ ...s, cost: Number(s.cost) }), 0));
  const yearlyTotal = r2(monthlyTotal * 12);
  const categoriesMap = new Map();
  const cyclesMap = new Map();

  for (const sub of active) {
    const normalizedMonthly = monthly({ ...sub, cost: Number(sub.cost) });
    const category = sub.category || 'Other';
    categoriesMap.set(category, (categoriesMap.get(category) || 0) + normalizedMonthly);
    const cycle = sub.cycle || 'monthly';
    cyclesMap.set(cycle, (cyclesMap.get(cycle) || 0) + 1);
  }

  const categories = [...categoriesMap.entries()]
    .map(([name, amount]) => ({ name, monthly: r2(amount), yearly: r2(amount * 12), share: monthlyTotal ? amount / monthlyTotal * 100 : 0 }))
    .sort((a, b) => b.monthly - a.monthly);

  const cycles = [...cyclesMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topSubscriptions = active
    .map(sub => ({ ...sub, color: sub.color || '#6C47FF', category: sub.category || 'Other', monthlyEquivalent: r2(monthly({ ...sub, cost: Number(sub.cost) })) }))
    .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)
    .slice(0, 5);

  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  const upcoming30Days = active.reduce((sum, sub) => {
    if (!sub.nextDate) return sum;
    let date;
    try { date = nextRenewal(sub); } catch { return sum; }
    let iterations = 0;
    while (date <= horizon && iterations < 60) {
      sum += Number(sub.cost);
      date = addCycle(date, sub.cycle || 'monthly');
      iterations += 1;
    }
    return sum;
  }, 0);

  const safeBudget = Number(budget) > 0 ? Number(budget) : 0;
  return {
    activeCount: active.length,
    pausedCount: (subs || []).filter(s => s?.status === 'paused').length,
    cancelledCount: (subs || []).filter(s => s?.status === 'cancelled').length,
    monthlyTotal,
    yearlyTotal,
    averageMonthly: active.length ? r2(monthlyTotal / active.length) : 0,
    budget: safeBudget,
    budgetPercent: safeBudget ? Math.round(monthlyTotal / safeBudget * 100) : 0,
    budgetRemaining: safeBudget ? r2(safeBudget - monthlyTotal) : 0,
    upcoming30Days: r2(upcoming30Days),
    categories,
    cycles,
    topSubscriptions
  };
}

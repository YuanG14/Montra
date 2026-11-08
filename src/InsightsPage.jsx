import { useMemo, useState } from 'react';
import { buildInsights } from './lib/insights.js';
import { money } from './lib/utils.js';
import { Tile } from './components.jsx';

const cycleLabels = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

function Metric({ label, value, detail }) {
  return <article className="panel insight-metric"><p className="mu sm">{label}</p><strong>{value}</strong>{detail && <span className="mu sm">{detail}</span>}</article>;
}

export default function InsightsPage({ subs, set, A }) {
  const [period, setPeriod] = useState('monthly');
  const data = useMemo(() => buildInsights(subs, set.budget), [subs, set.budget]);
  const amount = category => period === 'yearly' ? category.yearly : category.monthly;
  const total = period === 'yearly' ? data.yearlyTotal : data.monthlyTotal;
  const cur = set.currency;

  if (!data.activeCount) {
    return <section className="empty insights-empty">
      <div className="insights-empty-icon" aria-hidden="true">↗</div>
      <h1>Insights start with your subscriptions</h1>
      <p>Add your subscriptions to see spending breakdowns, annual projections, category comparisons and upcoming payment commitments.</p>
      <div className="acts"><button className="btn" onClick={A.add}>Add a subscription</button><a className="btn ghost" href="#/cards">View cards</a></div>
    </section>;
  }

  return <section className="insights-page">
    <div className="sec insights-heading">
      <div><h1 className="h1s">Insights</h1><p className="mu sm">Understand the recurring costs behind your subscriptions.</p></div>
      <div className="period-switch" role="group" aria-label="Spending display period">
        <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
        <button className={period === 'yearly' ? 'active' : ''} onClick={() => setPeriod('yearly')}>Yearly</button>
      </div>
    </div>

    <div className="insight-metrics">
      <Metric label={`${period === 'monthly' ? 'Monthly' : 'Annual'} recurring spend`} value={money(total, cur)} detail="Based on active subscriptions" />
      <Metric label="Active subscriptions" value={data.activeCount} detail={`${data.pausedCount} paused · ${data.cancelledCount} cancelled`} />
      <Metric label="Average per subscription" value={money(period === 'yearly' ? data.averageMonthly * 12 : data.averageMonthly, cur)} detail="Average recurring cost" />
      <Metric label="Next 30 days" value={money(data.upcoming30Days, cur)} detail="Expected renewals in the next 30 days" />
    </div>

    <div className="insights-grid">
      <section className="panel insight-panel">
        <div className="insight-title"><div><h2>Spending by category</h2><p className="mu sm">Where your recurring costs are concentrated.</p></div><b>{money(total, cur)}</b></div>
        {data.categories.length ? <div className="category-bars">{data.categories.map((item, index) => <div className="category-row" key={item.name}>
          <div className="category-meta"><b>{item.name}</b><span>{money(amount(item), cur)} <small>{Math.round(item.share)}%</small></span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(item.share, 1)}%`, '--bar-index': index }} /></div>
        </div>)}</div> : <p className="mu sm">No category data yet.</p>}
      </section>

      <section className="panel insight-panel">
        <h2>Budget overview</h2>
        {data.budget > 0 ? <>
          <div className="budget-insight-number"><strong>{data.budgetPercent}%</strong><span className="mu sm">of monthly budget used</span></div>
          <div className="bar-track budget-track"><div className={`bar-fill ${data.budgetPercent > 100 ? 'over' : ''}`} style={{ width: `${Math.min(data.budgetPercent, 100)}%` }} /></div>
          <div className="budget-insight-foot"><span className="mu sm">Monthly spend: {money(data.monthlyTotal, cur)}</span><b className={data.budgetRemaining < 0 ? 'bad' : 'good'}>{data.budgetRemaining < 0 ? `${money(Math.abs(data.budgetRemaining), cur)} over` : `${money(data.budgetRemaining, cur)} left`}</b></div>
          <p className="mu sm insight-note">Your budget is compared with monthly-equivalent subscription costs, even when a plan bills weekly or yearly.</p>
        </> : <>
          <p className="mu sm budget-empty-copy">Set a monthly budget to see how your recurring subscriptions compare with your spending limit.</p>
          <button className="btn ghost" onClick={A.settings}>Set monthly budget</button>
        </>}
      </section>

      <section className="panel insight-panel">
        <h2>Highest recurring costs</h2>
        <p className="mu sm insight-subtitle">Ranked by monthly-equivalent price.</p>
        <ol className="top-cost-list">{data.topSubscriptions.map((sub, index) => <li key={sub.id || `${sub.name}-${index}`}>
          <span className="rank-number">{index + 1}</span><Tile s={sub}/><span className="top-cost-name"><b>{sub.name}</b><small className="mu">{sub.category || 'Other'}</small></span><b className="top-cost-price">{money(period === 'yearly' ? sub.monthlyEquivalent * 12 : sub.monthlyEquivalent, cur)}<small className="mu">/{period === 'yearly' ? 'yr' : 'mo'}</small></b>
        </li>)}</ol>
        <a className="insight-link" href="#/cards">Manage subscriptions →</a>
      </section>

      <section className="panel insight-panel">
        <h2>Billing frequency</h2>
        <p className="mu sm insight-subtitle">How often your active plans renew.</p>
        <div className="cycle-list">{data.cycles.map(item => <div className="cycle-row" key={item.name}><span>{cycleLabels[item.name] || item.name}</span><div className="cycle-track"><i style={{ width: `${item.count / data.activeCount * 100}%` }}/></div><b>{item.count}</b></div>)}</div>
        <div className="frequency-note"><b>{data.activeCount}</b> active plans across <b>{data.cycles.length}</b> billing {data.cycles.length === 1 ? 'frequency' : 'frequencies'}.</div>
      </section>
    </div>

    <div className="insight-disclaimer">These are estimates based on the prices and billing cycles you entered. They are not actual bank transactions or a record of payments made. Yearly and monthly figures are normalized projections.</div>
  </section>;
}

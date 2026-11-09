import { useState } from 'react';
import { money, r2, monthly, nextRenewal } from './lib/utils.js';
import { CATEGORIES, SERVICES } from './lib/data.js';
import { SubCard, AddTile, Pill, Tile, CYCW, info } from './components.jsx';

function tip(act, cur) {
  const g = {};
  act.forEach(s => (g[s.category] = g[s.category] || []).push(s));
  const best = Object.entries(g).filter(([c, l]) => l.length > 1 && c !== 'Other').sort((a, b) => b[1].length - a[1].length)[0];
  if (!best) return { t: 'Nothing overlaps', p: 'None of your active subscriptions share a category.' };
  const l = best[1].slice().sort((a, b) => monthly(a) - monthly(b));
  return { t: `${l[0].name} and ${l[1].name} overlap`, p: `You have ${l.length} ${best[0].toLowerCase()} subscriptions. Cancelling the cheapest, ${l[0].name}, could save ${money(r2(monthly(l[0])), cur)} a month.` };
}

export function Overview({ subs, set, A }) {
  const cur = set.currency;
  if (!subs.length) {
    return (
      <section className="empty">
        <h1>Start with one subscription</h1>
        <p>Add what you pay for each month. Montra shows what is due next and what it all adds up to.</p>
        <div className="acts"><button className="btn" onClick={A.add}>Add a subscription</button><button className="btn ghost" onClick={A.seed}>Load sample data</button></div>
      </section>
    );
  }
  const act = subs.filter(s => s.status === 'active');
  const m = r2(act.reduce((a, s) => a + monthly(s), 0)), b = set.budget;
  const up = act.map(s => ({ s, ...info(s) })).sort((a, c) => a.d - c.d);
  const week = up.filter(x => x.days <= 7).length;
  const pct = b > 0 ? Math.min(100, Math.round(m / b * 100)) : 0, over = b > 0 && m > b;
  const t = tip(act, cur);
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-kicker">YOUR SUBSCRIPTION SPACE</p>
          <h1 className="dashboard-title">Overview</h1>
          <p className="mu">A clear picture of what you pay for and what’s coming next.</p>
        </div>
        <span className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <section className="hero dashboard-hero">
        <div className="spend-summary">
          <p className="mu">Estimated monthly spend</p>
          <h1>{money(m, cur)}</h1>
          <div className="chips2">
            <span className="pill pur">{money(r2(m * 12), cur)} yearly equivalent</span>
            {week > 0 && <span className="pill red">{week} due this week</span>}
          </div>
        </div>
        <div className="panel">
          {b > 0 ? (
            <div className="ring">
              <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={`${pct}% of monthly budget used`}>
                <g transform="rotate(-90 60 60)" fill="none" strokeWidth="12" strokeLinecap="round">
                  <circle cx="60" cy="60" r="48" stroke="var(--acs)" />
                  <circle cx="60" cy="60" r="48" stroke={over ? '#D6334A' : 'var(--ac)'} strokeDasharray={`${(pct * 3.016).toFixed(1)} 301.6`} />
                </g>
                <text x="60" y="68" textAnchor="middle" fontSize="24" fontWeight="700" fill="currentColor">{pct}%</text>
              </svg>
              <div>
                <b>Monthly budget</b>
                <div className="big2">{money(m, cur)} <span className="mu">of {money(b, cur)}</span></div>
                <div className={over ? 'bad' : 'good'}>{over ? 'Over budget' : 'On track'}</div>
              </div>
            </div>
          ) : (
            <div><b>Monthly budget</b><p className="mu">Set a limit to see how much of it your subscriptions use.</p><button className="btn ghost" onClick={A.settings}>Set a budget</button></div>
          )}
        </div>
      </section>
      <section className="dashboard-stats" aria-label="Subscription summary">
        <article className="dashboard-stat">
          <span className="stat-icon">↗</span>
          <div><p className="mu">Active subscriptions</p><strong>{act.length}</strong><small>Currently being tracked</small></div>
        </article>
        <article className="dashboard-stat">
          <span className="stat-icon">◷</span>
          <div><p className="mu">Renewing in 30 days</p><strong>{up.filter(x => x.days <= 30).length}</strong><small>Upcoming charges</small></div>
        </article>
        <article className="dashboard-stat">
          <span className="stat-icon">Ⅱ</span>
          <div><p className="mu">Paused</p><strong>{subs.filter(s => s.status === 'paused').length}</strong><small>Not included in spend</small></div>
        </article>
      </section>
      <div className="sec dashboard-section-title"><div><h2>Your subscriptions</h2><p className="mu sm">The next services scheduled to renew</p></div><a className="mu" href="#/cards">View all →</a></div>
      <div className="grid">{up.slice(0, 5).map(x => <SubCard key={x.s.id} s={x.s} cur={cur} A={A} />)}<AddTile A={A} /></div>
      <div className="two dashboard-lower">
        <section className="panel renewal-panel">
          <div className="panel-heading"><div><h2>Upcoming renewals</h2><p className="mu sm">Your next scheduled subscription charges</p></div><a href="#/calendar" className="text-action">Open calendar</a></div>
          {up.length ? (
            <ul className="tl">
              {up.slice(0, 4).map(x => (
                <li key={x.s.id}>
                  <span className="dt"><small>{x.d.toLocaleDateString('en-US', { month: 'short' })}</small><b>{x.d.getDate()}</b></span>
                  <i className="dot" />
                  <span><b>{x.s.name}</b><br /><small className="mu">{money(x.s.cost, cur)} / {CYCW[x.s.cycle]}</small></span>
                  <Pill days={x.days} />
                </li>
              ))}
            </ul>
          ) : <p className="mu">No upcoming renewals.</p>}
        </section>
        <div className="stack">
          <section className="panel tip"><b>Smart tip</b><h3>{t.t}</h3><p>{t.p}</p></section>
          <section className="panel">
            <label className="inl">Remind me
              <select value={set.remind} onChange={e => A.remind(+e.target.value)}>
                {[1, 3, 7].map(n => <option key={n} value={n}>{n} day{n > 1 ? 's' : ''} before</option>)}
              </select>
            </label>
            <p className="mu sm">Due renewals show under the bell at the top. Free trials and yearly plans get at least 7 days.</p>
          </section>
        </div>
      </div>
    </>
  );
}

export function Cards({ subs, set, f, setF, A }) {
  const k = { next: s => nextRenewal(s).getTime(), cost: s => -monthly(s), name: s => s.name.toLowerCase() }[f.sort];
  const list = subs
    .filter(s => (f.status === 'all' || s.status === f.status) && (f.cat === 'all' || s.category === f.cat) && s.name.toLowerCase().includes(f.q.toLowerCase()))
    .sort((a, b) => (k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0));
  const on = key => e => setF({ ...f, [key]: e.target.value });
  return (
    <>
      <div className="sec"><h1 className="h1s">Cards</h1></div>
      <div className="tools">
        <input type="search" placeholder="Search subscriptions" aria-label="Search subscriptions" value={f.q} onChange={on('q')} />
        <select aria-label="Status" value={f.status} onChange={on('status')}>
          <option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option><option value="all">All</option>
        </select>
        <select aria-label="Category" value={f.cat} onChange={on('cat')}>
          <option value="all">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort by" value={f.sort} onChange={on('sort')}>
          <option value="next">Next renewal</option><option value="cost">Highest cost</option><option value="name">Name</option>
        </select>
      </div>
      <div className="grid">
        {list.map(s => <SubCard key={s.id} s={s} cur={set.currency} A={A} />)}
        <AddTile A={A} />
        {!list.length && <p className="mu none">No subscriptions match these filters.</p>}
      </div>
    </>
  );
}

export function GuidePage({ subs, A }) {
  const [q, setQ] = useState('');
  const mine = new Set(subs.map(s => s.name.toLowerCase()));
  const list = SERVICES.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="sec"><h1 className="h1s">Cancel guide</h1></div>
      <p className="mu" style={{ marginBottom: 16 }}>Short steps for popular services. Menus change, so treat these as a map, not a promise.</p>
      <div className="tools"><input type="search" placeholder="Search services" aria-label="Search services" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="grid">
        {list.map(x => (
          <article className="sub" key={x.name} style={{ '--c': x.color }}>
            <div className="top"><Tile s={x} /><h3>{x.name}</h3>{mine.has(x.name.toLowerCase()) && <span className="pill pur">You have this</span>}</div>
            <p className="note">{x.category}</p>
            <div className="acts" style={{ justifyContent: 'flex-start' }}><button className="btn ghost" onClick={() => A.guide(x.name)}>How to cancel</button></div>
          </article>
        ))}
        {!list.length && <p className="mu none">Not in the guide yet. Add the subscription and paste its cancel link in the form.</p>}
      </div>
    </>
  );
}

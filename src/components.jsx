import { useEffect, useRef, useState } from 'react';
import { money, fmt, nextRenewal, daysUntil, ink, slug } from './lib/utils.js';

export const CYC = { weekly: 'wk', monthly: 'mo', yearly: 'yr' };
export const CYCW = { weekly: 'week', monthly: 'month', yearly: 'year' };
export const cap = s => s[0].toUpperCase() + s.slice(1);
export const info = s => { const d = nextRenewal(s); return { d, days: daysUntil(d) }; };

export function Pill({ days }) {
  const c = days <= 3 ? 'red' : days <= 7 ? 'amb' : days <= 30 ? 'grn' : 'pur';
  return <span className={'pill ' + c}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}</span>;
}

// Brand-colored initial. A logo at public/logos/<name>.svg replaces it automatically.
export function Tile({ s, size = 'normal' }) {
  const [logo, setLogo] = useState(false);
  const [bad, setBad] = useState(false);
  return (
    <span aria-hidden="true" className={'tile' + (logo ? ' logo' : '') + (size === 'large' ? ' tile-large' : '')} style={{ background: s.color || '#6C47FF', color: ink(s.color || '#6C47FF') }}>
      {(s.name || '?')[0].toUpperCase()}
      {!bad && <img src={`/logos/${slug(s.name || '')}.svg`} alt="" onLoad={() => setLogo(true)} onError={() => setBad(true)} />}
    </span>
  );
}

function Menu({ s, A }) {
  const r = useRef();
  useEffect(() => {
    const h = e => { if (r.current && !r.current.contains(e.target)) r.current.open = false; };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  const go = fn => () => { r.current.open = false; fn(); };
  return (
    <details className="menu" ref={r}>
      <summary aria-label={`Options for ${s.name}`}>&#8943;</summary>
      <div className="mi">
        <button onClick={go(() => A.edit(s.id))}>Edit</button>
        <button onClick={go(() => A.cancel(s.id))}>How to cancel</button>
        <button onClick={go(() => A.status(s.id, s.status === 'paused' ? 'active' : 'paused'))}>{s.status === 'paused' ? 'Resume' : 'Pause'}</button>
        <button onClick={go(() => A.status(s.id, s.status === 'cancelled' ? 'active' : 'cancelled'))}>{s.status === 'cancelled' ? 'Reactivate' : 'Mark as cancelled'}</button>
        <button className="danger" onClick={go(() => A.del(s.id))}>Delete</button>
      </div>
    </details>
  );
}

export function SubCard({ s, cur, A }) {
  const on = s.status === 'active';
  const { d, days } = info(s);
  return (
    <article className={'sub' + (on ? '' : ' dim')} style={{ '--c': s.color || '#6C47FF' }} aria-label={`${s.name}, ${s.status} subscription`}>
      <div className="sub-card-head">
        <Tile s={s} />
        <div className="sub-card-title">
          <h3>{s.name}</h3>
          <span className="sub-category">{s.category || 'Other'}</span>
        </div>
        {s.trial && <span className="pill pur">Trial</span>}
        <Menu s={s} A={A} />
      </div>
      <div className="sub-card-price-row">
        <div className="price-block">
          <span className="price-label">{on ? 'Subscription cost' : 'Last recorded cost'}</span>
          <div className="price">{money(s.cost, cur)}<small> / {CYC[s.cycle] || 'mo'}</small></div>
        </div>
        <div className="ren">{on ? <><span>Next renewal</span><b>{fmt(d)}</b></> : <><span>Status</span><b className={'status-text ' + (s.status === 'cancelled' ? 'cancelled' : 'paused')}>{cap(s.status || 'active')}</b></>}</div>
      </div>
      <div className="sub-card-foot">
        {on ? <Pill days={days} /> : <span className={'status-chip ' + (s.status === 'cancelled' ? 'is-cancelled' : 'is-paused')}>{cap(s.status || 'active')}</span>}
        {s.notes && <p className="note">{s.notes}</p>}
      </div>
    </article>
  );
}

export const AddTile = ({ A }) => <button className="add" onClick={A.add}><b>+</b>Add subscription</button>;

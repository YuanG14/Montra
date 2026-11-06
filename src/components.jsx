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
export function Tile({ s }) {
  const [logo, setLogo] = useState(false);
  const [bad, setBad] = useState(false);
  return (
    <span className={'tile' + (logo ? ' logo' : '')} style={{ background: s.color, color: ink(s.color) }}>
      {s.name[0].toUpperCase()}
      {!bad && <img src={`/logos/${slug(s.name)}.svg`} alt="" onLoad={() => setLogo(true)} onError={() => setBad(true)} />}
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
    <article className={'sub' + (on ? '' : ' dim')} style={{ '--c': s.color }}>
      <div className="top">
        <Tile s={s} />
        <h3>{s.name}</h3>
        {s.trial && <span className="pill pur">Trial</span>}
        <Menu s={s} A={A} />
      </div>
      <div className="bot">
        <div className="price">{money(s.cost, cur)}<small> /{CYC[s.cycle]}</small></div>
        <div className="ren">{on ? <>Renews<br /><b>{fmt(d)}</b></> : <b>{cap(s.status)}</b>}</div>
      </div>
      {on && <Pill days={days} />}
      {s.notes && <p className="note">{s.notes}</p>}
    </article>
  );
}

export const AddTile = ({ A }) => <button className="add" onClick={A.add}><b>+</b>Add subscription</button>;

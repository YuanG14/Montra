import { useEffect, useRef, useState } from 'react';
import { iso, today, money, fmt } from './lib/utils.js';
import { Tile, Pill } from './components.jsx';
import { guideFor, safeUrl, GENERIC } from './lib/cancel.js';
import { CATEGORIES, SERVICES } from './lib/data.js';

function Modal({ onClose, children }) {
  const r = useRef();
  useEffect(() => { r.current.showModal(); }, []);
  return <dialog ref={r} onClose={onClose}>{children}</dialog>;
}

const blank = () => ({ name: '', cost: '', cycle: 'monthly', nextDate: iso(today()), category: 'Entertainment', trial: false, notes: '', cancelUrl: '', color: '#6C47FF' });

export function FormDialog({ sub, onSave, onClose }) {
  const [v, setV] = useState(sub || blank());
  const on = k => e => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = e => {
    e.preventDefault();
    const cost = parseFloat(v.cost);
    if (!v.name.trim() || !(cost >= 0)) return;
    onSave({ ...v, name: v.name.trim(), cost, notes: (v.notes || '').trim() }, sub && sub.id);
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2>{sub ? 'Edit subscription' : 'Add subscription'}</h2>
        {!sub && (
          <>
            <p className="mu sm">Pick a popular one or fill it in yourself.</p>
            <div className="chipbox">
              {SERVICES.map(x => <button type="button" className="chip" key={x.name} onClick={() => setV({ ...v, name: x.name, category: x.category, color: x.color })}>{x.name}</button>)}
            </div>
          </>
        )}
        <label>Name<input required maxLength="60" value={v.name} onChange={on('name')} /></label>
        <div className="row">
          <label>Cost<input type="number" min="0" step="0.01" required value={v.cost} onChange={on('cost')} /></label>
          <label>Billing
            <select value={v.cycle} onChange={on('cycle')}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
          </label>
        </div>
        <div className="row">
          <label>Next renewal<input type="date" required value={v.nextDate} onChange={on('nextDate')} /></label>
          <label>Category<select value={v.category} onChange={on('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        <label className="chk"><input type="checkbox" checked={!!v.trial} onChange={on('trial')} /> This is a free trial</label>
        <label>Notes (optional)<input maxLength="120" value={v.notes || ''} onChange={on('notes')} /></label>
        <label>Cancel link (optional)<input type="url" placeholder="https://" value={v.cancelUrl || ''} onChange={on('cancelUrl')} /></label>
        <div className="acts"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn">Save</button></div>
      </form>
    </Modal>
  );
}

export function SettingsDialog({ set, onSave, onClose }) {
  const [v, setV] = useState(set);
  const on = k => e => setV({ ...v, [k]: e.target.value });
  const submit = e => { e.preventDefault(); onSave({ currency: v.currency, budget: parseFloat(v.budget) || 0, remind: +v.remind }); };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2>Settings</h2>
        <label>Currency<select value={v.currency} onChange={on('currency')}>{['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'SGD', 'AUD'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Monthly budget (0 means no budget)<input type="number" min="0" step="1" value={v.budget} onChange={on('budget')} /></label>
        <label>Remind me
          <select value={v.remind} onChange={on('remind')}>{[1, 3, 7].map(n => <option key={n} value={n}>{n} day{n > 1 ? 's' : ''} before renewal</option>)}</select>
        </label>
        <div className="acts"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn">Save settings</button></div>
      </form>
    </Modal>
  );
}

export function RemindersDialog({ items, remind, cur, A, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div>
        <h2>Reminders</h2>
        {items.length ? (
          <ul className="rl">
            {items.map(x => (
              <li key={x.key}>
                <Tile s={x.s} />
                <div>
                  <b>{x.s.name}</b>
                  {x.s.trial && <span className="pill pur" style={{ marginLeft: 8 }}>Trial ends</span>}
                  {!x.s.trial && x.s.cycle === 'yearly' && <span className="pill pur" style={{ marginLeft: 8 }}>Yearly</span>}
                  <div className="mu sm">{money(x.s.cost, cur)} on {fmt(x.d)}</div>
                </div>
                <div className="racts">
                  <Pill days={x.days} />
                  <button className="btn ghost sm-btn" onClick={() => A.cancel(x.s.id)}>How to cancel</button>
                  <button className="btn ghost sm-btn" onClick={() => A.dismiss(x.key)}>Dismiss</button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mu" style={{ margin: '12px 0' }}>All clear. Nothing is due in the next {remind} day{remind > 1 ? 's' : ''}.</p>}
        <div className="acts"><button className="btn" onClick={onClose}>Close</button></div>
      </div>
    </Modal>
  );
}

export function CancelDialog({ sub, name, A, onClose }) {
  const n = sub ? sub.name : name, e = guideFor(n);
  const url = safeUrl(sub && sub.cancelUrl) || (e && e.url) || null;
  return (
    <Modal onClose={onClose}>
      <div>
        <h2>How to cancel {n}</h2>
        {!e && <p className="mu sm">No guide for this one yet, so here are the usual steps.</p>}
        <ol className="steps">{(e ? e.steps : GENERIC).map((t, i) => <li key={i}>{t}</li>)}</ol>
        <p className="mu sm">Subscribed through the App Store, Google Play, a mobile wallet or your phone carrier? Cancel there instead, because the service's own page cannot end it. Menus change, so search "{n} cancel" if a step does not match.</p>
        <div className="acts">
          {url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open account page</a>}
          {sub && sub.status !== 'cancelled' && <button className="btn ghost" onClick={async () => { await A.status(sub.id, 'cancelled'); onClose(); }}>Mark as cancelled</button>}
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

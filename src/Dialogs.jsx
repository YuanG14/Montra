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

const BRAND_COLORS = ['#6C47FF', '#E50914', '#1DB954', '#113CCF', '#00A8E1', '#FA243C', '#3693F5', '#4285F4', '#D83B01', '#7D2AE8', '#10A37F', '#2B2B2B'];

export function FormDialog({ sub, onSave, onClose }) {
  const [v, setV] = useState(sub || blank());
  const [error, setError] = useState('');
  const on = k => e => {
    setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    if (error) setError('');
  };
  const choose = x => { setV({ ...v, name: x.name, category: x.category, color: x.color }); setError(''); };
  const submit = e => {
    e.preventDefault();
    const cost = Number(v.cost);
    if (!v.name.trim()) return setError('Enter a subscription name to continue.');
    if (v.cost === '' || !Number.isFinite(cost) || cost < 0) return setError('Enter a valid cost of zero or more.');
    if (!v.nextDate) return setError('Choose the next renewal date.');
    onSave({ ...v, name: v.name.trim(), cost, notes: (v.notes || '').trim(), color: v.color || '#6C47FF' }, sub && sub.id);
  };
  return (
    <Modal onClose={onClose}>
      <form className="subscription-form" onSubmit={submit}>
        <div className="dialog-heading">
          <div className="dialog-heading-copy">
            <span className="dialog-eyebrow">SUBSCRIPTION DETAILS</span>
            <h2>{sub ? 'Edit subscription' : 'Add a subscription'}</h2>
            <p className="mu sm">{sub ? 'Update the details you want Montra to track.' : 'Keep the price and renewal date in one place.'}</p>
          </div>
          <div className="form-preview"><Tile s={{ name: v.name || '?', color: v.color }} size="large" /></div>
        </div>
        {!sub && (
          <section className="form-section service-picker">
            <div className="form-section-title"><b>Quick add</b><span className="mu sm">Popular services</span></div>
            <div className="chipbox">
              {SERVICES.map(x => <button type="button" className={'chip service-chip' + (v.name === x.name ? ' selected' : '')} key={x.name} aria-pressed={v.name === x.name} onClick={() => choose(x)}><span className="service-chip-dot" style={{ background: x.color }} />{x.name}</button>)}
            </div>
          </section>
        )}
        <section className="form-section">
          <div className="form-section-title"><b>Basic information</b><span className="mu sm">Required</span></div>
          <label>Subscription name<input autoFocus required maxLength="60" placeholder="e.g. Netflix" value={v.name} onChange={on('name')} /></label>
          <div className="row">
            <label>Cost<input type="number" min="0" step="0.01" required placeholder="0.00" value={v.cost} onChange={on('cost')} /></label>
            <label>Billing cycle<select value={v.cycle} onChange={on('cycle')}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
          </div>
          <div className="row">
            <label>Next renewal<input type="date" required value={v.nextDate} onChange={on('nextDate')} /></label>
            <label>Category<select value={v.category} onChange={on('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
          </div>
          <div className="brand-color-field">
            <span className="field-caption">Brand color</span>
            <div className="color-options" role="group" aria-label="Choose subscription color">
              {BRAND_COLORS.map(color => <button key={color} type="button" className={'color-swatch' + (v.color === color ? ' selected' : '')} style={{ '--swatch': color }} aria-label={`Use ${color}`} aria-pressed={v.color === color} onClick={() => setV({ ...v, color })} />)}
              <label className="custom-color"><span>Custom</span><input type="color" aria-label="Custom brand color" value={v.color || '#6C47FF'} onChange={on('color')} /></label>
            </div>
          </div>
        </section>
        <section className="form-section optional-section">
          <div className="form-section-title"><b>Extra details</b><span className="mu sm">Optional</span></div>
          <label className="trial-toggle"><input type="checkbox" checked={!!v.trial} onChange={on('trial')} /><span><b>Free trial</b><small className="mu">Mark this if the next date is when your trial ends.</small></span></label>
          <label>Notes<input maxLength="120" placeholder="Anything you want to remember" value={v.notes || ''} onChange={on('notes')} /></label>
          <label>Cancellation link<input type="url" placeholder="https://" value={v.cancelUrl || ''} onChange={on('cancelUrl')} /></label>
        </section>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="acts form-actions"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" type="submit">{sub ? 'Save changes' : 'Add subscription'}</button></div>
      </form>
    </Modal>
  );
}

export function SettingsDialog({ set, onSave, onClose }) {
  const [v, setV] = useState(set);
  const on = k => e => setV({ ...v, [k]: e.target.value });
  const systemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const darkEnabled = v.theme === 'dark' || ((v.theme || 'system') === 'system' && systemDark);
  const toggleAppearance = () => setV({ ...v, theme: darkEnabled ? 'light' : 'dark' });
  const submit = e => { e.preventDefault(); onSave({ currency: v.currency, budget: parseFloat(v.budget) || 0, remind: +v.remind, theme: v.theme || 'system' }); };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2>Settings</h2>
        <div className="appearance-setting">
          <div><b>Dark mode</b><p className="settings-hint mu sm">Turn on a darker appearance across Montra.</p></div>
          <button type="button" className={'switch-control' + (darkEnabled ? ' is-on' : '')} role="switch" aria-checked={darkEnabled} aria-label="Dark mode" onClick={toggleAppearance}><span /></button>
        </div>
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

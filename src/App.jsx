import { useEffect, useRef, useState } from 'react';
import { store } from './lib/store.js';
import { SERVICES } from './lib/data.js';
import { iso, today } from './lib/utils.js';
import { cap } from './components.jsx';
import { Overview, Cards, GuidePage } from './pages.jsx';
import CalendarPage from './CalendarPage.jsx';
import InsightsPage from './InsightsPage.jsx';
import LandingPage from './LandingPage.jsx';
import { dueSoon } from './lib/reminders.js';
import { FormDialog, SettingsDialog, RemindersDialog, CancelDialog } from './Dialogs.jsx';

async function seed() {
  const t = today(), d = n => iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + n));
  const S = (n, c, days) => { const v = SERVICES.find(x => x.name === n); return { name: n, cost: c, cycle: 'monthly', nextDate: d(days), category: v.category, color: v.color, status: 'active', trial: false, notes: '' }; };
  for (const s of [S('Netflix', 549, 2), S('Spotify', 149, 5), S('YouTube Premium', 159, 9), S('iCloud+', 179, 12), S('Disney+', 369, 21), S('Canva Pro', 500, 25)]) await store.create(s);
}

export default function App() {
  const [subs, setSubs] = useState([]);
  const [set, setSet] = useState({ currency: 'PHP', budget: 0, remind: 3 });
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [hash, setHash] = useState(location.hash);
  const [f, setF] = useState({ q: '', status: 'active', cat: 'all', sort: 'next' });
  const [dlg, setDlg] = useState(null);
  const [msg, setMsg] = useState('');
  const timer = useRef();

  const refresh = async () => { setSubs(await store.list()); setSet(await store.settings()); setDismissed(await store.dismissed()); setReady(true); };
  useEffect(() => {
    refresh();
    const h = () => setHash(location.hash);
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const preference = set.theme || 'system';
      const dark = preference === 'dark' || (preference === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.dataset.theme = dark ? 'dark' : 'light';
      root.style.colorScheme = dark ? 'dark' : 'light';
    };
    apply();
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (media && media.addEventListener) media.addEventListener('change', apply);
    return () => { if (media && media.removeEventListener) media.removeEventListener('change', apply); };
  }, [set.theme]);
  const toast = m => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(''), 2200); };
  const systemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = set.theme === 'dark' || ((set.theme || 'system') === 'system' && systemDark);
  const toggleTheme = async () => { const theme = isDark ? 'light' : 'dark'; await store.setSettings({ theme }); await refresh(); toast(`${theme === 'dark' ? 'Dark' : 'Light'} mode enabled`); };

  const A = {
    add: () => setDlg({ t: 'form' }),
    edit: id => setDlg({ t: 'form', id }),
    settings: () => setDlg({ t: 'settings' }),
    reminders: () => setDlg({ t: 'reminders' }),
    cancel: id => setDlg({ t: 'cancel', id }),
    guide: name => setDlg({ t: 'cancel', name }),
    dismiss: async key => { await store.dismiss(key); await refresh(); },
    save: async (p, id) => { if (id) await store.update(id, p); else await store.create({ ...p, status: 'active' }); setDlg(null); await refresh(); toast(id ? 'Changes saved' : 'Subscription added'); },
    status: async (id, to) => { await store.update(id, { status: to }); await refresh(); toast(to === 'active' ? 'Back to active' : cap(to)); },
    del: async id => { if (!confirm('Delete this subscription? This cannot be undone.')) return; await store.remove(id); await refresh(); toast('Subscription deleted'); },
    seed: async () => { await seed(); await refresh(); },
    saveSettings: async p => { await store.setSettings(p); setDlg(null); await refresh(); toast('Settings saved'); },
    remind: async n => { await store.setSettings({ remind: n }); await refresh(); toast('Reminder timing saved'); }
  };

  const view = !hash || ['#/home', '#top', '#features', '#how-it-works'].includes(hash) ? 'landing' : hash === '#/cards' ? 'cards' : hash === '#/guide' ? 'guide' : hash === '#/calendar' ? 'calendar' : hash === '#/insights' ? 'insights' : 'overview';
  const items = dueSoon(subs, set.remind, dismissed);
  const close = () => setDlg(null);
  if (view === 'landing') return <LandingPage />;

  return (
    <>
      <div className="wrap">
        <header className="bar">
          <a className="logo" href="#/home"><i>M</i>Montra</a>
          <nav className="tabs" aria-label="Main">
            <a href="#/overview" aria-current={view === 'overview' ? 'page' : undefined}>Overview</a>
            <a href="#/cards" aria-current={view === 'cards' ? 'page' : undefined}>Cards</a>
            <a href="#/guide" aria-current={view === 'guide' ? 'page' : undefined}>Cancel guide</a>
            <a href="#/calendar" aria-current={view === 'calendar' ? 'page' : undefined}>Calendar</a>
            <a href="#/insights" aria-current={view === 'insights' ? 'page' : undefined}>Insights</a>
          </nav>
          <div className="right">
            <button className="ib theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} title={`Switch to ${isDark ? 'light' : 'dark'} mode`} aria-pressed={isDark}>
              {isDark ? '☀' : '☾'}
            </button>
            <button className="ib bell" onClick={A.reminders} aria-label={`Reminders, ${items.length} due`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></svg>
              {items.length > 0 && <span className="badge">{items.length}</span>}
            </button>
            <button className="ib" onClick={A.settings} aria-label="Settings">&#9881;</button>
            <button className="btn" onClick={A.add}>+ Add</button>
          </div>
        </header>
        <main>{ready && (view === 'cards' ? <Cards subs={subs} set={set} f={f} setF={setF} A={A} /> : view === 'guide' ? <GuidePage subs={subs} A={A} /> : view === 'calendar' ? <CalendarPage subs={subs} set={set} A={A} /> : view === 'insights' ? <InsightsPage subs={subs} set={set} A={A} /> : <Overview subs={subs} set={set} A={A} />)}</main>
      </div>
      {dlg && dlg.t === 'form' && <FormDialog key={dlg.id || 'new'} sub={dlg.id ? subs.find(s => s.id === dlg.id) : null} onSave={A.save} onClose={close} />}
      {dlg && dlg.t === 'settings' && <SettingsDialog set={set} onSave={A.saveSettings} onClose={close} />}
      {dlg && dlg.t === 'reminders' && <RemindersDialog items={items} remind={set.remind} cur={set.currency} A={A} onClose={close} />}
      {dlg && dlg.t === 'cancel' && <CancelDialog key={dlg.id || dlg.name} sub={dlg.id ? subs.find(s => s.id === dlg.id) : null} name={dlg.name} A={A} onClose={close} />}
      <div id="toast" className={msg ? 'on' : ''} role="status" aria-live="polite">{msg}</div>
    </>
  );
}

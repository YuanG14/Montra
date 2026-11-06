// Data layer. Everything is async on purpose: in the backend phase (MongoDB),
// only this file changes (to call the API) and the rest of the app stays the same.
const ST = {};
{
  const KEY = 'subtrack.v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = d => localStorage.setItem(KEY, JSON.stringify(d));
  const get = () => {
    const d = read();
    return { subs: d.subs || [], dismissed: d.dismissed || [], settings: Object.assign({ currency: 'PHP', budget: 0, remind: 3 }, d.settings) };
  };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  ST.store = {
    async list() { return get().subs; },
    async dismissed() { return get().dismissed; },
    async dismiss(key) { const d = get(); if (!d.dismissed.includes(key)) d.dismissed.push(key); d.dismissed = d.dismissed.slice(-300); write(d); },
    async settings() { return get().settings; },
    async setSettings(p) { const d = get(); d.settings = Object.assign(d.settings, p); write(d); },
    async create(s) { const d = get(); s.id = uid(); d.subs.push(s); write(d); return s; },
    async update(id, p) { const d = get(); d.subs = d.subs.map(x => x.id === id ? Object.assign({}, x, p) : x); write(d); },
    async remove(id) { const d = get(); d.subs = d.subs.filter(x => x.id !== id); write(d); }
  };
}
export const store = ST.store;

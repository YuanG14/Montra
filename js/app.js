(function () {
  const { esc, money, fmt, nextRenewal, daysUntil, monthly, ink, iso, today, r2, slug } = ST;
  const store = ST.store;
  const $ = (s, r = document) => r.querySelector(s);
  const state = { subs: [], set: { currency: 'PHP', budget: 0, remind: 3 }, q: '', sort: 'next', status: 'active', cat: 'all' };
  const CYC = { weekly: 'wk', monthly: 'mo', yearly: 'yr' };
  const CYCW = { weekly: 'week', monthly: 'month', yearly: 'year' };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const info = s => { const d = nextRenewal(s); return { d, days: daysUntil(d) }; };
  const cur = () => state.set.currency;

  const pill = days => `<span class="pill ${days <= 3 ? 'red' : days <= 7 ? 'amb' : days <= 30 ? 'grn' : 'pur'}">${days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'}</span>`;
  // Brand-colored initial tile. Drop a logo at assets/logos/<name>.svg and it replaces the initial.
  const tile = s => `<span class="tile" style="background:${s.color};color:${ink(s.color)}">${esc(s.name[0].toUpperCase())}<img src="assets/logos/${slug(s.name)}.svg" alt="" onload="this.parentNode.classList.add('logo')" onerror="this.remove()"></span>`;

  function card(s) {
    const on = s.status === 'active', { d, days } = info(s);
    return `<article class="sub${on ? '' : ' dim'}" style="--c:${s.color}">
<div class="top">${tile(s)}<h3>${esc(s.name)}</h3>${s.trial ? '<span class="pill pur">Trial</span>' : ''}
<details class="menu"><summary aria-label="Options for ${esc(s.name)}">&#8943;</summary><div class="mi">
<button data-act="edit" data-id="${s.id}">Edit</button>
<button data-act="status" data-id="${s.id}" data-to="${s.status === 'paused' ? 'active' : 'paused'}">${s.status === 'paused' ? 'Resume' : 'Pause'}</button>
${s.status === 'cancelled' ? `<button data-act="status" data-id="${s.id}" data-to="active">Reactivate</button>` : `<button data-act="status" data-id="${s.id}" data-to="cancelled">Mark as cancelled</button>`}
<button class="danger" data-act="del" data-id="${s.id}">Delete</button></div></details></div>
<div class="bot"><div class="price">${money(s.cost, cur())}<small> /${CYC[s.cycle]}</small></div>
<div class="ren">${on ? `Renews<br><b>${fmt(d)}</b>` : `<b>${cap(s.status)}</b>`}</div></div>
${on ? pill(days) : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}</article>`;
  }

  function empty() {
    return `<section class="empty"><h1>Start with one subscription</h1><p>Add what you pay for each month. Subtrack shows what is due next and what it all adds up to.</p>
<div class="acts"><button class="btn" data-act="add">Add a subscription</button><button class="btn ghost" data-act="sample">Load sample data</button></div></section>`;
  }

  function tip(act) {
    const g = {};
    act.forEach(s => (g[s.category] = g[s.category] || []).push(s));
    const best = Object.entries(g).filter(([c, l]) => l.length > 1 && c !== 'Other').sort((a, b) => b[1].length - a[1].length)[0];
    if (!best) return { t: 'Nothing overlaps', p: 'None of your active subscriptions share a category.' };
    const l = best[1].slice().sort((a, b) => monthly(a) - monthly(b));
    return { t: `${l[0].name} and ${l[1].name} overlap`, p: `You have ${l.length} ${best[0].toLowerCase()} subscriptions. Cancelling the cheapest, ${l[0].name}, could save ${money(r2(monthly(l[0])), cur())} a month.` };
  }

  function overview() {
    if (!state.subs.length) return empty();
    const act = state.subs.filter(s => s.status === 'active');
    const m = r2(act.reduce((a, s) => a + monthly(s), 0)), b = state.set.budget;
    const up = act.map(s => Object.assign({ s }, info(s))).sort((a, c) => a.d - c.d);
    const week = up.filter(x => x.days <= 7).length;
    const pct = b > 0 ? Math.min(100, Math.round(m / b * 100)) : 0, over = b > 0 && m > b;
    const budget = b > 0
      ? `<div class="ring"><svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${pct}% of monthly budget used"><g transform="rotate(-90 60 60)" fill="none" stroke-width="12" stroke-linecap="round"><circle cx="60" cy="60" r="48" stroke="var(--acs)"/><circle cx="60" cy="60" r="48" stroke="${over ? '#D6334A' : 'var(--ac)'}" stroke-dasharray="${(pct * 3.016).toFixed(1)} 301.6"/></g><text x="60" y="68" text-anchor="middle" font-size="24" font-weight="700" fill="currentColor">${pct}%</text></svg>
<div><b>Monthly budget</b><div class="big2">${money(m, cur())} <span class="mu">of ${money(b, cur())}</span></div><div class="${over ? 'bad' : 'good'}">${over ? 'Over budget' : 'On track'}</div></div></div>`
      : `<div><b>Monthly budget</b><p class="mu">Set a limit to see how much of it your subscriptions use.</p><button class="btn ghost" data-act="settings">Set a budget</button></div>`;
    const t = tip(act);
    return `<section class="hero"><div><p class="mu">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: this month you spend</p><h1>${money(m, cur())}</h1>
<div class="chips2"><span class="pill pur">${act.length} active</span><span class="pill pur">${money(r2(m * 12), cur())} a year</span>${week ? `<span class="pill red">${week} due this week</span>` : ''}</div></div>
<div class="panel">${budget}</div></section>
<div class="sec"><h2>Your subscriptions</h2><a class="mu" href="#/cards">View all</a></div>
<div class="grid">${up.slice(0, 5).map(x => card(x.s)).join('')}<button class="add" data-act="add"><b>+</b>Add subscription</button></div>
<div class="two"><section class="panel"><h2>Coming up</h2>${up.length ? `<ul class="tl">${up.slice(0, 4).map(x => `<li><span class="dt"><small>${x.d.toLocaleDateString('en-US', { month: 'short' })}</small><b>${x.d.getDate()}</b></span><i class="dot"></i><span><b>${esc(x.s.name)}</b><br><small class="mu">${money(x.s.cost, cur())} / ${CYCW[x.s.cycle]}</small></span>${pill(x.days)}</li>`).join('')}</ul>` : '<p class="mu">No upcoming renewals.</p>'}</section>
<div class="stack"><section class="panel tip"><b>Smart tip</b><h3>${esc(t.t)}</h3><p>${esc(t.p)}</p></section>
<section class="panel"><label class="inl">Remind me<select data-set="remind">${[1, 3, 7].map(n => `<option value="${n}"${state.set.remind === n ? ' selected' : ''}>${n} day${n > 1 ? 's' : ''} before</option>`).join('')}</select></label><p class="mu sm">Your choice is saved. In-app alerts arrive in the next phase.</p></section></div></div>`;
  }

  function filtered() {
    const l = state.subs.filter(s => (state.status === 'all' || s.status === state.status) && (state.cat === 'all' || s.category === state.cat) && s.name.toLowerCase().includes(state.q.toLowerCase()));
    const k = { next: s => nextRenewal(s).getTime(), cost: s => -monthly(s), name: s => s.name.toLowerCase() }[state.sort];
    return l.sort((a, b) => k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0);
  }
  function gridHtml() {
    const l = filtered();
    return l.map(card).join('') + `<button class="add" data-act="add"><b>+</b>Add subscription</button>` + (l.length ? '' : '<p class="mu none">No subscriptions match these filters.</p>');
  }
  const renderGrid = () => { const g = $('#grid'); if (g) g.innerHTML = gridHtml(); };
  function cardsView() {
    const opt = (v, c, label) => `<option value="${v}"${v === c ? ' selected' : ''}>${label}</option>`;
    return `<div class="sec"><h1 class="h1s">Cards</h1></div>
<div class="tools"><input type="search" data-f="q" placeholder="Search subscriptions" aria-label="Search subscriptions" value="${esc(state.q)}">
<select data-f="status" aria-label="Status">${[['active', 'Active'], ['paused', 'Paused'], ['cancelled', 'Cancelled'], ['all', 'All']].map(a => opt(a[0], state.status, a[1])).join('')}</select>
<select data-f="cat" aria-label="Category">${opt('all', state.cat, 'All categories')}${ST.CATEGORIES.map(c => opt(c, state.cat, c)).join('')}</select>
<select data-f="sort" aria-label="Sort by">${[['next', 'Next renewal'], ['cost', 'Highest cost'], ['name', 'Name']].map(a => opt(a[0], state.sort, a[1])).join('')}</select></div>
<div class="grid" id="grid">${gridHtml()}</div>`;
  }

  function render() {
    const v = location.hash === '#/cards' ? 'cards' : 'overview';
    document.querySelectorAll('[data-tab]').forEach(a => a.dataset.tab === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    $('#app').innerHTML = v === 'cards' ? cardsView() : overview();
  }
  async function refresh() { state.subs = await store.list(); state.set = await store.settings(); render(); }
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }

  const dlg = $('#dlg');
  function openForm(id) {
    const s = id ? state.subs.find(x => x.id === id) : null;
    const v = s || { name: '', cost: '', cycle: 'monthly', nextDate: iso(today()), category: 'Entertainment', trial: false, notes: '', color: '#6C47FF' };
    const sel = (a, b) => a === b ? ' selected' : '';
    dlg.dataset.id = id || ''; dlg.dataset.color = v.color;
    dlg.innerHTML = `<form id="f"><h2>${s ? 'Edit subscription' : 'Add subscription'}</h2>
${s ? '' : `<p class="mu sm">Pick a popular one or fill it in yourself.</p><div class="chipbox">${ST.SERVICES.map((x, i) => `<button type="button" class="chip" data-svc="${i}">${esc(x.name)}</button>`).join('')}</div>`}
<label>Name<input name="name" required maxlength="60" value="${esc(v.name)}"></label>
<div class="row"><label>Cost<input name="cost" type="number" min="0" step="0.01" required value="${v.cost}"></label>
<label>Billing<select name="cycle"><option value="weekly"${sel(v.cycle, 'weekly')}>Weekly</option><option value="monthly"${sel(v.cycle, 'monthly')}>Monthly</option><option value="yearly"${sel(v.cycle, 'yearly')}>Yearly</option></select></label></div>
<div class="row"><label>Next renewal<input name="nextDate" type="date" required value="${v.nextDate}"></label>
<label>Category<select name="category">${ST.CATEGORIES.map(c => `<option${sel(v.category, c)}>${c}</option>`).join('')}</select></label></div>
<label class="chk"><input type="checkbox" name="trial"${v.trial ? ' checked' : ''}> This is a free trial</label>
<label>Notes (optional)<input name="notes" maxlength="120" value="${esc(v.notes || '')}"></label>
<div class="acts"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Save</button></div></form>`;
    dlg.showModal();
  }
  function openSettings() {
    const c = state.set, sel = (a, b) => a === b ? ' selected' : '';
    dlg.dataset.id = '';
    dlg.innerHTML = `<form id="sf"><h2>Settings</h2>
<label>Currency<select name="currency">${['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'SGD', 'AUD'].map(x => `<option${sel(c.currency, x)}>${x}</option>`).join('')}</select></label>
<label>Monthly budget (0 means no budget)<input name="budget" type="number" min="0" step="1" value="${c.budget}"></label>
<label>Remind me<select name="remind">${[1, 3, 7].map(n => `<option value="${n}"${sel(c.remind, n)}>${n} day${n > 1 ? 's' : ''} before renewal</option>`).join('')}</select></label>
<div class="acts"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Save settings</button></div></form>`;
    dlg.showModal();
  }
  async function seed() {
    const t = today(), d = n => iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + n));
    const S = (n, c, days) => { const v = ST.SERVICES.find(x => x.name === n); return { name: n, cost: c, cycle: 'monthly', nextDate: d(days), category: v.category, color: v.color, status: 'active', trial: false, notes: '' }; };
    for (const s of [S('Netflix', 549, 2), S('Spotify', 149, 5), S('YouTube Premium', 159, 9), S('iCloud+', 179, 12), S('Disney+', 369, 21), S('Canva Pro', 500, 25)]) await store.create(s);
  }

  dlg.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, fd = new FormData(f);
    if (f.id === 'f') {
      const p = { name: fd.get('name').trim(), cost: parseFloat(fd.get('cost')), cycle: fd.get('cycle'), nextDate: fd.get('nextDate'), category: fd.get('category'), trial: fd.has('trial'), notes: fd.get('notes').trim(), color: dlg.dataset.color || '#6C47FF' };
      if (!p.name || !(p.cost >= 0) || !p.nextDate) return;
      const id = dlg.dataset.id;
      if (id) await store.update(id, p); else await store.create(Object.assign(p, { status: 'active' }));
      toast(id ? 'Changes saved' : 'Subscription added');
    } else {
      await store.setSettings({ currency: fd.get('currency'), budget: parseFloat(fd.get('budget')) || 0, remind: +fd.get('remind') });
      toast('Settings saved');
    }
    dlg.close(); await refresh();
  });
  document.addEventListener('click', async e => {
    if (!e.target.closest('.menu')) document.querySelectorAll('.menu[open]').forEach(d => d.open = false);
    const t = e.target.closest('[data-act],[data-svc],[data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) return dlg.close();
    if (t.dataset.svc !== undefined) { const v = ST.SERVICES[+t.dataset.svc], f = $('#f'); f.elements.name.value = v.name; f.elements.category.value = v.category; dlg.dataset.color = v.color; return; }
    const { act, id } = t.dataset;
    if (act === 'add') return openForm();
    if (act === 'edit') return openForm(id);
    if (act === 'settings') return openSettings();
    if (act === 'sample') await seed();
    if (act === 'status') { await store.update(id, { status: t.dataset.to }); toast(t.dataset.to === 'active' ? 'Back to active' : cap(t.dataset.to)); }
    if (act === 'del') { if (!confirm('Delete this subscription? This cannot be undone.')) return; await store.remove(id); toast('Subscription deleted'); }
    await refresh();
  });
  document.addEventListener('input', e => { if (e.target.dataset.f === 'q') { state.q = e.target.value; renderGrid(); } });
  document.addEventListener('change', async e => {
    const el = e.target;
    if (el.dataset.f && el.dataset.f !== 'q') { state[el.dataset.f] = el.value; renderGrid(); }
    if (el.dataset.set === 'remind') { await store.setSettings({ remind: +el.value }); state.set.remind = +el.value; toast('Reminder timing saved'); }
  });
  window.addEventListener('hashchange', render);
  refresh();
})();

window.ST = window.ST || {};
(function () {
  const pad = n => String(n).padStart(2, '0');
  ST.iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  ST.parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  ST.today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  // Date `k` billing cycles after `d` (month-end safe: Jan 31 + 1 month = Feb 28/29)
  ST.addCycle = (d, cycle, k = 1) => {
    if (cycle === 'weekly') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * k);
    const months = (cycle === 'yearly' ? 12 : 1) * k;
    const r = new Date(d.getFullYear(), d.getMonth() + months, 1);
    r.setDate(Math.min(d.getDate(), new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()));
    return r;
  };
  // Next renewal on or after today, rolling forward from the saved date
  ST.nextRenewal = s => {
    const anchor = ST.parse(s.nextDate), t = ST.today();
    let k = 0, d = anchor;
    while (d < t && k < 3000) d = ST.addCycle(anchor, s.cycle, ++k);
    return d;
  };
  ST.daysUntil = d => Math.round((d - ST.today()) / 864e5);
  ST.monthly = s => s.cost * ({ weekly: 52 / 12, monthly: 1, yearly: 1 / 12 }[s.cycle] || 1);
  ST.r2 = n => Math.round(n * 100) / 100;
  ST.money = (n, cur) => {
    const f = Number.isInteger(n) ? 0 : 2;
    try {
      return new Intl.NumberFormat(cur === 'PHP' || !cur ? 'en-PH' : 'en-US',
        { style: 'currency', currency: cur || 'PHP', minimumFractionDigits: f, maximumFractionDigits: f }).format(n);
    } catch (e) { return String(n); }
  };
  ST.fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  ST.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  ST.slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Readable text color (black or white) for a brand-colored tile
  ST.ink = hex => {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111' : '#fff';
  };
})();

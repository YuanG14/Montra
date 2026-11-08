import { useMemo, useState } from 'react';
import { money, iso, today, fmt } from './lib/utils.js';
import { monthGrid, renewalsInMonth } from './lib/calendar.js';
import { Tile, Pill, CYCW } from './components.jsx';

const sameDay = (a, b) => iso(a) === iso(b);
const monthLabel = d => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function CalendarPage({ subs, set, A }) {
  const now = today();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(now);
  const events = useMemo(() => renewalsInMonth(subs, month.getFullYear(), month.getMonth()), [subs, month]);
  const grid = useMemo(() => monthGrid(month.getFullYear(), month.getMonth()), [month]);
  const byDay = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const key = iso(event.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    });
    return map;
  }, [events]);
  const selectedEvents = byDay.get(iso(selected)) || [];
  const activeCount = subs.filter(s => s.status === 'active').length;

  const move = delta => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    setSelected(new Date(next.getFullYear(), next.getMonth(), 1));
  };
  const goToday = () => { setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(now); };
  const upcoming = events.filter(e => e.date >= now).slice(0, 5);

  return (
    <section className="calendar-page">
      <div className="sec calendar-heading">
        <div><h1 className="h1s">Calendar</h1><p className="mu sm">See when your active subscriptions renew.</p></div>
        <button className="btn" onClick={A.add}>+ Add subscription</button>
      </div>

      <div className="calendar-layout">
        <section className="panel calendar-panel" aria-label="Renewal calendar">
          <div className="calendar-toolbar">
            <div className="month-nav">
              <button className="calendar-nav" onClick={() => move(-1)} aria-label="Previous month">‹</button>
              <h2>{monthLabel(month)}</h2>
              <button className="calendar-nav" onClick={() => move(1)} aria-label="Next month">›</button>
            </div>
            <button className="btn ghost sm-btn" onClick={goToday}>Today</button>
          </div>
          <div className="calendar-grid calendar-weekdays" aria-hidden="true">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-grid calendar-days">
            {grid.map(cell => {
              const dayEvents = byDay.get(cell.key) || [];
              const isSelected = sameDay(cell.date, selected);
              const isToday = sameDay(cell.date, now);
              return (
                <button
                  type="button"
                  key={cell.key}
                  className={`calendar-day${cell.inMonth ? '' : ' outside'}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => setSelected(cell.date)}
                  aria-label={`${cell.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${dayEvents.length} renewals`}
                  aria-pressed={isSelected}
                >
                  <span className="day-number">{cell.date.getDate()}</span>
                  <span className="day-events">
                    {dayEvents.slice(0, 2).map(event => <span className="calendar-event" key={event.key} title={`${event.sub.name} — ${money(event.sub.cost, set.currency)}`}>{event.sub.name}</span>)}
                    {dayEvents.length > 2 && <span className="calendar-more">+{dayEvents.length - 2} more</span>}
                  </span>
                  {dayEvents.length > 0 && <span className="event-dots" aria-hidden="true">{dayEvents.slice(0, 4).map(event => <i key={event.key} />)}</span>}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend"><span><i className="legend-dot"/> Renewal date</span><span>{activeCount} active subscriptions</span></div>
        </section>

        <aside className="calendar-side">
          <section className="panel selected-panel">
            <p className="mu sm">Selected date</p>
            <h2>{selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            {selectedEvents.length ? (
              <ul className="calendar-renewals">
                {selectedEvents.map(event => (
                  <li key={event.key}>
                    <Tile s={event.sub}/>
                    <div className="renewal-copy"><b>{event.sub.name}</b><span className="mu sm">{money(event.sub.cost, set.currency)} / {CYCW[event.sub.cycle] || event.sub.cycle}</span></div>
                    <button className="text-action" onClick={() => A.edit(event.sub.id)}>Edit</button>
                  </li>
                ))}
              </ul>
            ) : <p className="mu sm calendar-empty">No renewals on this date.</p>}
          </section>
          <section className="panel upcoming-panel">
            <div className="sec"><h2>Upcoming this month</h2><span className="pill pur">{upcoming.length}</span></div>
            {upcoming.length ? <ul className="upcoming-list">
              {upcoming.map(event => <li key={event.key}>
                <span className="upcoming-date"><b>{event.date.getDate()}</b><small>{event.date.toLocaleDateString('en-US', { month: 'short' })}</small></span>
                <span className="upcoming-name"><b>{event.sub.name}</b><small className="mu">{money(event.sub.cost, set.currency)}</small></span>
                <Pill days={Math.round((event.date - now) / 864e5)}/>
              </li>)}
            </ul> : <p className="mu sm">No upcoming renewals for the rest of this month.</p>}
          </section>
        </aside>
      </div>
      {!activeCount && <div className="panel calendar-first"><h2>Your calendar is waiting</h2><p className="mu">Add your first subscription and its renewal date will appear here.</p><button className="btn" onClick={A.add}>Add subscription</button></div>}
    </section>
  );
}

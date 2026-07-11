/* ═══ /community/events — Luma-style events surface ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 5
 *
 * Rebuilt from the old month-grid-only calendar into a Luma-grade events
 * hub: upcoming events render as rich cards (cover, host, date chip, RSVP +
 * social proof), with a month view available as a toggle. Reads through
 * eventsStore (which fixes the prior `registrations`→`event_registrations`
 * table bug) and links each card to the full event page.
 *
 * Skills: component-building, experience-designing, mobile-first-enforcing.
 * Librarians: experience-designer-librarian, frontend-librarian.
 * 2026: Luma event-page anatomy (whitelife.us/guides/luma-events) ·
 *       Mobbin Luma iOS list pattern.
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  listUpcomingEvents,
  listMyRegistrations,
  getRegistrationCount,
  type AppEvent,
} from '../../data/eventsStore';
import { useAuth } from '../../context/useAuth';
import './Calendar.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function dayNum(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDate();
}

export default function Events() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [rsvped, setRsvped] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'month'>('upcoming');

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listUpcomingEvents();
      if (cancelled) return;
      setEvents(list);
      setLoading(false);
      const regs = await listMyRegistrations(profile?.id);
      if (!cancelled) setRsvped(regs);
      const pairs = await Promise.all(
        list.map(async (e) => [e.id, await getRegistrationCount(e.id)] as const),
      );
      if (!cancelled) setCounts(Object.fromEntries(pairs));
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, AppEvent[]> = {};
    events.forEach((ev) => {
      const d = new Date(ev.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        (map[d.getDate()] ??= []).push(ev);
      }
    });
    return map;
  }, [events, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }

  return (
    <div className="events">
      <div className="community-page-header events__header">
        <div>
          <h1>Events</h1>
          <p>Live builds, clinics, and sessions. Save your spot.</p>
        </div>
        <div className="events__view-toggle">
          <button className={`btn btn--ghost btn--sm ${view === 'upcoming' ? 'btn--active' : ''}`} onClick={() => setView('upcoming')}>
            Upcoming
          </button>
          <button className={`btn btn--ghost btn--sm ${view === 'month' ? 'btn--active' : ''}`} onClick={() => setView('month')}>
            <CalendarBlank size={16} /> Month
          </button>
        </div>
      </div>

      {loading && <p className="events__loading">Loading events…</p>}

      {/* ── Upcoming view: Luma-style cards ── */}
      {!loading && view === 'upcoming' && (
        events.length === 0 ? (
          <div className="community-card events__empty">
            <h3>No upcoming events</h3>
            <p>Check back soon — new sessions drop regularly.</p>
          </div>
        ) : (
          <div className="events__list">
            {events.map((ev) => (
              <Link key={ev.id} to={`/community/events/${ev.slug}`} className="events__card">
                <div
                  className="events__card-cover"
                  style={ev.cover_image ? { backgroundImage: `url(${ev.cover_image})` } : undefined}
                >
                  <div className="events__date-chip">
                    <span className="events__date-chip-day">{dayNum(ev.date)}</span>
                    <span className="events__date-chip-mon">{MONTHS[new Date(ev.date + 'T00:00:00').getMonth()].slice(0, 3)}</span>
                  </div>
                </div>
                <div className="events__card-body">
                  <h3 className="events__card-title">{ev.title}</h3>
                  {ev.description && <p className="events__card-desc">{ev.description}</p>}
                  <div className="events__card-meta">
                    <span><Clock size={14} /> {ev.time ?? 'TBD'}</span>
                    <span><MapPin size={14} /> {ev.location_name ?? ev.location_type}</span>
                    <span><Users size={14} /> {counts[ev.id] ?? 0} going</span>
                  </div>
                  <div className="events__card-foot">
                    <span className="events__host">Hosted by {ev.host_name}</span>
                    {rsvped.has(ev.id) ? (
                      <span className="events__rsvp-badge events__rsvp-badge--done">Registered</span>
                    ) : (
                      <span className="events__rsvp-badge">View + RSVP</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* ── Month view ── */}
      {!loading && view === 'month' && (
        <>
          <div className="events__cal-nav">
            <button className="events__cal-nav-btn" onClick={prevMonth} aria-label="Previous month"><CaretLeft size={18} /></button>
            <h2>{MONTHS[month]} {year}</h2>
            <button className="events__cal-nav-btn" onClick={nextMonth} aria-label="Next month"><CaretRight size={18} /></button>
          </div>
          <div className="events__cal-grid">
            {DAYS.map((d) => <div key={d} className="events__cal-day-label">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="events__cal-cell events__cal-cell--empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsByDay[day] ?? [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={day} className={`events__cal-cell ${isToday ? 'events__cal-cell--today' : ''}`}>
                  <span className="events__cal-date">{day}</span>
                  {dayEvents.map((ev) => (
                    <Link key={ev.id} to={`/community/events/${ev.slug}`} className="events__cal-dot" title={ev.title}>
                      {ev.title.slice(0, 14)}{ev.title.length > 14 ? '…' : ''}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

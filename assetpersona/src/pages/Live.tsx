/* ═══ TALK THRU TECH ,  Luma-style Event Timeline ═══ */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Video, Monitor, Plus, CalendarPlus } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import EventToggle from '../components/events/EventToggle';
import AttendeeStack from '../components/events/AttendeeStack';
import { getUpcomingEvents, getPastEvents, getRegistrationCount } from '../data/liveData';
import type { EventData } from '../data/liveData';
import { useAuth } from '../context/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import './Live.css';

/** Group events by date for the timeline layout */
function groupByDate(events: EventData[]): Map<string, EventData[]> {
  const groups = new Map<string, EventData[]>();
  for (const event of events) {
    const existing = groups.get(event.date) || [];
    existing.push(event);
    groups.set(event.date, existing);
  }
  return groups;
}

function formatDateLabel(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

function LocationBadge({ location }: { location: EventData['location'] }) {
  const icon = location.type === 'online'
    ? <Video size={14} />
    : location.type === 'in-person'
      ? <MapPin size={14} />
      : <Monitor size={14} />;

  return (
    <span className="live__card-location">
      {icon}
      <span>{location.name || (location.type === 'online' ? 'Online' : 'In Person')}</span>
    </span>
  );
}

export default function Live() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { profile } = useAuth();

  /* Only show admin controls when Supabase is configured AND user is actually admin.
     In demo mode (no Supabase), nobody gets admin controls on the public page. */
  const isRealAdmin = isSupabaseConfigured && profile?.role === 'admin';

  const events = useMemo(() => {
    return tab === 'upcoming' ? getUpcomingEvents() : getPastEvents();
  }, [tab]);

  const grouped = useMemo(() => groupByDate(events), [events]);

  return (
    <>
      <SEOHead
        title="Talk Thru Tech ,  Live Workshops | Agentic Study Hall"
        description="Free weekly live workshops on AI, vibe coding, and digital marketing. Register and attend upcoming events."
        path="/talkthrutech"
      />

      <section className="live">
        <div className="container">
          {/* ── BRANDED HEADER ── */}
          <div className="live__brand">
            <h1 className="live__brand-title">
              <span className="live__glimmer-text">Talk Thru Tech</span>
            </h1>
            <p className="live__brand-description">
              Live workshops where we break down AI, vibe coding, and digital marketing ,  in real time.
            </p>
          </div>

          {/* ── TOGGLE BAR ── */}
          <div className="live__header">
            <div className="live__header-actions">
              <EventToggle active={tab} onChange={setTab} />
              {isRealAdmin && (
                <Link to="/admin/events" className="btn btn--secondary live__admin-link">
                  <Plus size={14} /> Manage Events
                </Link>
              )}
            </div>
          </div>

          {/* ── TIMELINE ── */}
          <div className="live__timeline">
            {grouped.size === 0 && (
              <div className="live__empty">
                {tab === 'upcoming' ? (
                  <>
                    <CalendarPlus size={48} className="live__empty-icon" />
                    <h2 className="live__empty-title">No upcoming events</h2>
                    <p className="live__empty-text">
                      New workshops are added weekly. Check back soon or follow us on YouTube to get notified.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="live__empty-title">No past events yet</h2>
                    <p className="live__empty-text">
                      Once events are completed, they'll appear here with recordings.
                    </p>
                  </>
                )}
              </div>
            )}

            {Array.from(grouped.entries()).map(([date, dateEvents]) => {
              const label = formatDateLabel(date);
              return (
                <div key={date} className="live__date-group">
                  {/* Date column */}
                  <div className="live__date-col">
                    <span className="live__date-month-day">
                      {label.month} {label.day}
                    </span>
                    <span className="live__date-weekday">{label.weekday}</span>
                  </div>

                  {/* Events column */}
                  <div className="live__events-col">
                    {dateEvents.map((event) => {
                      const regCount = getRegistrationCount(event.id);
                      return (
                        <Link
                          key={event.id}
                          to={`/talkthrutech/${event.slug}`}
                          className="live__card"
                        >
                          <div className="live__card-body">
                            <span className="live__card-time">
                              {event.time}
                              {event.endTime && (
                                <> · <span className="live__card-endtime">{event.endTime}</span></>
                              )}
                            </span>

                            <h3 className="live__card-title">{event.title}</h3>

                            <div className="live__card-meta">
                              <span className="live__card-host">
                                <span className="live__card-host-dot" />
                                By {event.host.name}
                              </span>
                              <LocationBadge location={event.location} />
                            </div>

                            <div className="live__card-footer">
                              <span className={`live__card-status live__card-status--${event.status}`}>
                                {event.status === 'past' ? 'Completed' : event.status === 'live' ? 'Live Now' : 'Register'}
                              </span>
                              {regCount > 0 && <AttendeeStack count={regCount} />}
                            </div>
                          </div>

                          {event.coverImage && (
                            <div className="live__card-cover">
                              <img src={event.coverImage} alt="" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

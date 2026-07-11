/* ═══ /community/events/:slug — Luma-style event page ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 5
 *
 * The full event page: cover hero, host card, when/where, an agenda
 * timeline, social proof, RSVP (register / cancel), add-to-calendar (.ics
 * download), and a share-link copy. Mirrors the Luma anatomy documented at
 * whitelife.us/guides/luma-events and the Mobbin Luma iOS layout.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Users, CalendarPlus, ShareNetwork, VideoCamera, Check, UserCircle,
} from '@phosphor-icons/react';
import {
  getEventBySlug,
  listMyRegistrations,
  getRegistrationCount,
  rsvp,
  cancelRsvp,
  buildEventIcs,
  type AppEvent,
} from '../../data/eventsStore';
import { useAuth } from '../../context/useAuth';
import './EventDetail.css';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useAuth();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const ev = await getEventBySlug(slug);
      if (cancelled) return;
      setEvent(ev);
      setLoading(false);
      if (ev) {
        setCount(await getRegistrationCount(ev.id));
        const regs = await listMyRegistrations(profile?.id);
        if (!cancelled) setRegistered(regs.has(ev.id));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, profile?.id]);

  async function toggleRsvp() {
    if (!event || !profile) return;
    setBusy(true);
    try {
      if (registered) {
        await cancelRsvp(event.id, profile.id);
        setRegistered(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await rsvp(event.id, { id: profile.id, display_name: profile.display_name, email: null });
        setRegistered(true);
        setCount((c) => c + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  function addToCalendar() {
    if (!event) return;
    const url = buildEventIcs(event);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.slug}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user dismissed share sheet — no-op */
    }
  }

  if (loading) return <div className="event-detail event-detail--loading">Loading event…</div>;

  if (!event) {
    return (
      <div className="event-detail event-detail--missing">
        <h1>Event not found</h1>
        <Link to="/community/events" className="btn btn--primary"><ArrowLeft size={14} /> Back to Events</Link>
      </div>
    );
  }

  const full = count;
  const capacity = event.capacity;
  const spotsLeft = capacity ? Math.max(0, capacity - full) : null;
  const dateLabel = new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="event-detail">
      <Link to="/community/events" className="event-detail__back"><ArrowLeft size={16} /> Events</Link>

      <div
        className={`event-detail__cover ${event.cover_image ? '' : 'event-detail__cover--placeholder'}`}
        style={event.cover_image ? { backgroundImage: `url(${event.cover_image})` } : undefined}
      >
        {event.tags.length > 0 && (
          <div className="event-detail__tags">
            {event.tags.map((t) => <span key={t} className="event-detail__tag">{t}</span>)}
          </div>
        )}
      </div>

      <div className="event-detail__grid">
        {/* Main column */}
        <div className="event-detail__main">
          <h1 className="event-detail__title">{event.title}</h1>

          <div className="event-detail__facts">
            <div className="event-detail__fact">
              <Clock size={18} weight="duotone" />
              <div>
                <strong>{dateLabel}</strong>
                <span>{event.time ?? 'TBD'}{event.end_time ? ` – ${event.end_time}` : ''}</span>
              </div>
            </div>
            <div className="event-detail__fact">
              <MapPin size={18} weight="duotone" />
              <div>
                <strong>{event.location_name ?? event.location_type}</strong>
                <span>{event.location_type === 'online' ? 'Online event' : event.location_address ?? 'In person'}</span>
              </div>
            </div>
          </div>

          {(event.full_description || event.description) && (
            <section className="event-detail__about">
              <h2>About this event</h2>
              <p>{event.full_description ?? event.description}</p>
            </section>
          )}

          {event.agenda.length > 0 && (
            <section className="event-detail__agenda">
              <h2>Agenda</h2>
              <ul>
                {event.agenda.map((item, i) => (
                  <li key={i}>
                    <span className="event-detail__agenda-time">{item.time}</span>
                    <span className="event-detail__agenda-label">{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* RSVP rail */}
        <aside className="event-detail__rail">
          <div className="event-detail__rsvp-card">
            <div className="event-detail__social-proof">
              <Users size={16} weight="duotone" /> {full} going
              {spotsLeft !== null && spotsLeft <= 10 && (
                <span className="event-detail__spots">· {spotsLeft} spots left</span>
              )}
            </div>

            {registered ? (
              <button className="btn btn--secondary event-detail__rsvp-btn" onClick={toggleRsvp} disabled={busy}>
                <Check size={16} /> {busy ? 'Updating…' : "You're in — cancel?"}
              </button>
            ) : (
              <button
                className="btn btn--primary event-detail__rsvp-btn"
                onClick={toggleRsvp}
                disabled={busy || !profile || spotsLeft === 0}
              >
                {spotsLeft === 0 ? 'Event full' : busy ? 'Registering…' : 'Register'}
              </button>
            )}

            <div className="event-detail__rail-actions">
              <button className="event-detail__rail-action" onClick={addToCalendar}>
                <CalendarPlus size={16} /> Add to calendar
              </button>
              <button className="event-detail__rail-action" onClick={share}>
                <ShareNetwork size={16} /> {copied ? 'Link copied' : 'Share'}
              </button>
            </div>

            {registered && event.location_link && (
              <a href={event.location_link} target="_blank" rel="noopener noreferrer" className="btn btn--ghost event-detail__join">
                <VideoCamera size={16} /> Join link
              </a>
            )}
          </div>

          <div className="event-detail__host">
            {event.host_avatar ? (
              <img src={event.host_avatar} alt={event.host_name} className="event-detail__host-avatar" />
            ) : (
              <div className="event-detail__host-avatar event-detail__host-avatar--ph"><UserCircle size={28} weight="duotone" /></div>
            )}
            <div>
              <span className="event-detail__host-label">Hosted by</span>
              <strong className="event-detail__host-name">{event.host_name}</strong>
              {event.host_title && <span className="event-detail__host-title">{event.host_title}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

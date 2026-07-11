/* ═══ EVENT DETAIL PAGE — Luma-style Overhaul ═══ */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  VideoCamera, 
  Monitor, 
  ArrowSquareOut, 
  ShareNetwork, 
  Check 
} from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import AttendeeStack from '../components/events/AttendeeStack';
import {
  getEventBySlug,
  getRegistrationCount,
  registerForEvent,
  isRegistered,
  getEventRegistrations,
} from '../data/liveData';
import { useAuth } from '../context/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import './EventDetail.css';

function formatFullDate(isoDate: string, time?: string) {
  const d = new Date(isoDate + 'T12:00:00');
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return time ? `${dateStr} · ${time}` : dateStr;
}

function getMonthAbbrev(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function getDayNumber(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.getDate();
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { profile, user } = useAuth();
  const event = getEventBySlug(slug || '');

  const userEmail = user?.email || profile?.display_name || '';
  const userName = profile?.display_name || user?.email || '';

  const [registered, setRegistered] = useState(() =>
    event ? isRegistered(event.id, userEmail) : false
  );
  const [regCount, setRegCount] = useState(() =>
    event ? getRegistrationCount(event.id) : 0
  );
  const [showRegForm, setShowRegForm] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <section className="event-detail">
        <div className="container">
          <div className="event-detail__not-found">
            <h1>Event not found</h1>
            <p>This event doesn't exist or may have been removed.</p>
            <Link to="/talkthrutech" className="btn btn--secondary">
              <ArrowLeft size={16} /> Back to Events
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isPast = event.status === 'past';
  const isFull = event.capacity ? regCount >= event.capacity : false;

  const locationIcon = event.location.type === 'online'
    ? <VideoCamera size={18} />
    : event.location.type === 'in-person'
      ? <MapPin size={18} />
      : <Monitor size={18} />;

  function handleRegister() {
    if (userEmail) {
      registerForEvent(event!.id, userEmail, userName);
      setRegistered(true);
      setRegCount((c) => c + 1);
      return;
    }
    setShowRegForm(true);
  }

  function handleFormRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regEmail.trim() || !regName.trim()) return;
    registerForEvent(event!.id, regEmail.trim(), regName.trim());
    setRegistered(true);
    setRegCount((c) => c + 1);
    setShowRegForm(false);
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const registrants = getEventRegistrations(event.id);

  return (
    <>
      <SEOHead
        title={`${event.title} | Agentic Study Hall`}
        description={event.description}
        path={`/talkthrutech/${event.slug}`}
      />

      <section className="event-detail">
        <div className="container">
          
          {/* ── BACK LINK ── */}
          <Link to="/talkthrutech" className="event-detail__back">
            <ArrowLeft size={14} />
            <span>All Events</span>
          </Link>

          {/* ── LUMA TWO-COLUMN LAYOUT ── */}
          <div className="event-detail__layout">

            {/* ── LEFT COLUMN: COVER, HOSTS, ATTENDEES ── */}
            <div className="event-detail__left-col">
              
              {/* Cover Image */}
              {event.coverImage && (
                <div className="event-detail__cover-box">
                  <img src={event.coverImage} alt={event.title} className="event-detail__cover-img" />
                </div>
              )}

              {/* Presented / Hosted By */}
              <div className="event-detail__presented-by">
                <span className="presented-label">Presented By</span>
                <div className="event-detail__host-row">
                  <div className="event-detail__host-avatar">
                    {event.host.avatar ? (
                      <img src={event.host.avatar} alt={event.host.name} />
                    ) : (
                      <span className="event-detail__host-initials">
                        {event.host.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="event-detail__host-meta">
                    <span className="host-name">{event.host.name}</span>
                    {event.host.title && <span className="host-title">{event.host.title}</span>}
                  </div>
                </div>
              </div>

              {/* Attendee Stack ("Going") */}
              {regCount > 0 && (
                <div className="event-detail__attendees-section">
                  <span className="going-label">{regCount} {isPast ? 'Attended' : 'Going'}</span>
                  <div className="event-detail__attendees-list">
                    <AttendeeStack count={regCount} maxVisible={5} size="md" />
                  </div>
                </div>
              )}

              {/* Tags & Meta Details */}
              {event.tags.length > 0 && (
                <div className="event-detail__tags-container">
                  {event.tags.map((tag) => (
                    <span key={tag} className="event-detail__tag-badge">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: DETAILS, RSVP CARD, ABOUT DESCRIPTION ── */}
            <div className="event-detail__right-col">
              
              {/* Featured Badge */}
              <span className="featured-badge">Featured in Tech</span>

              {/* Event Title */}
              <h1 className="event-detail__title">{event.title}</h1>

              {/* Date & Time Widget Row */}
              <div className="luma-info-row">
                <div className="luma-date-badge">
                  <span className="luma-date-badge__month">{getMonthAbbrev(event.date)}</span>
                  <span className="luma-date-badge__day">{getDayNumber(event.date)}</span>
                </div>
                <div className="luma-info-text">
                  <span className="info-primary">{formatFullDate(event.date, event.time)}</span>
                  {event.endTime && (
                    <span className="info-secondary">
                      <Clock size={14} />
                      <span>Duration: {event.duration}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Location Widget Row */}
              <div className="luma-info-row">
                <div className="luma-location-badge">
                  {locationIcon}
                </div>
                <div className="luma-info-text">
                  <span className="info-primary">
                    {event.location.name || (event.location.type === 'online' ? 'Online Session' : 'In-Person Venue')}
                  </span>
                  {event.location.address && (
                    <span className="info-secondary">
                      {event.location.address}
                    </span>
                  )}
                </div>
              </div>

              {/* Registration RSVP Card */}
              <div className="luma-registration-card">
                <div className="reg-card-header">
                  <span>Registration</span>
                </div>
                <div className="reg-card-body">
                  {/* Capacity Bar */}
                  {event.capacity && !isPast && (
                    <div className="luma-capacity-container">
                      <div className="luma-capacity-bar">
                        <div
                          className="luma-capacity-fill"
                          style={{ width: `${Math.min(100, (regCount / event.capacity) * 100)}%` }}
                        />
                      </div>
                      <span className="luma-capacity-text">
                        {Math.max(0, event.capacity - regCount)} spots remaining
                      </span>
                    </div>
                  )}

                  {/* Actions CTA */}
                  {isPast ? (
                    event.youtubeUrl ? (
                      <a
                        href={event.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-luma-cta is-active-btn"
                      >
                        <span>Watch Video Recording</span>
                        <ArrowSquareOut size={14} />
                      </a>
                    ) : (
                      <span className="ended-label">This event has ended</span>
                    )
                  ) : registered ? (
                    <div className="luma-registered-badge">
                      <Check size={16} weight="bold" />
                      <span>You're Registered</span>
                    </div>
                  ) : isFull ? (
                    <button className="btn-luma-cta is-waitlist" onClick={handleRegister}>
                      <span>Join Waitlist</span>
                    </button>
                  ) : showRegForm ? (
                    <form onSubmit={handleFormRegister} className="luma-reg-form">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="luma-reg-input"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="luma-reg-input"
                      />
                      <button type="submit" className="btn-luma-cta">
                        Confirm RSVP
                      </button>
                    </form>
                  ) : (
                    <button
                      className="btn-luma-cta"
                      onClick={handleRegister}
                    >
                      Register for Event
                    </button>
                  )}

                  {/* Share Action */}
                  <button className="btn-luma-share" onClick={handleShare}>
                    <ShareNetwork size={14} />
                    <span>{copied ? 'Link Copied!' : 'Share Event Link'}</span>
                  </button>
                </div>
              </div>

              {/* About Event Description */}
              {event.fullDescription && (
                <div className="event-detail__description">
                  <h2 className="description-title">About this event</h2>
                  <div className="description-text">
                    {event.fullDescription.split('\n').map((paragraph, i) => (
                      paragraph.trim() ? (
                        <p key={i}>{paragraph}</p>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Registrants List */}
              {isSupabaseConfigured && profile?.role === 'admin' && registrants.length > 0 && (
                <div className="event-detail__admin-registrants">
                  <h2 className="description-title">Registrants Log ({registrants.length})</h2>
                  <div className="admin-registrant-list">
                    {registrants.map((r) => (
                      <div key={r.id} className="admin-registrant-row">
                        <span className="reg-name">{r.displayName}</span>
                        <span className="reg-email">{r.email}</span>
                        <span className="reg-date">
                          {new Date(r.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

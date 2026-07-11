/* ═══ ADMIN EVENT MANAGER ═══ */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash, PencilSimple, Eye, CalendarBlank, Clock,
  Video, Check,
} from '@phosphor-icons/react';
import {
  getAllEvents, saveEvent, deleteEvent, publishEvent, markEventPast,
  getRegistrationCount,
  type EventData,
} from '../../data/liveData';
import '../Admin.css';

type EditorMode = 'list' | 'create' | 'edit';

const EMPTY_EVENT: Partial<EventData> = {
  title: '',
  description: '',
  fullDescription: '',
  date: '',
  time: '7:00 PM',
  endTime: '8:00 PM',
  duration: '60 min',
  status: 'draft',
  location: { type: 'online', name: 'YouTube Live' },
  host: { name: 'Frank Lawrence Jr.', title: 'Agentic Study Hall' },
  tags: [],
  guest: '',
  capacity: 200,
};

export default function EventManager() {
  const [mode, setMode] = useState<EditorMode>('list');
  const [events, setEvents] = useState<EventData[]>(() => getAllEvents());
  const [editingEvent, setEditingEvent] = useState<Partial<EventData>>(EMPTY_EVENT);
  const [tagInput, setTagInput] = useState('');

  const refresh = useCallback(() => {
    setEvents(getAllEvents());
  }, []);

  function handleCreate() {
    setEditingEvent({ ...EMPTY_EVENT });
    setTagInput('');
    setMode('create');
  }

  function handleEdit(event: EventData) {
    setEditingEvent({ ...event });
    setTagInput(event.tags.join(', '));
    setMode('edit');
  }

  function handleSave() {
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveEvent({
      ...editingEvent,
      tags,
    });
    refresh();
    setMode('list');
  }

  function handleDelete(id: string) {
    deleteEvent(id);
    refresh();
  }

  function handlePublish(id: string) {
    publishEvent(id);
    refresh();
  }

  function handleMarkPast(id: string) {
    markEventPast(id);
    refresh();
  }

  function updateField<K extends keyof EventData>(key: K, value: EventData[K]) {
    setEditingEvent((prev) => ({ ...prev, [key]: value }));
  }

  // ── LIST VIEW ──
  if (mode === 'list') {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Event Manager</h1>
            <p className="admin-page__subtitle">
              {events.length === 0
                ? 'No events yet. Create your first event.'
                : `${events.length} event${events.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button className="btn btn--primary" onClick={handleCreate}>
            <Plus size={16} weight="bold" /> New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="admin-page__empty">
            <CalendarBlank size={48} weight="duotone" className="admin-page__empty-icon" />
            <h2>No events created</h2>
            <p>Events you create here will appear on the Live Workshops page for your audience to register.</p>
            <button className="btn btn--primary" onClick={handleCreate}>
              <Plus size={16} weight="bold" /> Create Your First Event
            </button>
          </div>
        ) : (
          <div className="admin-page__list">
            {events.map((event) => {
              const regCount = getRegistrationCount(event.id);
              return (
                <div key={event.id} className="admin-page__row">
                  <div className="admin-page__row-info">
                    <div className="admin-page__row-top">
                      <span className={`admin-page__status admin-page__status--${event.status}`}>
                        {event.status}
                      </span>
                      <span className="admin-page__row-date">
                        <CalendarBlank size={14} /> {event.date} · {event.time}
                      </span>
                    </div>
                    <h3 className="admin-page__row-title">{event.title || 'Untitled Event'}</h3>
                    <div className="admin-page__row-meta">
                      <span><Video size={14} /> {event.location.name}</span>
                      <span><Clock size={14} /> {event.duration}</span>
                      {regCount > 0 && (
                        <span className="admin-page__row-regs">{regCount} registered</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-page__row-actions">
                    {event.status === 'draft' && (
                      <button className="btn btn--sm btn--success" onClick={() => handlePublish(event.id)} title="Publish">
                        <Check size={14} /> Publish
                      </button>
                    )}
                    {event.status === 'upcoming' && (
                      <button className="btn btn--sm btn--ghost" onClick={() => handleMarkPast(event.id)} title="Mark as past">
                        Mark Past
                      </button>
                    )}
                    <Link to={`/talkthrutech/${event.slug}`} className="btn btn--sm btn--ghost" title="Preview">
                      <Eye size={14} />
                    </Link>
                    <button className="btn btn--sm btn--ghost" onClick={() => handleEdit(event)} title="Edit">
                      <PencilSimple size={14} />
                    </button>
                    <button className="btn btn--sm btn--danger" onClick={() => handleDelete(event.id)} title="Delete">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── EDITOR VIEW ──
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{mode === 'create' ? 'Create Event' : 'Edit Event'}</h1>
          <p className="admin-page__subtitle">Fill in the event details. Save as draft to review before publishing.</p>
        </div>
        <div className="admin-page__header-actions">
          <button className="btn btn--ghost" onClick={() => setMode('list')}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave}>
            {mode === 'create' ? 'Save Event' : 'Update Event'}
          </button>
        </div>
      </div>

      <div className="admin-page__form">
        {/* Title */}
        <div className="admin-page__field">
          <label className="admin-page__label">Event Title *</label>
          <input
            type="text"
            className="admin-page__input"
            placeholder="e.g. Building an API Route with Gemini"
            value={editingEvent.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        {/* Short Description */}
        <div className="admin-page__field">
          <label className="admin-page__label">Short Description</label>
          <input
            type="text"
            className="admin-page__input"
            placeholder="One-line teaser shown on event cards"
            value={editingEvent.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        {/* Date + Time row */}
        <div className="admin-page__row-fields">
          <div className="admin-page__field">
            <label className="admin-page__label">Date *</label>
            <input
              type="date"
              className="admin-page__input"
              value={editingEvent.date || ''}
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Start Time</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="7:00 PM"
              value={editingEvent.time || ''}
              onChange={(e) => updateField('time', e.target.value)}
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">End Time</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="8:00 PM"
              value={editingEvent.endTime || ''}
              onChange={(e) => updateField('endTime', e.target.value)}
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Duration</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="60 min"
              value={editingEvent.duration || ''}
              onChange={(e) => updateField('duration', e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="admin-page__row-fields">
          <div className="admin-page__field">
            <label className="admin-page__label">Location Type</label>
            <select
              className="admin-page__input"
              value={editingEvent.location?.type || 'online'}
              onChange={(e) =>
                updateField('location', {
                  ...editingEvent.location!,
                  type: e.target.value as 'online' | 'in-person' | 'hybrid',
                })
              }
            >
              <option value="online">Online</option>
              <option value="in-person">In Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Venue / Platform Name</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="YouTube Live, Zoom, venue name..."
              value={editingEvent.location?.name || ''}
              onChange={(e) =>
                updateField('location', { ...editingEvent.location!, name: e.target.value })
              }
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Link / Address</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="Meeting URL or physical address"
              value={editingEvent.location?.link || editingEvent.location?.address || ''}
              onChange={(e) =>
                updateField('location', {
                  ...editingEvent.location!,
                  link: editingEvent.location?.type === 'online' ? e.target.value : undefined,
                  address: editingEvent.location?.type !== 'online' ? e.target.value : undefined,
                })
              }
            />
          </div>
        </div>

        {/* Host */}
        <div className="admin-page__row-fields">
          <div className="admin-page__field">
            <label className="admin-page__label">Host Name</label>
            <input
              type="text"
              className="admin-page__input"
              value={editingEvent.host?.name || ''}
              onChange={(e) =>
                updateField('host', { ...editingEvent.host!, name: e.target.value })
              }
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Host Title / Org</label>
            <input
              type="text"
              className="admin-page__input"
              value={editingEvent.host?.title || ''}
              onChange={(e) =>
                updateField('host', { ...editingEvent.host!, title: e.target.value })
              }
            />
          </div>
        </div>

        {/* Tags */}
        <div className="admin-page__field">
          <label className="admin-page__label">Tags (comma-separated)</label>
          <input
            type="text"
            className="admin-page__input"
            placeholder="Vibe Coding, API, Gemini"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </div>

        {/* Guest + Capacity */}
        <div className="admin-page__row-fields">
          <div className="admin-page__field">
            <label className="admin-page__label">Featured Guest</label>
            <input
              type="text"
              className="admin-page__input"
              placeholder="Leave empty if none"
              value={editingEvent.guest || ''}
              onChange={(e) => updateField('guest', e.target.value)}
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">Capacity</label>
            <input
              type="number"
              className="admin-page__input"
              value={editingEvent.capacity || ''}
              onChange={(e) => updateField('capacity', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* YouTube / LinkedIn URLs */}
        <div className="admin-page__row-fields">
          <div className="admin-page__field">
            <label className="admin-page__label">YouTube URL (for recordings)</label>
            <input
              type="url"
              className="admin-page__input"
              placeholder="https://youtube.com/watch?v=..."
              value={editingEvent.youtubeUrl || ''}
              onChange={(e) => updateField('youtubeUrl', e.target.value)}
            />
          </div>
          <div className="admin-page__field">
            <label className="admin-page__label">LinkedIn URL</label>
            <input
              type="url"
              className="admin-page__input"
              placeholder="https://linkedin.com/..."
              value={editingEvent.linkedinUrl || ''}
              onChange={(e) => updateField('linkedinUrl', e.target.value)}
            />
          </div>
        </div>

        {/* Full Description */}
        <div className="admin-page__field">
          <label className="admin-page__label">Full Description</label>
          <textarea
            className="admin-page__textarea"
            rows={10}
            placeholder="Rich event description. Use line breaks for paragraphs."
            value={editingEvent.fullDescription || ''}
            onChange={(e) => updateField('fullDescription', e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="admin-page__field">
          <label className="admin-page__label">Status</label>
          <select
            className="admin-page__input"
            value={editingEvent.status || 'draft'}
            onChange={(e) => updateField('status', e.target.value as EventData['status'])}
          >
            <option value="draft">Draft (not visible to public)</option>
            <option value="upcoming">Upcoming (visible, accepting registrations)</option>
            <option value="live">Live Now</option>
            <option value="past">Past (completed)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ═══ EVENTS STORE — Luma-grade event data layer ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1
 *
 * Wraps the existing `events` + `event_registrations` tables
 * (20260414180447_create_events_system.sql) and the new `agenda` column
 * (20260613100200). This store fixes a latent bug: Calendar.tsx queried a
 * non-existent `registrations` table — the real table is
 * `event_registrations`. Every events surface now reads through here.
 *
 * Also provides client-side .ics generation so a Luma-style "Add to
 * calendar" works with no backend round-trip.
 *
 * Routing: localStorage seed in bypass / unconfigured mode, Supabase
 * otherwise — same interface either way.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

export interface AgendaItem {
  time: string;
  label: string;
}

export interface AppEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  full_description: string | null;
  date: string; // YYYY-MM-DD
  time: string | null;
  end_time: string | null;
  status: string;
  location_type: string;
  location_name: string | null;
  location_address: string | null;
  location_link: string | null;
  cover_image: string | null;
  capacity: number | null;
  agenda: AgendaItem[];
  tags: string[];
  host_name: string;
  host_title: string | null;
  host_avatar: string | null;
}

const EVENT_COLS =
  'id, slug, title, description, full_description, date, time, end_time, status, location_type, location_name, location_address, location_link, cover_image, capacity, agenda, tags, host_name, host_title, host_avatar';

/* ── Bypass seed so the events surface is alive in dev ── */
function seedEvents(): AppEvent[] {
  const base = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: 'evt-build-night',
      slug: 'agentic-build-night',
      title: 'Agentic Build Night',
      description: 'Ship a small AI tool live with the community.',
      full_description:
        'Bring an idea, leave with a working prototype. We build in the open, share screens, and help each other past the stuck points. All levels welcome — the Builders run point, everyone learns.',
      date: iso(4),
      time: '6:00 PM',
      end_time: '8:00 PM',
      status: 'upcoming',
      location_type: 'online',
      location_name: 'Study Hall Live',
      location_address: null,
      location_link: 'https://meet.example.com/agentic-build-night',
      cover_image: null,
      capacity: 50,
      agenda: [
        { time: '6:00 PM', label: 'Doors + intros' },
        { time: '6:15 PM', label: 'Pick your build + pair up' },
        { time: '6:30 PM', label: 'Heads-down build sprint' },
        { time: '7:45 PM', label: 'Show and tell' },
      ],
      tags: ['Build', 'Live', 'Hands-on'],
      host_name: 'Frank Lawrence',
      host_title: 'Founder, AssetPersona',
      host_avatar: null,
    },
    {
      id: 'evt-prompt-clinic',
      slug: 'prompt-clinic',
      title: 'Prompt Clinic',
      description: 'Bring a prompt that is not working. Leave with one that does.',
      full_description:
        'A working session on getting useful answers out of AI. We take real prompts from the room, diagnose why they fall flat, and rebuild them with the role / task / shape pattern.',
      date: iso(11),
      time: '12:00 PM',
      end_time: '1:00 PM',
      status: 'upcoming',
      location_type: 'online',
      location_name: 'Study Hall Live',
      location_address: null,
      location_link: 'https://meet.example.com/prompt-clinic',
      cover_image: null,
      capacity: 100,
      agenda: [
        { time: '12:00 PM', label: 'Warm-up: one prompt, two ways' },
        { time: '12:15 PM', label: 'Live prompt teardowns' },
        { time: '12:50 PM', label: 'Takeaways + your next prompt' },
      ],
      tags: ['Prompting', 'Live'],
      host_name: 'Frank Lawrence',
      host_title: 'Founder, AssetPersona',
      host_avatar: null,
    },
  ];
}

const LS_RSVP = 'ap_event_rsvps';

function readLocalRsvps(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_RSVP) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function writeLocalRsvps(ids: string[]): void {
  try {
    localStorage.setItem(LS_RSVP, JSON.stringify([...new Set(ids)]));
  } catch {
    /* ignore */
  }
}

/* ════════════════════ Reads ════════════════════ */

export async function listUpcomingEvents(): Promise<AppEvent[]> {
  if (!shouldUseRemote()) {
    return seedEvents().sort((a, b) => a.date.localeCompare(b.date));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('events')
    .select(EVENT_COLS)
    .in('status', ['upcoming', 'live'])
    .order('date', { ascending: true });
  return ((data as AppEvent[]) ?? []).map(normalizeEvent);
}

export async function getEventBySlug(slug: string): Promise<AppEvent | null> {
  if (!shouldUseRemote()) {
    return seedEvents().find((e) => e.slug === slug) ?? null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('events')
    .select(EVENT_COLS)
    .eq('slug', slug)
    .maybeSingle();
  return data ? normalizeEvent(data as AppEvent) : null;
}

function normalizeEvent(e: AppEvent): AppEvent {
  return { ...e, agenda: Array.isArray(e.agenda) ? e.agenda : [], tags: e.tags ?? [] };
}

/* ════════════════════ RSVP ════════════════════ */

export async function listMyRegistrations(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  if (!shouldUseRemote()) return new Set(readLocalRsvps());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('event_registrations')
    .select('event_id')
    .eq('user_id', userId);
  return new Set(((data as { event_id: string }[]) ?? []).map((r) => r.event_id));
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  if (!shouldUseRemote()) {
    // Deterministic synthetic count so the social-proof line looks alive in dev.
    let h = 0;
    for (let i = 0; i < eventId.length; i++) h = (h * 31 + eventId.charCodeAt(i)) | 0;
    return 6 + (Math.abs(h) % 30);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('event_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);
  return count ?? 0;
}

export async function rsvp(
  eventId: string,
  user: { id: string; display_name: string; email?: string | null },
): Promise<void> {
  if (!shouldUseRemote()) {
    writeLocalRsvps([...readLocalRsvps(), eventId]);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('event_registrations').upsert(
    {
      event_id: eventId,
      user_id: user.id,
      email: user.email ?? `${user.id}@member.local`,
      display_name: user.display_name,
    },
    { onConflict: 'event_id,email' },
  );
}

export async function cancelRsvp(eventId: string, userId: string): Promise<void> {
  if (!shouldUseRemote()) {
    writeLocalRsvps(readLocalRsvps().filter((id) => id !== eventId));
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
}

/* ════════════════════ Add to calendar (.ics) ════════════════════ */

/** Parse "6:00 PM" → { h, m } 24h. Returns null if unparseable. */
function parseTime(t: string | null): { h: number; m: number } | null {
  if (!t) return null;
  const match = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const ap = match[3]?.toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return { h, m };
}

function icsStamp(date: string, time: string | null): string {
  const t = parseTime(time);
  const [y, mo, d] = date.split('-').map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y, mo - 1, d, t?.h ?? 9, t?.m ?? 0));
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Build a downloadable .ics blob URL for a single event. */
export function buildEventIcs(e: AppEvent): string {
  const dtStart = icsStamp(e.date, e.time);
  const dtEnd = icsStamp(e.date, e.end_time ?? e.time);
  const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AssetPersona//Study Hall//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}@assetpersona`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escape(e.title)}`,
    `DESCRIPTION:${escape(e.description ?? '')}`,
    `LOCATION:${escape(e.location_link ?? e.location_name ?? '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
}

// @ts-nocheck
/* ═══ EVENT DATA — Supabase + localStorage fallback ═══
 * When Supabase is configured, all CRUD hits the DB.
 * When running in demo mode (no creds), falls back to localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface EventLocation {
  type: 'online' | 'in-person' | 'hybrid';
  name: string;
  address?: string;
  link?: string;
}

export interface EventHost {
  name: string;
  avatar?: string;
  title?: string;
}

export interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;           // ISO date YYYY-MM-DD
  time: string;
  endTime?: string;
  duration: string;
  status: 'upcoming' | 'live' | 'past' | 'draft';
  location: EventLocation;
  coverImage?: string;
  host: EventHost;
  tags: string[];
  guest?: string;
  capacity?: number;
  registrationUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  email: string;
  displayName: string;
  registeredAt: string;
}

export interface GiveawayItem {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'consumer' | 'business';
}

/* ═══════════════════════════════════════════
 * SUPABASE ↔ LOCAL MAPPING
 * Maps between Supabase snake_case and client camelCase
 * ═══════════════════════════════════════════ */

function dbToEvent(row: Record<string, unknown>): EventData {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) || '',
    fullDescription: (row.full_description as string) || '',
    date: row.date as string,
    time: (row.time as string) || '7:00 PM',
    endTime: row.end_time as string | undefined,
    duration: (row.duration as string) || '60 min',
    status: (row.status as EventData['status']) || 'draft',
    location: {
      type: (row.location_type as EventLocation['type']) || 'online',
      name: (row.location_name as string) || 'YouTube Live',
      address: row.location_address as string | undefined,
      link: row.location_link as string | undefined,
    },
    coverImage: row.cover_image as string | undefined,
    host: {
      name: (row.host_name as string) || 'Frank Lawrence Jr.',
      title: row.host_title as string | undefined,
      avatar: row.host_avatar as string | undefined,
    },
    tags: (row.tags as string[]) || [],
    guest: row.guest as string | undefined,
    capacity: row.capacity as number | undefined,
    youtubeUrl: row.youtube_url as string | undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function eventToDb(event: Partial<EventData>) {
  return {
    slug: event.slug,
    title: event.title,
    description: event.description,
    full_description: event.fullDescription,
    date: event.date,
    time: event.time,
    end_time: event.endTime,
    duration: event.duration,
    status: event.status,
    location_type: event.location?.type,
    location_name: event.location?.name,
    location_address: event.location?.address,
    location_link: event.location?.link,
    cover_image: event.coverImage,
    host_name: event.host?.name,
    host_title: event.host?.title,
    host_avatar: event.host?.avatar,
    tags: event.tags,
    guest: event.guest,
    capacity: event.capacity,
    youtube_url: event.youtubeUrl,
  };
}

function dbToRegistration(row: Record<string, unknown>): EventRegistration {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    registeredAt: (row.registered_at as string) || new Date().toISOString(),
  };
}

/* ═══════════════════════════════════════════
 * LOCALSTORAGE FALLBACK (demo mode)
 * ═══════════════════════════════════════════ */

const EVENTS_KEY = 'ap_events';
const REGISTRATIONS_KEY = 'ap_event_registrations';

function loadLocalEvents(): EventData[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EventData[];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: EventData[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function loadLocalRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EventRegistration[];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(regs: EventRegistration[]): void {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ═══════════════════════════════════════════
 * EVENT CRUD — auto-selects Supabase or localStorage
 * ═══════════════════════════════════════════ */

export async function getAllEventsAsync(): Promise<EventData[]> {
  if (!isSupabaseConfigured) return loadLocalEvents();

  const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('getAllEvents error:', error);
    return [];
  }
  return (data || []).map(dbToEvent);
}

export async function getUpcomingEventsAsync(): Promise<EventData[]> {
  if (!isSupabaseConfigured) {
    return loadLocalEvents()
      .filter((e) => e.status === 'upcoming' || e.status === 'live')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .select('*')
    .in('status', ['upcoming', 'live'])
    .order('date', { ascending: true });

  if (error) {
    console.error('getUpcomingEvents error:', error);
    return [];
  }
  return (data || []).map(dbToEvent);
}

export async function getPastEventsAsync(): Promise<EventData[]> {
  if (!isSupabaseConfigured) {
    return loadLocalEvents()
      .filter((e) => e.status === 'past')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .select('*')
    .eq('status', 'past')
    .order('date', { ascending: false });

  if (error) {
    console.error('getPastEvents error:', error);
    return [];
  }
  return (data || []).map(dbToEvent);
}

export async function getEventBySlugAsync(slug: string): Promise<EventData | null> {
  if (!isSupabaseConfigured) {
    return loadLocalEvents().find((e) => e.slug === slug) || null;
  }

  const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return dbToEvent(data);
}

export async function saveEventAsync(event: Partial<EventData> & { id?: string }): Promise<EventData | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    // localStorage fallback
    const events = loadLocalEvents();
    const id = event.id || generateId();
    const idx = events.findIndex((e) => e.id === id);

    const full: EventData = {
      id,
      slug: event.slug || slugify(event.title || 'untitled-event'),
      title: event.title || '',
      description: event.description || '',
      fullDescription: event.fullDescription || '',
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || '7:00 PM',
      endTime: event.endTime,
      duration: event.duration || '60 min',
      status: event.status || 'draft',
      location: event.location || { type: 'online', name: 'YouTube Live' },
      coverImage: event.coverImage,
      host: event.host || { name: 'Frank Lawrence Jr.', title: 'Agentic Study Hall' },
      tags: event.tags || [],
      guest: event.guest,
      capacity: event.capacity,
      registrationUrl: event.registrationUrl,
      youtubeUrl: event.youtubeUrl,
      linkedinUrl: event.linkedinUrl,
      createdAt: idx >= 0 ? events[idx].createdAt : now,
      updatedAt: now,
    };

    if (idx >= 0) events[idx] = full;
    else events.unshift(full);

    saveLocalEvents(events);
    return full;
  }

  // Supabase
  const dbData = eventToDb(event);

  if (event.id) {
    // Update
    const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
      .from('events' as any)
      .update(dbData)
      .eq('id', event.id)
      .select()
      .single();

    if (error) { console.error('saveEvent update error:', error); return null; }
    return data ? dbToEvent(data) : null;
  } else {
    // Insert
    const slug = event.slug || slugify(event.title || 'untitled-event');
    const { data, error } = await supabase
    // @ts-expect-error generated types not regenerated
      .from('events' as any)
      .insert({ ...dbData, slug })
      .select()
      .single();

    if (error) { console.error('saveEvent insert error:', error); return null; }
    return data ? dbToEvent(data) : null;
  }
}

export async function publishEventAsync(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const events = loadLocalEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return false;
    events[idx] = { ...events[idx], status: 'upcoming', updatedAt: new Date().toISOString() };
    saveLocalEvents(events);
    return true;
  }

  const { error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .update({ status: 'upcoming' })
    .eq('id', eventId);

  if (error) { console.error('publishEvent error:', error); return false; }
  return true;
}

export async function markEventPastAsync(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const events = loadLocalEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return false;
    events[idx] = { ...events[idx], status: 'past', updatedAt: new Date().toISOString() };
    saveLocalEvents(events);
    return true;
  }

  const { error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .update({ status: 'past' })
    .eq('id', eventId);

  if (error) { console.error('markEventPast error:', error); return false; }
  return true;
}

export async function deleteEventAsync(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    saveLocalEvents(loadLocalEvents().filter((e) => e.id !== eventId));
    return true;
  }

  const { error } = await supabase
    // @ts-expect-error generated types not regenerated
    .from('events' as any)
    .delete()
    .eq('id', eventId);

  if (error) { console.error('deleteEvent error:', error); return false; }
  return true;
}

/* ═══════════════════════════════════════════
 * REGISTRATION CRUD
 * ═══════════════════════════════════════════ */

export async function getEventRegistrationsAsync(eventId: string): Promise<EventRegistration[]> {
  if (!isSupabaseConfigured) {
    return loadLocalRegistrations().filter((r) => r.eventId === eventId);
  }

  const { data, error } = await supabase
    .from('event_registrations' as any)
    .select('*')
    .eq('event_id', eventId);

  if (error) { console.error('getRegistrations error:', error); return []; }
  return (data || []).map(dbToRegistration);
}

export async function getRegistrationCountAsync(eventId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    return loadLocalRegistrations().filter((r) => r.eventId === eventId).length;
  }

  const { count, error } = await supabase
    .from('event_registrations' as any)
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) { console.error('getRegistrationCount error:', error); return 0; }
  return count || 0;
}

export async function registerForEventAsync(
  eventId: string,
  email: string,
  displayName: string,
  userId?: string
): Promise<EventRegistration | null> {
  if (!isSupabaseConfigured) {
    const regs = loadLocalRegistrations();
    const existing = regs.find((r) => r.eventId === eventId && r.email === email);
    if (existing) return existing;

    const reg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventId,
      email,
      displayName,
      registeredAt: new Date().toISOString(),
    };
    regs.push(reg);
    saveLocalRegistrations(regs);
    return reg;
  }

  const { data, error } = await supabase
    .from('event_registrations' as any)
    .upsert({
      event_id: eventId,
      user_id: userId || null,
      email,
      display_name: displayName,
    }, { onConflict: 'event_id,email' })
    .select()
    .single();

  if (error) { console.error('registerForEvent error:', error); return null; }
  return data ? dbToRegistration(data) : null;
}

export async function isRegisteredAsync(eventId: string, email: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return loadLocalRegistrations().some((r) => r.eventId === eventId && r.email === email);
  }

  const { count, error } = await supabase
    .from('event_registrations' as any)
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('email', email);

  if (error) return false;
  return (count || 0) > 0;
}

export async function unregisterAsync(eventId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured) {
    saveLocalRegistrations(
      loadLocalRegistrations().filter((r) => !(r.eventId === eventId && r.email === email))
    );
    return;
  }

  await supabase
    .from('event_registrations' as any)
    .delete()
    .eq('event_id', eventId)
    .eq('email', email);
}

/* ═══════════════════════════════════════════
 * SYNCHRONOUS WRAPPERS (for components that haven't migrated to async)
 * These only work with localStorage; Supabase components should use async.
 * ═══════════════════════════════════════════ */

export function getAllEvents(): EventData[] { return loadLocalEvents(); }
export function getPublishedEvents(): EventData[] { return loadLocalEvents().filter((e) => e.status !== 'draft'); }
export function getUpcomingEvents(): EventData[] {
  return loadLocalEvents()
    .filter((e) => e.status === 'upcoming' || e.status === 'live')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
export function getPastEvents(): EventData[] {
  return loadLocalEvents()
    .filter((e) => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
export function getEventBySlug(slug: string): EventData | undefined {
  return loadLocalEvents().find((e) => e.slug === slug);
}
export function getEventById(id: string): EventData | undefined {
  return loadLocalEvents().find((e) => e.id === id);
}
export function saveEvent(event: Partial<EventData> & { id?: string }): EventData {
  const events = loadLocalEvents();
  const now = new Date().toISOString();
  const id = event.id || generateId();
  const idx = events.findIndex((e) => e.id === id);
  const full: EventData = {
    id,
    slug: event.slug || slugify(event.title || 'untitled-event'),
    title: event.title || '',
    description: event.description || '',
    fullDescription: event.fullDescription || '',
    date: event.date || new Date().toISOString().split('T')[0],
    time: event.time || '7:00 PM',
    endTime: event.endTime,
    duration: event.duration || '60 min',
    status: event.status || 'draft',
    location: event.location || { type: 'online', name: 'YouTube Live' },
    coverImage: event.coverImage,
    host: event.host || { name: 'Frank Lawrence Jr.', title: 'Agentic Study Hall' },
    tags: event.tags || [],
    guest: event.guest,
    capacity: event.capacity,
    registrationUrl: event.registrationUrl,
    youtubeUrl: event.youtubeUrl,
    linkedinUrl: event.linkedinUrl,
    createdAt: idx >= 0 ? events[idx].createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) events[idx] = full;
  else events.unshift(full);
  saveLocalEvents(events);
  return full;
}
export function publishEvent(eventId: string): EventData | null {
  const events = loadLocalEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], status: 'upcoming', updatedAt: new Date().toISOString() };
  saveLocalEvents(events);
  return events[idx];
}
export function markEventPast(eventId: string): EventData | null {
  const events = loadLocalEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], status: 'past', updatedAt: new Date().toISOString() };
  saveLocalEvents(events);
  return events[idx];
}
export function deleteEvent(eventId: string): void {
  saveLocalEvents(loadLocalEvents().filter((e) => e.id !== eventId));
}
export function getEventRegistrations(eventId: string): EventRegistration[] {
  return loadLocalRegistrations().filter((r) => r.eventId === eventId);
}
export function getRegistrationCount(eventId: string): number {
  return loadLocalRegistrations().filter((r) => r.eventId === eventId).length;
}
export function registerForEvent(eventId: string, email: string, displayName: string): EventRegistration {
  const regs = loadLocalRegistrations();
  const existing = regs.find((r) => r.eventId === eventId && r.email === email);
  if (existing) return existing;
  const reg: EventRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventId, email, displayName,
    registeredAt: new Date().toISOString(),
  };
  regs.push(reg);
  saveLocalRegistrations(regs);
  return reg;
}
export function isRegistered(eventId: string, email: string): boolean {
  return loadLocalRegistrations().some((r) => r.eventId === eventId && r.email === email);
}
export function unregister(eventId: string, email: string): void {
  saveLocalRegistrations(
    loadLocalRegistrations().filter((r) => !(r.eventId === eventId && r.email === email))
  );
}

/* ── WORKSHOP FORMAT (static, not mock — intentional structure) ── */
export const WORKSHOP_FORMAT = [
  { time: '0–10 min', segment: 'Hook & Setup', description: 'Theme of the day + mid-stream giveaway announcement.' },
  { time: '10–35 min', segment: 'Talk Through Tech', description: 'The core masterclass lesson.' },
  { time: '35–45 min', segment: 'App Showcase', description: 'Spotlight a project from an Agentic Study Hall Insider or guest dev.' },
  { time: '45–55 min', segment: 'Live Q&A', description: 'Questions pulled directly from the chat.' },
  { time: '55–60 min', segment: 'Giveaway & CTA', description: 'Final giveaway pull, push to Agentic Study Hall or Discovery Call.' },
];

export const STREAM_CONFIG = {
  platform: 'StreamYard',
  distribution: ['YouTube', 'LinkedIn'],
  schedule: '3x/week, 7 PM Central',
  scalingTarget: 'Daily',
};

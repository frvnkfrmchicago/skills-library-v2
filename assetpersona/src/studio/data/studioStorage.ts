/* ══════════════════════════════════════════
   STUDIO STORAGE
   Supabase-first CRUD with localStorage fallback.

   Lane 5 of AP-CONTENT-HUB-2026-05 added the offline tier:
     - When Supabase is configured AND dev bypass is NOT active, every
       call goes to the studio_pages table (tightened RLS in migration
       20260519100300_create_studio_pages.sql). This is the production
       path — pages survive deploys and follow Frank across devices.
     - When Supabase is unconfigured OR bypass is active, every call
       falls back to localStorage so the visual editor still works in
       local-only development and during admin walk-throughs.

   Function signatures are unchanged (every consumer — StudioList,
   StudioEditor, StudioProvider, DynamicPage — keeps working).
   ══════════════════════════════════════════ */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import type {
  StudioPage,
  StudioPageMeta,
  StudioPageRow,
  CreatePageInput,
  UpdatePageInput,
  PuckData,
} from './types';

const TABLE = 'studio_pages';
const STORAGE_KEY = 'ap_studio_pages';

/* ── Mode helpers ── */

/** Whether to hit Supabase. When false, every call uses localStorage. */
function useSupabase(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/* ── Local cache helpers (fallback path) ── */

function readLocal(): StudioPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudioPage[];
  } catch {
    return [];
  }
}

function writeLocal(pages: StudioPage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {
    /* quota errors non-fatal */
  }
}

function localId(): string {
  // crypto.randomUUID is widely available in modern browsers; fall back to
  // a timestamp-suffixed id in unlikely environments without it.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toMeta(page: StudioPage): StudioPageMeta {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: page.status,
    created_at: page.created_at,
    updated_at: page.updated_at,
  };
}

/* ── Supabase row helpers ── */

function rowToPage(row: StudioPageRow): StudioPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as StudioPage['status'],
    puck_data: row.puck_data as PuckData,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/* ══════════════════════════════════════════
   READS
   ══════════════════════════════════════════ */

/** List all pages (metadata only for the grid) */
export async function listPages(): Promise<StudioPageMeta[]> {
  if (!useSupabase()) {
    return readLocal()
      .map(toMeta)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('id, slug, title, status, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Studio] listPages error — falling back to localStorage:', error);
    return readLocal()
      .map(toMeta)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  return (data ?? []) as StudioPageMeta[];
}

/** Get a single page by ID (includes full puck_data) */
export async function getPage(id: string): Promise<StudioPage | null> {
  if (!useSupabase()) {
    return readLocal().find((p) => p.id === id) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Studio] getPage error — falling back to localStorage:', error);
    return readLocal().find((p) => p.id === id) ?? null;
  }

  return data ? rowToPage(data as StudioPageRow) : null;
}

/** Get a single page by slug (for public rendering) */
export async function getPageBySlug(slug: string): Promise<StudioPage | null> {
  if (!useSupabase()) {
    return (
      readLocal().find((p) => p.slug === slug && p.status === 'published') ?? null
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Studio] getPageBySlug error — falling back to localStorage:', error);
    return (
      readLocal().find((p) => p.slug === slug && p.status === 'published') ?? null
    );
  }

  return data ? rowToPage(data as StudioPageRow) : null;
}

/* ══════════════════════════════════════════
   WRITES
   ══════════════════════════════════════════ */

/** Create a new page */
export async function createPage(input: CreatePageInput): Promise<StudioPage> {
  const now = new Date().toISOString();

  if (!useSupabase()) {
    const page: StudioPage = {
      id: localId(),
      title: input.title,
      slug: input.slug,
      puck_data: input.puck_data,
      status: input.status ?? 'draft',
      created_at: now,
      updated_at: now,
    };
    const pages = readLocal();
    pages.unshift(page);
    writeLocal(pages);
    return page;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .insert({
      title: input.title,
      slug: input.slug,
      puck_data: input.puck_data,
      status: input.status ?? 'draft',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[Studio] createPage error:', error);
    throw error;
  }

  return rowToPage(data as StudioPageRow);
}

/** Update an existing page */
export async function updatePage(id: string, input: UpdatePageInput): Promise<StudioPage> {
  const now = new Date().toISOString();

  if (!useSupabase()) {
    const pages = readLocal();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`[Studio] updatePage: page ${id} not found in localStorage`);
    }
    const updated: StudioPage = {
      ...pages[idx],
      ...input,
      updated_at: now,
    };
    pages[idx] = updated;
    writeLocal(pages);
    return updated;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .update({
      ...input,
      updated_at: now,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[Studio] updatePage error:', error);
    throw error;
  }

  return rowToPage(data as StudioPageRow);
}

/** Delete a page */
export async function deletePage(id: string): Promise<void> {
  if (!useSupabase()) {
    const pages = readLocal();
    writeLocal(pages.filter((p) => p.id !== id));
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Studio] deletePage error:', error);
    throw error;
  }
}

/** Publish a page (status='published', stamps published_at server-side) */
export async function publishPage(id: string): Promise<StudioPage> {
  if (!useSupabase()) {
    const pages = readLocal();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`[Studio] publishPage: page ${id} not found in localStorage`);
    }
    const updated: StudioPage = {
      ...pages[idx],
      status: 'published',
      updated_at: new Date().toISOString(),
    };
    pages[idx] = updated;
    writeLocal(pages);
    return updated;
  }

  return updatePage(id, { status: 'published' });
}

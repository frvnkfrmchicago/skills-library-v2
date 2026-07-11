/* ═══ CONTENT HUB — bypass + Supabase router ═══
 *
 * Bulletin CRUD for the Content Hub admin surface. Adapted from the
 * Grazzhopper Regulatory Updates pattern — single short post, severity tag,
 * status pipeline. Mirrors the bypass/remote pattern in learnStore.ts so
 * Frank can write and read bulletins in dev with no Supabase deploy.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

export type BulletinSeverity = 'info' | 'advisory' | 'important' | 'breaking';
export type BulletinStatus = 'draft' | 'published' | 'archived';

export interface ContentHubBulletin {
  id: string;
  title: string;
  summary: string;
  body: string | null;
  source_url: string | null;
  severity: BulletinSeverity;
  status: BulletinStatus;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface BulletinUpsertPayload {
  id?: string;
  title: string;
  summary: string;
  body?: string | null;
  source_url?: string | null;
  severity: BulletinSeverity;
  status: BulletinStatus;
  author_id?: string | null;
}

const LS_KEY = 'ap_content_hub_bulletins';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

const nowIso = () => new Date().toISOString();

/* ── Local store helpers ── */

function readLocal(): ContentHubBulletin[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(data: ContentHubBulletin[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write local content hub data', e);
  }
}

/* ── List ── */

export async function listBulletins(): Promise<ContentHubBulletin[]> {
  if (!shouldUseRemote()) {
    return readLocal().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('content_hub_bulletins')
    .select('*')
    .order('updated_at', { ascending: false });
  return (data as ContentHubBulletin[]) ?? [];
}

/* ── Get ── */

export async function getBulletin(id: string): Promise<ContentHubBulletin | null> {
  if (!shouldUseRemote()) {
    return readLocal().find((b) => b.id === id) ?? null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('content_hub_bulletins')
    .select('*')
    .eq('id', id)
    .single();
  return (data as ContentHubBulletin) ?? null;
}

/* ── Upsert ── */

export async function upsertBulletin(row: BulletinUpsertPayload): Promise<ContentHubBulletin> {
  if (!shouldUseRemote()) {
    const list = readLocal();
    const existingIdx = row.id ? list.findIndex((b) => b.id === row.id) : -1;
    let finalRow: ContentHubBulletin;
    if (existingIdx > -1) {
      finalRow = {
        ...list[existingIdx],
        ...row,
        updated_at: nowIso(),
        published_at: row.status === 'published' ? (list[existingIdx].published_at ?? nowIso()) : list[existingIdx].published_at,
      } as ContentHubBulletin;
      list[existingIdx] = finalRow;
    } else {
      const newId = row.id || crypto.randomUUID();
      finalRow = {
        id: newId,
        author_id: row.author_id || null,
        body: row.body || null,
        source_url: row.source_url || null,
        created_at: nowIso(),
        updated_at: nowIso(),
        published_at: row.status === 'published' ? nowIso() : null,
        ...row,
      } as ContentHubBulletin;
      list.push(finalRow);
    }
    writeLocal(list);
    return finalRow;
  }

  // insert / first publish we stamp it here.
  if (row.status === 'published' && !row.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row as any).published_at = nowIso();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('content_hub_bulletins')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data as ContentHubBulletin;
}

/* ── Delete ── */

export async function deleteBulletin(id: string): Promise<void> {
  if (!shouldUseRemote()) {
    writeLocal(readLocal().filter((b) => b.id !== id));
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('content_hub_bulletins')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Publish ── */

export async function publishBulletin(id: string): Promise<ContentHubBulletin | null> {
  if (!shouldUseRemote()) {
    const rows = readLocal();
    const idx = rows.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    rows[idx] = {
      ...rows[idx],
      status: 'published',
      published_at: rows[idx].published_at ?? nowIso(),
      updated_at: nowIso(),
    };
    writeLocal(rows);
    return rows[idx];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('content_hub_bulletins')
    .update({
      status: 'published',
      published_at: nowIso(),
      updated_at: nowIso(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ContentHubBulletin;
}

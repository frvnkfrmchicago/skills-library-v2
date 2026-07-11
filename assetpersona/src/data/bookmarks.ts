/* ═══ BOOKMARKS — owner-scoped saves ═══
 *
 * AP-MODERNIZE-2026-05 · Lane 4
 *
 * Backs the BookmarkButton component and the /community/saved page.
 * Routes through Supabase `bookmarks` when configured + not in dev bypass;
 * otherwise reads/writes localStorage so the dev demo keeps working.
 *
 * Schema lives at supabase/migrations/20260519101200_create_bookmarks.sql
 * RLS is owner-only — every query implicitly filters by auth.uid().
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive, getBypassRole, BYPASS_IDS } from '../lib/devBypass';

export type BookmarkTargetType =
  | 'post'
  | 'comment'
  | 'module'
  | 'bulletin'
  | 'blog_post';

export interface Bookmark {
  id: string;
  owner_id: string;
  target_type: BookmarkTargetType;
  target_id: string;
  note: string | null;
  created_at: string;
}

const LS_KEY = 'ap_bookmarks';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function localOwnerId(): string {
  const role = getBypassRole();
  if (role) return BYPASS_IDS[role];
  return 'local-dev';
}

function readLocal(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bookmark[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: Bookmark[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota errors */
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ───────────────────────────── List ───────────────────────────── */

/**
 * List the current user's bookmarks. Optionally filtered to a single
 * target_type so the Saved page can render in tab-grouped sections.
 */
export async function listBookmarks(opts?: {
  targetType?: BookmarkTargetType;
}): Promise<Bookmark[]> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    let rows = readLocal().filter((b) => b.owner_id === ownerId);
    if (opts?.targetType) rows = rows.filter((b) => b.target_type === opts.targetType);
    return [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });
  if (opts?.targetType) {
    query = query.eq('target_type', opts.targetType);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as Bookmark[]) ?? [];
}

/* ───────────────────────────── Existence check ───────────────────────────── */

/**
 * Returns true if the current user has bookmarked this target.
 * Used by BookmarkButton to pick the outlined vs filled icon on mount.
 */
export async function isBookmarked(
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<boolean> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    return readLocal().some(
      (b) =>
        b.owner_id === ownerId &&
        b.target_type === targetType &&
        b.target_id === targetId,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('bookmarks')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle();
  if (error) {
    // Treat "no row" / RLS-empty as "not bookmarked" rather than throwing
    // because BookmarkButton would otherwise log noise for unauthenticated
    // visitors hitting any page that mounts the button.
    return false;
  }
  return !!data;
}

/* ───────────────────────────── Add ───────────────────────────── */

/**
 * Create a bookmark. The composite UNIQUE on the table makes this safe to
 * call repeatedly — the server will reject duplicate inserts. We swallow
 * unique-violation errors so optimistic toggles don't surface as failures
 * if a user double-clicks.
 */
export async function addBookmark(
  targetType: BookmarkTargetType,
  targetId: string,
  note?: string,
): Promise<Bookmark> {
  if (!shouldUseRemote()) {
    const rows = readLocal();
    const ownerId = localOwnerId();
    const existing = rows.find(
      (b) =>
        b.owner_id === ownerId &&
        b.target_type === targetType &&
        b.target_id === targetId,
    );
    if (existing) return existing;
    const row: Bookmark = {
      id: newId(),
      owner_id: ownerId,
      target_type: targetType,
      target_id: targetId,
      note: note ?? null,
      created_at: new Date().toISOString(),
    };
    rows.unshift(row);
    writeLocal(rows);
    return row;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any).auth.getUser();
  const userId: string | undefined = userData?.user?.id;
  if (!userId) {
    throw new Error('Not authenticated');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('bookmarks')
    .insert({
      owner_id: userId,
      target_type: targetType,
      target_id: targetId,
      note: note ?? null,
    })
    .select('*')
    .single();

  if (error) {
    // 23505 = unique violation: row already there. Treat as success by
    // returning the existing row.
    if ((error as { code?: string }).code === '23505') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from('bookmarks')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();
      if (existing) return existing as Bookmark;
    }
    throw error;
  }

  return data as Bookmark;
}

/* ───────────────────────────── Remove ───────────────────────────── */

/**
 * Delete the bookmark for (current user, target_type, target_id).
 * RLS guarantees the WHERE clause is implicitly owner-scoped server-side.
 */
export async function removeBookmark(
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<void> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    const next = readLocal().filter(
      (b) =>
        !(
          b.owner_id === ownerId &&
          b.target_type === targetType &&
          b.target_id === targetId
        ),
    );
    writeLocal(next);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('bookmarks')
    .delete()
    .eq('target_type', targetType)
    .eq('target_id', targetId);
  if (error) throw error;
}

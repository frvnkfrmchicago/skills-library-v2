/* ═══ PUBLIC PROFILE — 3-state visibility data layer ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 3
 *
 * Backs the Privacy tab in UserSettings + the public `/u/:handle` page +
 * the public `/c/:shareId` credential card.
 *
 * Visibility model (Read.cv documented 3-state):
 *   - 'private'  : nobody but owner sees the row
 *   - 'unlisted' : readable only by people with the direct link
 *   - 'public'   : indexable + listable + readable by anyone
 *
 * RLS enforces this at the database layer. The client filters happen in
 * `getByHandle` so an unlisted row still resolves on direct visit. Listed
 * surfaces (search, members, leaderboards) should query `visibility = 'public'`
 * — that is not this module's job.
 *
 * Bypass-safe: when Supabase is unconfigured / dev bypass is on, every call
 * resolves to deterministic stub responses so the dev demo keeps working.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

export type ProfileVisibility = 'private' | 'unlisted' | 'public';

export interface PublicProfileRow {
  id: string;
  handle: string | null;
  visibility: ProfileVisibility;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  social_links: Record<string, string> | null;
  level: number;
  points: number;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

export interface ProfileCredential {
  id: string;
  profile_id: string;
  module_id: string | null;
  kind: 'badge' | 'certificate';
  label: string;
  share_id: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

export interface PublicProfilePayload {
  profile: PublicProfileRow;
  /** Earned badges + certificates, newest first. Inherits profile visibility. */
  credentials: ProfileCredential[];
  /** Count of public module completions. */
  modulesCompleted: number;
}

export interface CredentialSharePayload {
  credential: ProfileCredential;
  /** Owner row — already passes RLS visibility gate at fetch time. */
  profile: PublicProfileRow;
  /** Optional joined module title (when `module_id` resolves). */
  moduleTitle: string | null;
  moduleSlug: string | null;
}

/* ───────────────────────────── helpers ───────────────────────────── */

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/**
 * Handle shape guard mirroring the DB CHECK constraint:
 *   3-30 chars, lowercase alphanumerics + `_` + `-`, must start with a letter/number.
 * Returns null when valid, an error message string when not.
 */
export function validateHandle(raw: string): string | null {
  const handle = raw.trim().toLowerCase();
  if (handle.length === 0) return 'Pick a handle so people can find you.';
  if (handle.length < 3) return 'Handle is too short (3 minimum).';
  if (handle.length > 30) return 'Handle is too long (30 max).';
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(handle)) {
    return 'Lowercase letters, numbers, _, and - only. Start with a letter or number.';
  }
  return null;
}

/* ───────────────────────────── reads ───────────────────────────── */

/**
 * Fetch a public profile by handle (case-insensitive) plus its credentials and
 * completed-module count. Returns `null` when the row does not exist OR when
 * the visibility gate blocks the viewer. RLS handles the auth side — this
 * function just unwraps the response.
 *
 * `unlisted` profiles resolve on direct visit because the RLS clause is
 *   `visibility <> 'private' OR auth.uid() = id`
 * so any non-private row comes through.
 */
export async function getByHandle(
  handle: string,
): Promise<PublicProfilePayload | null> {
  const cleaned = handle.trim().toLowerCase();
  if (!cleaned) return null;

  if (!shouldUseRemote()) {
    // Bypass stub: pretend a public demo profile exists at handle 'frvnkfrmchicago'.
    if (cleaned !== 'frvnkfrmchicago') return null;
    const profile: PublicProfileRow = {
      id: 'dev-frank',
      handle: 'frvnkfrmchicago',
      visibility: 'public',
      display_name: 'Frank Lawrence, Jr.',
      avatar_url: null,
      cover_url: null,
      bio: 'Founder · Asset Persona · Agentic Study Hall',
      social_links: { website: 'https://www.assetpersona.com' },
      level: 9,
      points: 4200,
      role: 'admin',
      joined_at: new Date('2026-01-01').toISOString(),
    };
    return { profile, credentials: [], modulesCompleted: 0 };
  }

  // 1. Profile row via case-insensitive handle. RLS will return null for private rows
  //    where the viewer is not the owner.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRow, error: profileErr } = await (supabase as any)
    .from('profiles')
    .select(
      'id, handle, visibility, display_name, avatar_url, cover_url, bio, social_links, level, points, role, joined_at',
    )
    .ilike('handle', cleaned)
    .maybeSingle();

  if (profileErr || !profileRow) return null;
  const profile = profileRow as PublicProfileRow;

  // 2. Credentials (RLS gates these on profile visibility).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: credRows } = await (supabase as any)
    .from('profile_credentials')
    .select('*')
    .eq('profile_id', profile.id)
    .order('earned_at', { ascending: false });

  const credentials = (credRows as ProfileCredential[] | null) ?? [];

  // 3. Module completion count. The `module_completions` table allows public
  //    read by design, but we hide the count for private profiles for
  //    consistency with the page UI.
  let modulesCompleted = 0;
  if (profile.visibility !== 'private') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from('module_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id);
    modulesCompleted = count ?? 0;
  }

  return { profile, credentials, modulesCompleted };
}

/**
 * Fetch a single credential by its public share_id. Returns null when
 * RLS blocks the read (i.e. owner flipped their profile back to 'private')
 * or when the slug does not exist.
 */
export async function getCredentialByShareId(
  shareId: string,
): Promise<CredentialSharePayload | null> {
  const cleaned = shareId.trim();
  if (!cleaned) return null;

  if (!shouldUseRemote()) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: credRow, error: credErr } = await (supabase as any)
    .from('profile_credentials')
    .select('*')
    .eq('share_id', cleaned)
    .maybeSingle();
  if (credErr || !credRow) return null;

  const credential = credRow as ProfileCredential;

  // Owner profile — same RLS gate applies, so an unlisted+public profile
  // resolves and a private one returns null.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRow } = await (supabase as any)
    .from('profiles')
    .select(
      'id, handle, visibility, display_name, avatar_url, cover_url, bio, social_links, level, points, role, joined_at',
    )
    .eq('id', credential.profile_id)
    .maybeSingle();

  if (!profileRow) return null;
  const profile = profileRow as PublicProfileRow;

  let moduleTitle: string | null = null;
  let moduleSlug: string | null = null;
  if (credential.module_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: moduleRow } = await (supabase as any)
      .from('modules')
      .select('title, slug')
      .eq('id', credential.module_id)
      .maybeSingle();
    if (moduleRow) {
      moduleTitle = (moduleRow as { title?: string }).title ?? null;
      moduleSlug = (moduleRow as { slug?: string }).slug ?? null;
    }
  }

  return { credential, profile, moduleTitle, moduleSlug };
}

/**
 * Returns `{ available, taken, reason }` for a candidate handle.
 *
 *   - `available = true`  : handle passes shape rules and no other row owns it
 *   - `available = false` : handle is malformed OR already claimed
 *
 * Callers should debounce this against keystrokes (the UserSettings tab uses
 * a 300ms debounce). Lookup is case-insensitive and skips the lookup entirely
 * when the candidate is the current owner's own handle.
 */
export async function checkHandleAvailable(
  handle: string,
  selfId?: string,
): Promise<{ available: boolean; reason: string | null }> {
  const cleaned = handle.trim().toLowerCase();
  const shapeError = validateHandle(cleaned);
  if (shapeError) return { available: false, reason: shapeError };

  if (!shouldUseRemote()) {
    // Bypass stub: treat 'frvnkfrmchicago' as taken so the picker UI behaves
    // realistically.
    if (cleaned === 'frvnkfrmchicago' && selfId !== 'dev-frank') {
      return { available: false, reason: 'That handle is taken.' };
    }
    return { available: true, reason: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id')
    .ilike('handle', cleaned)
    .maybeSingle();

  if (error) {
    // Unreadable rows under RLS still return null+no-error; an actual transport
    // error is unusual here — treat as "can't confirm" rather than "available"
    // to avoid showing a false-positive checkmark.
    return { available: false, reason: 'Could not verify right now.' };
  }
  if (!data) return { available: true, reason: null };
  // The row exists. If it's the caller's own row, that's still available
  // (no-op save).
  if (selfId && (data as { id: string }).id === selfId) {
    return { available: true, reason: null };
  }
  return { available: false, reason: 'That handle is taken.' };
}

/* ───────────────────────────── writes ───────────────────────────── */

/**
 * Save a new handle + visibility for the authenticated user.
 *
 * Returns the updated row on success. Throws on auth gap, RLS rejection, or
 * unique-violation (race condition with another claimer). The Privacy tab
 * surfaces the thrown message inline.
 */
export async function setHandleAndVisibility(
  handle: string,
  visibility: ProfileVisibility,
): Promise<{ handle: string; visibility: ProfileVisibility }> {
  const cleaned = handle.trim().toLowerCase();
  const shapeError = validateHandle(cleaned);
  if (shapeError) throw new Error(shapeError);
  if (!['private', 'unlisted', 'public'].includes(visibility)) {
    throw new Error('Invalid visibility setting.');
  }

  if (!shouldUseRemote()) {
    return { handle: cleaned, visibility };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any).auth.getUser();
  const userId: string | undefined = userData?.user?.id;
  if (!userId) throw new Error('Sign in to save your handle.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update({ handle: cleaned, visibility })
    .eq('id', userId)
    .select('handle, visibility')
    .single();

  if (error) {
    // 23505 = unique violation: someone claimed it between availability
    // check + save. Surface a clear message.
    if ((error as { code?: string }).code === '23505') {
      throw new Error('That handle was just claimed. Try another.');
    }
    throw new Error(error.message || 'Could not save your handle.');
  }
  return data as { handle: string; visibility: ProfileVisibility };
}

/**
 * Read the current user's own handle + visibility — used by the Privacy tab
 * to seed its initial state. Falls back gracefully when unauthenticated.
 */
export async function getOwnHandleAndVisibility(): Promise<{
  handle: string | null;
  visibility: ProfileVisibility;
} | null> {
  if (!shouldUseRemote()) {
    return { handle: null, visibility: 'private' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any).auth.getUser();
  const userId: string | undefined = userData?.user?.id;
  if (!userId) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('profiles')
    .select('handle, visibility')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return { handle: null, visibility: 'private' };
  return data as { handle: string | null; visibility: ProfileVisibility };
}

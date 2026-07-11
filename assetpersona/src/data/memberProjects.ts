/* ═══ MEMBER PROJECTS — Uxcel/Read.cv-style pinned portfolio data layer ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 4
 *
 * Backs:
 *   - `/community/portfolio` owner-edit page (Portfolio.tsx)
 *   - PortfolioGrid component (read-only display, mounted on Profile by Lane 7)
 *   - PortfolioItemEditor component (modal-style add / edit form)
 *
 * Routing rules:
 *   - When Supabase is configured AND dev-bypass is OFF → real DB calls.
 *   - When bypass is active or Supabase isn't configured → localStorage
 *     fallback keyed per-owner so the demo experience round-trips.
 *
 * Schema lives at supabase/migrations/20260520100400_member_projects.sql.
 * RLS is owner-only for ALL ops; pinned rows are public-readable when the
 * owning profile's visibility is non-private (Lane 3's column).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive, getBypassRole, BYPASS_IDS } from '../lib/devBypass';

export interface MemberProject {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  demo_url: string | null;
  tags: string[];
  is_pinned: boolean;
  position: number;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by `upsertProject`. Omitting `id` creates a new row;
 * passing an existing id updates that row in place.
 */
export interface MemberProjectInput {
  id?: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  project_url?: string | null;
  demo_url?: string | null;
  tags?: string[];
  is_pinned?: boolean;
  position?: number;
  clicks_count?: number;
}

const LS_KEY = 'ap_member_projects';
/** Soft cap on pinned items — the public grid only shows the first 8. */
export const PINNED_LIMIT = 8;

/* ───────────────────────────── Routing helpers ───────────────────────────── */

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function localOwnerId(): string {
  const role = getBypassRole();
  if (role) return BYPASS_IDS[role];
  return 'local-dev';
}

function readLocal(): MemberProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MemberProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: MemberProject[]): void {
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

/**
 * Sort by (is_pinned DESC, position ASC, created_at DESC) to match the
 * server-side composite index shape. Used in every local-fallback path.
 */
function sortRows(rows: MemberProject[]): MemberProject[] {
  return [...rows].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    if (a.position !== b.position) return a.position - b.position;
    return b.created_at.localeCompare(a.created_at);
  });
}

/* ───────────────────────────── List my projects ───────────────────────────── */

/**
 * List every project owned by the current user — pinned AND draft. Used by
 * the owner-edit page so members can promote drafts into the pinned set.
 * Returned order matches the server index: pinned first, then position,
 * then created_at DESC.
 */
export async function listMyProjects(): Promise<MemberProject[]> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    const rows = readLocal().filter((p) => p.profile_id === ownerId);
    return sortRows(rows);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any).auth.getUser();
  const userId: string | undefined = userData?.user?.id;
  if (!userId) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('member_projects')
    .select('*')
    .eq('profile_id', userId)
    .order('is_pinned', { ascending: false })
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as MemberProject[]) ?? [];
}

/* ───────────────────────────── List pinned for a profile ───────────────────────────── */

/**
 * List the pinned, publicly-visible projects for a given profile id. Used
 * by PortfolioGrid on both the public `/u/:handle` route (Lane 7 mounts)
 * and the private community Profile page. RLS already filters at the DB
 * level — anonymous viewers only see rows where `is_pinned = true` AND
 * the owning profile's visibility is non-private.
 *
 * Returns up to PINNED_LIMIT rows (matches the public grid's visual cap).
 */
export async function listPinnedFor(profileId: string): Promise<MemberProject[]> {
  if (!shouldUseRemote()) {
    const rows = readLocal()
      .filter((p) => p.profile_id === profileId && p.is_pinned)
      .slice(0, PINNED_LIMIT);
    return sortRows(rows);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('member_projects')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_pinned', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(PINNED_LIMIT);
  if (error) {
    // RLS-empty (visitor viewing a private profile) is a successful "no
    // projects" surface, not an exception.
    return [];
  }
  return (data as MemberProject[]) ?? [];
}

/* ───────────────────────────── Upsert ───────────────────────────── */

/**
 * Create or update a member project. Owner-scoped — RLS rejects writes
 * to any row whose profile_id is not auth.uid().
 *
 * In bypass mode the local store mimics the same shape so the editor
 * UI works end-to-end without a backend.
 */
export async function upsertProject(
  input: MemberProjectInput,
): Promise<MemberProject> {
  const title = input.title.trim();
  if (!title) throw new Error('Project needs a title.');
  if (title.length > 80) throw new Error('Title is too long (max 80).');
  if ((input.description ?? '').length > 400) {
    throw new Error('Description is too long (max 400).');
  }

  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    const rows = readLocal();
    if (input.id) {
      const idx = rows.findIndex(
        (r) => r.id === input.id && r.profile_id === ownerId,
      );
      if (idx === -1) throw new Error('Project not found.');
      const next: MemberProject = {
        ...rows[idx],
        title,
        description: input.description ?? rows[idx].description,
        image_url: input.image_url ?? rows[idx].image_url,
        project_url: input.project_url ?? rows[idx].project_url,
        demo_url: input.demo_url ?? rows[idx].demo_url,
        tags: input.tags ?? rows[idx].tags,
        is_pinned: input.is_pinned ?? rows[idx].is_pinned,
        position: input.position ?? rows[idx].position,
        clicks_count: input.clicks_count ?? rows[idx].clicks_count ?? 0,
        updated_at: new Date().toISOString(),
      };
      rows[idx] = next;
      writeLocal(rows);
      return next;
    }
    const created: MemberProject = {
      id: newId(),
      profile_id: ownerId,
      title,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      project_url: input.project_url ?? null,
      demo_url: input.demo_url ?? null,
      tags: input.tags ?? [],
      is_pinned: input.is_pinned ?? false,
      position: input.position ?? 0,
      clicks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rows.push(created);
    writeLocal(rows);
    return created;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any).auth.getUser();
  const userId: string | undefined = userData?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const payload: Record<string, unknown> = {
    profile_id: userId,
    title,
    description: input.description ?? null,
    image_url: input.image_url ?? null,
    project_url: input.project_url ?? null,
    demo_url: input.demo_url ?? null,
    tags: input.tags ?? [],
    is_pinned: input.is_pinned ?? false,
    position: input.position ?? 0,
    clicks_count: input.clicks_count ?? 0,
  };
  if (input.id) payload.id = input.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('member_projects')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as MemberProject;
}

/* ───────────────────────────── Delete ───────────────────────────── */

/**
 * Remove a project owned by the current user. RLS guarantees we can't
 * delete someone else's row even if a malicious caller forges the id.
 */
export async function deleteProject(id: string): Promise<void> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    const next = readLocal().filter(
      (p) => !(p.id === id && p.profile_id === ownerId),
    );
    writeLocal(next);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('member_projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ───────────────────────────── Reorder ───────────────────────────── */

/**
 * Reassign `position` across an ordered list of project ids in a single
 * pass. The caller passes the desired display order — the first id gets
 * position 0, the next gets 1, etc.
 *
 * Supabase has no native batch-update verb so we fan out per-id; each
 * call is RLS-scoped, so a malicious caller can't reorder rows it
 * doesn't own. On any per-row failure we surface the first error.
 */
export async function reorderProjects(orderedIds: string[]): Promise<void> {
  if (!shouldUseRemote()) {
    const ownerId = localOwnerId();
    const rows = readLocal();
    orderedIds.forEach((id, index) => {
      const idx = rows.findIndex(
        (r) => r.id === id && r.profile_id === ownerId,
      );
      if (idx !== -1) {
        rows[idx] = {
          ...rows[idx],
          position: index,
          updated_at: new Date().toISOString(),
        };
      }
    });
    writeLocal(rows);
    return;
  }

  // Issue all updates concurrently — RLS gates each one server-side.
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('member_projects')
        .update({ position: index })
        .eq('id', id),
    ),
  );
  const firstError = results.find(
    (r: { error?: { message?: string } | null }) => r.error,
  );
  if (firstError?.error) throw firstError.error;
}

export async function incrementProjectClicks(projectId: string): Promise<void> {
  if (!shouldUseRemote()) {
    const rows = readLocal();
    const idx = rows.findIndex((r) => r.id === projectId);
    if (idx !== -1) {
      rows[idx].clicks_count = (rows[idx].clicks_count ?? 0) + 1;
      writeLocal(rows);
    }
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('member_projects')
    .select('clicks_count')
    .eq('id', projectId)
    .single();
  const currentCount = project?.clicks_count ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('member_projects')
    .update({ clicks_count: currentCount + 1 })
    .eq('id', projectId);
  if (error) throw error;
}

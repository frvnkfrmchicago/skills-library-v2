/* ═══ LEARN STORE — unified bypass + Supabase router ═══
 *
 * Every UI in the AP-LEARN-2026-05 packet imports from here. We pick
 * localStorage in bypass mode and Supabase otherwise. The interface is the
 * same either way so callers don't branch on env.
 *
 * ─── SINGLE CANONICAL MODULE SOURCE ───
 * This file is the ONE source of truth for every learnable module on the
 * platform. The Learn hub (Learn.tsx) and the Classroom (Classroom.tsx) must
 * both read the SAME list, and Upgrade.Self's generated courses must be written
 * INTO this store rather than into a parallel localStorage bucket.
 *
 * Before this change the platform had two competing hubs: Upgrade.Self wrote a
 * thin copy of each course to the 'ap_sandbox_modules' localStorage key, the
 * Classroom read that key, and the Learn hub read the real store here. Those
 * two lists drifted apart.
 *
 * The fix lives in three additive helpers below:
 *   - publishGeneratedCourse() — the ONE place a generated course is written.
 *   - listSandboxModules()     — a one-time bridge that surfaces any legacy
 *                                'ap_sandbox_modules' entries, normalized to the
 *                                LearnModule shape.
 *   - listLearnableModules()   — the single getter the Classroom and the Learn
 *                                hub both call to get the identical module list.
 *
 * Consumers (Classroom.tsx, UpgradeSelf.tsx, Learn.tsx) are migrated onto these
 * helpers by other lanes; this file only provides the additive contract.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import { earnPoints } from './leaguesStore';
import { generatedCourseToModule, type GeneratedCourse, type GeneratedCourseToModuleOptions } from '../lib/upgrade-self/courseBuilder';
import {
  listLocalModules,
  getLocalModuleBySlug,
  upsertLocalModule,
  deleteLocalModule,
  pinTodayDrill,
  getTodayDrill,
  listLocalCompletions,
  isCompleted as isCompletedLocal,
  recordLocalCompletion,
  recordLocalStep,
  getLocalStreak,
  listLocalAchievements,
  awardLocalAchievement,
  listLocalDrafts,
  appendLocalDraft,
  updateLocalDraft,
  seedLocalLearnIfNeeded,
} from '../lib/learnLocal';
import type {
  LearnModule,
  ModuleCompletion,
  UserStreak,
  Achievement,
  AchievementBadge,
  ModuleDraftQueueRow,
  ModuleStatus,
  ModuleResource,
} from '../types/learn';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}


/* ── Modules ── */

export async function listPublishedModules(): Promise<LearnModule[]> {
  seedLocalLearnIfNeeded();
  if (!shouldUseRemote()) {
    return listLocalModules().filter((m) => m.status === 'published');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200);
  return (data as LearnModule[]) ?? [];
}

export async function listAllModulesForAdmin(): Promise<LearnModule[]> {
  seedLocalLearnIfNeeded();
  if (!shouldUseRemote()) return listLocalModules();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .order('updated_at', { ascending: false })
    .limit(500);
  return (data as LearnModule[]) ?? [];
}

/**
 * Lane 1 — modules whose admin has scheduled them to auto-publish later.
 * Used by the admin queue view + by n8n's hourly auto-publish worker as the
 * client-side preview. The n8n worker calls Supabase REST directly.
 *
 * Bypass mode returns [] so the local store stays a pure draft/published view.
 */
export async function listScheduledModules(): Promise<LearnModule[]> {
  if (!shouldUseRemote()) return [];
  const nowIso = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .eq('status', 'queued')
    .gt('scheduled_publish_at', nowIso)
    .order('scheduled_publish_at', { ascending: true })
    .limit(200);
  return (data as LearnModule[]) ?? [];
}

/**
 * Lane 1 — count of users who finished this module. Powers the social-proof
 * line ("· 142 completed") on every Learn hub card. Bypass mode returns a
 * deterministic synthetic count derived from the slug so the UI looks alive
 * in dev.
 */
export async function getCompletionCount(moduleId: string): Promise<number> {
  if (!shouldUseRemote()) {
    // Deterministic stub: hash → 23–847. Same id always → same number.
    let h = 0;
    for (let i = 0; i < moduleId.length; i++) {
      h = (h * 31 + moduleId.charCodeAt(i)) | 0;
    }
    return 23 + (Math.abs(h) % 825);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('module_completions')
    .select('id', { count: 'exact', head: true })
    .eq('module_id', moduleId);
  return count ?? 0;
}

export async function getModuleBySlug(slug: string): Promise<LearnModule | null> {
  seedLocalLearnIfNeeded();
  if (!shouldUseRemote()) {
    return getLocalModuleBySlug(slug) ?? null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .eq('slug', slug)
    .single();
  return (data as LearnModule) ?? null;
}

export async function getTodaysModule(): Promise<LearnModule | null> {
  seedLocalLearnIfNeeded();
  if (!shouldUseRemote()) return getTodayDrill() ?? null;

  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pinned } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .eq('status', 'published')
    .eq('pinned_as_today_drill_at', today)
    .limit(1)
    .maybeSingle();
  if (pinned) return pinned as LearnModule;

  // Fallback: most recent published
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recent } = await (supabase as any)
    .from('modules')
    .select('*, resources:module_resources(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (recent as LearnModule) ?? null;
}

export async function upsertModule(m: LearnModule, resources?: ModuleResource[]): Promise<LearnModule> {
  if (!shouldUseRemote()) {
    return upsertLocalModule({ ...m, resources: resources ?? m.resources });
  }
  const { resources: _r, ...rest } = m;
  void _r;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('modules')
    .upsert(rest, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw error;
  // Replace resources
  if (resources) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('module_resources').delete().eq('module_id', data.id);
    if (resources.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('module_resources').insert(
        resources.map((r, i) => ({
          module_id: data.id,
          kind: r.kind,
          label: r.label,
          url: r.url,
          description: r.description ?? null,
          position: r.position ?? i,
        }))
      );
    }
  }
  return { ...(data as LearnModule), resources: resources ?? [] };
}

export async function deleteModule(id: string): Promise<void> {
  if (!shouldUseRemote()) return deleteLocalModule(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('modules').delete().eq('id', id);
}

export async function setStatus(id: string, status: ModuleStatus): Promise<void> {
  if (!shouldUseRemote()) {
    const all = listLocalModules();
    const m = all.find((x) => x.id === id);
    if (m) upsertLocalModule({ ...m, status });
    return;
  }
  const patch: { status: ModuleStatus; published_at?: string | null } = { status };
  if (status === 'published') patch.published_at = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('modules').update(patch).eq('id', id);
}

export async function pinTodayDrillById(id: string | null): Promise<void> {
  if (!shouldUseRemote()) return pinTodayDrill(id);
  // Clear current day's pin then set this one (if not null)
  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('modules')
    .update({ pinned_as_today_drill_at: null })
    .eq('pinned_as_today_drill_at', today);
  if (id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('modules')
      .update({ pinned_as_today_drill_at: today })
      .eq('id', id);
  }
}

/* ── Unification bridge: generated courses + legacy sandbox modules ── */

/** localStorage key the old Upgrade.Self publish path wrote thin course copies to. */
const LEGACY_SANDBOX_KEY = 'ap_sandbox_modules';

/**
 * The thin record shape the legacy 'ap_sandbox_modules' bucket stored. The old
 * Classroom read exactly these fields. We accept all of them as optional so a
 * partially written entry still normalizes cleanly.
 */
interface LegacySandboxEntry {
  slug: string;
  title: string;
  tags?: string[];
  hook?: string;
  estimated_minutes?: number;
  is_premium?: boolean;
  price_cents?: number;
}

/**
 * Publish a generated Upgrade.Self course into the ONE canonical store.
 *
 * This is the single write path for generated courses. It maps the course to a
 * LearnModule with generatedCourseToModule(), then upserts it through the same
 * upsertModule() every other module uses, so the course lands in Supabase (live)
 * or the local store (bypass) exactly like an admin-authored module. The Learn
 * hub and the Classroom both then read it through listLearnableModules().
 *
 * Callers should stop writing to 'ap_sandbox_modules' once they call this; that
 * key is now read-only legacy data surfaced by listSandboxModules().
 */
export async function publishGeneratedCourse(
  course: GeneratedCourse,
  options?: GeneratedCourseToModuleOptions,
): Promise<LearnModule> {
  const module = generatedCourseToModule(course, options);
  return upsertModule(module, module.resources);
}

/**
 * One-time bridge: read any legacy 'ap_sandbox_modules' entries and normalize
 * them to the LearnModule shape so old generated courses still appear after the
 * platform moves to the canonical store.
 *
 * These entries are thin (no real lesson body), so we fill the LearnModule
 * fields the readers need and leave the rest at honest empty defaults. Each
 * normalized module is marked generated_by_ai and tagged 'legacy-sandbox' for
 * provenance. The list is read-only — nothing here writes back to localStorage.
 */
export function listSandboxModules(): LearnModule[] {
  if (typeof window === 'undefined') return [];
  let entries: LegacySandboxEntry[];
  try {
    const raw = localStorage.getItem(LEGACY_SANDBOX_KEY);
    entries = raw ? (JSON.parse(raw) as LegacySandboxEntry[]) : [];
  } catch {
    return [];
  }
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((e): e is LegacySandboxEntry => Boolean(e && e.slug && e.title))
    .map((e) => {
      const tags = Array.isArray(e.tags) ? e.tags.slice(0, 4) : [];
      const module: LearnModule = {
        id: e.slug,
        slug: e.slug,
        type: 'concept',
        status: 'published',
        hook: e.hook || 'A course you built with Upgrade.Self.',
        title: e.title,
        objective: 'Learn the core concepts of this course.',
        context_md: e.hook || '',
        practice_md: null,
        practice_starter: null,
        reflect_question: null,
        quiz_questions: [],
        match_pairs: [],
        required_role: 'curious',
        tags: tags.length ? [...tags, 'legacy-sandbox'] : ['legacy-sandbox'],
        cover_image: null,
        estimated_minutes: e.estimated_minutes ?? 5,
        xp_reward: 50,
        pathway_id: null,
        pathway_order: null,
        source_url: null,
        source_published_at: null,
        generated_by_ai: true,
        author_id: 'upgrade-self-author',
        pinned_as_today_drill_at: null,
        published_at: null,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
        resources: [],
      };
      return module;
    });
}

/**
 * THE single getter the Classroom and the Learn hub both call.
 *
 * Returns every published module the platform knows about: the canonical store
 * (Supabase live, or the local store in bypass) merged with any legacy
 * 'ap_sandbox_modules' entries, de-duplicated by slug. The canonical record
 * always wins a slug collision, so once a legacy course has been re-published
 * through publishGeneratedCourse() its real version replaces the thin bridge
 * copy. This is what makes the two hubs show the exact same modules.
 */
export async function listLearnableModules(): Promise<LearnModule[]> {
  const canonical = await listPublishedModules();
  const legacy = listSandboxModules();

  const bySlug = new Map<string, LearnModule>();
  // Seed legacy first, then let canonical overwrite on slug collision so the
  // real record wins.
  for (const m of legacy) bySlug.set(m.slug, m);
  for (const m of canonical) bySlug.set(m.slug, m);

  return [...bySlug.values()];
}

/* ── Progress + completions + streaks ── */

export async function recordStep(
  userId: string,
  moduleId: string,
  step: 'hook' | 'context' | 'practice' | 'reflect' | 'complete',
  payload?: Record<string, unknown>
): Promise<void> {
  if (!shouldUseRemote()) return recordLocalStep(userId, moduleId, step, payload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('user_module_progress')
    .upsert(
      { user_id: userId, module_id: moduleId, step, payload: payload ?? {} },
      { onConflict: 'user_id,module_id,step' }
    );
}

export async function isModuleCompleted(userId: string, moduleId: string): Promise<boolean> {
  if (!shouldUseRemote()) return isCompletedLocal(userId, moduleId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('module_completions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('module_id', moduleId);
  return (count ?? 0) > 0;
}

export async function completeModule(
  userId: string,
  moduleId: string,
  xp: number,
  reflectText?: string
): Promise<ModuleCompletion> {
  if (!shouldUseRemote()) {
    const res = recordLocalCompletion(userId, moduleId, xp, reflectText);
    void earnPoints(userId, xp);
    return res;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('module_completions')
    .upsert(
      {
        user_id: userId,
        module_id: moduleId,
        xp_earned: xp,
        reflect_text: reflectText ?? null,
      },
      { onConflict: 'user_id,module_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as ModuleCompletion;
}


export async function listMyCompletions(userId: string): Promise<ModuleCompletion[]> {
  if (!shouldUseRemote()) return listLocalCompletions(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('module_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(200);
  return (data as ModuleCompletion[]) ?? [];
}

export async function getStreak(userId: string): Promise<UserStreak> {
  if (!shouldUseRemote()) return getLocalStreak(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (
    (data as UserStreak) ?? {
      user_id: userId,
      current_count: 0,
      longest_count: 0,
      last_completed_on: null,
      freeze_days_used: 0,
      freeze_days_available: 1,
      updated_at: new Date().toISOString(),
    }
  );
}

/* ── Achievements ── */

export async function listMyAchievements(userId: string): Promise<Achievement[]> {
  if (!shouldUseRemote()) return listLocalAchievements(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  return (data as Achievement[]) ?? [];
}

export async function awardAchievement(
  userId: string,
  badge: AchievementBadge,
  payload?: Record<string, unknown>
): Promise<void> {
  if (!shouldUseRemote()) {
    awardLocalAchievement(userId, badge, payload);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('achievements')
    .insert({ user_id: userId, badge, payload: payload ?? {} })
    // duplicates rejected by unique constraint — swallow
    .single()
    .catch(() => null);
}

/* ── Drafts queue (Wave 5) ── */

export async function listDrafts(): Promise<ModuleDraftQueueRow[]> {
  if (!shouldUseRemote()) return listLocalDrafts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('module_drafts_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  return (data as ModuleDraftQueueRow[]) ?? [];
}

export async function setDraftStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  reason?: string,
  publishedModuleId?: string
): Promise<void> {
  if (!shouldUseRemote()) {
    updateLocalDraft(id, {
      status,
      reject_reason: reason ?? null,
      published_module_id: publishedModuleId ?? null,
      reviewed_at: new Date().toISOString(),
    });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('module_drafts_queue')
    .update({
      status,
      reject_reason: reason ?? null,
      published_module_id: publishedModuleId ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function appendDraft(d: ModuleDraftQueueRow): Promise<void> {
  if (!shouldUseRemote()) return appendLocalDraft(d);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('module_drafts_queue')
    .upsert(d, { onConflict: 'source_hash' });
}

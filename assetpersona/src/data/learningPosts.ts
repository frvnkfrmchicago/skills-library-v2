/* ═══ LEARNING POSTS — share-card data layer ═══
 *
 * Lane 2 of AP-ENGAGEMENT-LOOP-2026-05. Backs:
 *   - SharePrompt mint flow on the Module completion screen
 *   - /learned/:shareId public page
 *   - og-image Edge Function (server-side reads the share_card_view)
 *
 * Bypass mode keeps a localStorage mirror so dev can click through the full
 * mint → public-card → signup loop without Supabase. Remote mode writes the
 * learning_posts row + creates a parallel community feed post via addPost.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import { addPost } from './communityData';
import type { Post } from '../types/supabase';
import type { LearnModule } from '../types/learn';

/* ── Types ── */

export interface LearningPost {
  id: string;
  share_id: string;
  profile_id: string;
  module_id: string;
  takeaway: string;
  feed_post_id: string | null;
  created_at: string;
}

/** What the public share-card page + OG renderer need in one shot. */
export interface ShareCardRow {
  learning_post_id: string;
  share_id: string;
  takeaway: string;
  shared_at: string;
  feed_post_id: string | null;
  profile_id: string;
  display_name: string;
  avatar_url: string | null;
  module_id: string;
  module_slug: string;
  module_title: string;
  module_hook: string;
  module_type: LearnModule['type'];
  module_cover_image: string | null;
  module_published_at: string | null;
}

export interface CreateLearningPostInput {
  moduleId: string;
  takeaway: string;
  /** When known, used to build the feed-post body + the share URL. */
  module?: Pick<LearnModule, 'title' | 'slug'>;
  /** Author identity — only needed in bypass mode. Remote mode reads auth.uid(). */
  authorId?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string | null;
}

export interface CreateLearningPostResult {
  shareId: string;
  learningPostId: string;
  feedPostId: string | null;
}

/* ── Helpers ── */

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

const LS_KEY = 'ap_learning_posts';

function readLocal(): LearningPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LearningPost[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: LearningPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(0, 500)));
  } catch {
    /* quota — drop silently */
  }
}

/**
 * Generate a short URL-safe share id mirroring the SQL gen_share_id helper.
 * Alphabet drops easily-confused glyphs (0, O, 1, I, l). 8 chars = ~1.1T
 * combinations, which is plenty for v1 bypass mode.
 */
function genShareId(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function buildFeedPost(
  authorId: string,
  takeaway: string,
  module: Pick<LearnModule, 'title' | 'slug'> | undefined,
  shareId: string,
): Post {
  const moduleTitle = module?.title ?? 'today';
  const moduleSlug = module?.slug ?? '';
  // Short, human body — links the public share card so the feed post and the
  // off-platform share land in the same place.
  const body = [
    `Today I learned: ${takeaway}`,
    '',
    moduleSlug ? `Module — ${moduleTitle}` : '',
    `/learned/${shareId}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: crypto.randomUUID(),
    author_id: authorId,
    body,
    media_urls: [],
    category: 'wins',
    pinned: false,
    reaction_counts: { like: 0, fire: 0, heart: 0 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comment_count: 0,
  };
}

/* ── Public API ── */

/**
 * Mint a learning_posts row, post a parallel community feed entry, and
 * return the share id the celebration screen redirects to.
 */
export async function createLearningPost(
  input: CreateLearningPostInput,
): Promise<CreateLearningPostResult> {
  const trimmedTakeaway = input.takeaway.trim();
  if (!trimmedTakeaway) {
    throw new Error('Takeaway is required.');
  }
  if (trimmedTakeaway.length > 280) {
    throw new Error('Takeaway must be 280 characters or fewer.');
  }

  if (!shouldUseRemote()) {
    const shareId = genShareId();
    const authorId = input.authorId ?? 'bypass-member';
    const feedPost = buildFeedPost(authorId, trimmedTakeaway, input.module, shareId);
    addPost(feedPost);

    const row: LearningPost = {
      id: crypto.randomUUID(),
      share_id: shareId,
      profile_id: authorId,
      module_id: input.moduleId,
      takeaway: trimmedTakeaway,
      feed_post_id: feedPost.id,
      created_at: new Date().toISOString(),
    };
    writeLocal([row, ...readLocal()]);
    return {
      shareId,
      learningPostId: row.id,
      feedPostId: feedPost.id,
    };
  }

  // Remote: post to the feed first so we have the feed_post_id to thread
  // back onto the learning_post. addPost is optimistic + idempotent, so
  // even if the parallel insert below fails the feed entry remains.
  const { data: userData } = await supabase.auth.getUser();
  const authorId = userData?.user?.id;
  if (!authorId) {
    throw new Error('You must be signed in to share what you learned.');
  }

  const shareId = genShareId();
  const feedPost = buildFeedPost(authorId, trimmedTakeaway, input.module, shareId);
  addPost(feedPost);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('learning_posts')
    .insert({
      share_id: shareId,
      profile_id: authorId,
      module_id: input.moduleId,
      takeaway: trimmedTakeaway,
      feed_post_id: feedPost.id,
    })
    .select('id, share_id, feed_post_id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not save share. Try again.');
  }

  return {
    shareId: (data.share_id as string) ?? shareId,
    learningPostId: data.id as string,
    feedPostId: (data.feed_post_id as string | null) ?? feedPost.id,
  };
}

/**
 * Load the joined share-card row for the /learned/:shareId public page.
 * Returns null when the share id isn't recognized (404 path on the page).
 */
export async function getByShareId(shareId: string): Promise<ShareCardRow | null> {
  if (!shareId) return null;

  if (!shouldUseRemote()) {
    const local = readLocal().find((r) => r.share_id === shareId);
    if (!local) return null;
    // Bypass mode synthesizes the joined fields locally so the page renders.
    return {
      learning_post_id: local.id,
      share_id: local.share_id,
      takeaway: local.takeaway,
      shared_at: local.created_at,
      feed_post_id: local.feed_post_id,
      profile_id: local.profile_id,
      display_name: 'Dev Member',
      avatar_url: null,
      module_id: local.module_id,
      module_slug: 'preview-module',
      module_title: 'Preview module',
      module_hook: 'Bypass preview of the share card.',
      module_type: 'concept',
      module_cover_image: null,
      module_published_at: local.created_at,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('share_card_view')
    .select('*')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ShareCardRow;
}

/**
 * List the current viewer's own learning posts (profile feed + future
 * "shared collection" surfaces). Bypass mode reads the localStorage mirror.
 */
export async function listMyLearningPosts(): Promise<LearningPost[]> {
  if (!shouldUseRemote()) {
    return readLocal();
  }
  const { data: userData } = await supabase.auth.getUser();
  const authorId = userData?.user?.id;
  if (!authorId) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('learning_posts')
    .select('*')
    .eq('profile_id', authorId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data as LearningPost[];
}

/**
 * Look up a module slug+id by the public teaser RPC. Used by /learn/:slug
 * so anonymous traffic can preview a module without consuming the body.
 */
export interface ModuleTeaserRow {
  id: string;
  slug: string;
  title: string;
  hook: string;
  objective: string;
  cover_image: string | null;
  estimated_minutes: number;
  xp_reward: number;
  tags: string[];
  required_role: LearnModule['required_role'];
  type: LearnModule['type'];
  published_at: string | null;
}

export async function getModuleTeaser(slug: string): Promise<ModuleTeaserRow | null> {
  if (!slug) return null;

  if (!shouldUseRemote()) {
    // Bypass mode borrows the existing learnStore for full module data and
    // narrows it to teaser fields so the public page renders.
    const { getModuleBySlug } = await import('./learnStore');
    const m = await getModuleBySlug(slug);
    if (!m) return null;
    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      hook: m.hook,
      objective: m.objective,
      cover_image: m.cover_image,
      estimated_minutes: m.estimated_minutes,
      xp_reward: m.xp_reward,
      tags: m.tags,
      required_role: m.required_role,
      type: m.type,
      published_at: m.published_at,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .rpc('get_module_teaser', { p_slug: slug })
    .maybeSingle();
  if (error || !data) return null;
  return data as ModuleTeaserRow;
}

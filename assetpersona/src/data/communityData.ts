import type { Post, Comment, Course, Lesson, CalendarEvent, Level, Profile } from '../types/supabase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

/* ═══ LEVELS (config — not fake data) ═══ */
export const LEVELS: Level[] = [
  { level: 1, name: 'New Member', points_required: 0, unlock_rule: null },
  { level: 2, name: 'Active', points_required: 50, unlock_rule: null },
  { level: 3, name: 'Contributor', points_required: 150, unlock_rule: null },
  { level: 4, name: 'Pro', points_required: 500, unlock_rule: 'Complete 1 course' },
  { level: 5, name: 'Expert', points_required: 1000, unlock_rule: 'Complete 3 courses' },
  { level: 6, name: 'Leader', points_required: 2500, unlock_rule: null },
  { level: 7, name: 'Legend', points_required: 5000, unlock_rule: null },
];

/* ═══ POST CATEGORIES (Skool has categorized posts) ═══ */
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'wins', label: 'Wins' },
  { id: 'questions', label: 'Questions' },
  { id: 'resources', label: 'Resources' },
  { id: 'introductions', label: 'Introductions' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

/* ═══ POINT VALUES (Skool gamification) ═══ */
const POINTS = {
  post: 5,
  comment: 2,
  reaction_received: 1,
} as const;

/* ═══ HELPERS ═══ */
export function getLevelName(lvl: number): string {
  return LEVELS.find((l) => l.level === lvl)?.name ?? `Level ${lvl}`;
}

export function getNextLevel(currentLevel: number): Level | undefined {
  return LEVELS.find((l) => l.level === currentLevel + 1);
}

export function getLevelForPoints(points: number): number {
  let level = 1;
  for (const l of LEVELS) {
    if (points >= l.points_required) level = l.level;
  }
  return level;
}

/* ═══════════════════════════════════════════════
   IN-MEMORY CACHE (paired with Supabase persistence)

   Feed.tsx initializes its state synchronously via getPosts() etc, so we keep
   a synchronous read surface backed by a cache. The cache is hydrated on
   first call (via fetchPostsRemote / fetchCommentsRemote / fetchLikesRemote)
   and updated by Realtime listeners. Members + courses + events stay on
   localStorage for v1 since they're admin-curated, not visitor-generated.

   For unconfigured / bypass environments we still hit localStorage so the
   demo experience continues to work.
   ═══════════════════════════════════════════════ */

const STORAGE_KEYS = {
  posts: 'ap_community_posts',
  comments: 'ap_community_comments',
  reactions: 'ap_community_reactions',
  courses: 'ap_community_courses',
  lessons: 'ap_community_lessons',
  events: 'ap_community_events',
  members: 'ap_community_members',
} as const;

function isRemote(): boolean {
  // When Supabase is configured AND we're not in dev bypass, we read/write live.
  return isSupabaseConfigured && !isBypassActive();
}

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota / disabled storage — ignore */
  }
}

/* ═══ CACHES — synchronous reads pull from these ═══ */
let postsCache: Post[] | null = null;
let commentsCache: Comment[] | null = null;
let reactionsCache: Record<string, string[]> | null = null;

function ensurePostsCache(): Post[] {
  if (postsCache) return postsCache;
  postsCache = load<Post>(STORAGE_KEYS.posts, []);
  return postsCache;
}

function ensureCommentsCache(): Comment[] {
  if (commentsCache) return commentsCache;
  commentsCache = load<Comment>(STORAGE_KEYS.comments, []);
  return commentsCache;
}

function ensureReactionsCache(): Record<string, string[]> {
  if (reactionsCache) return reactionsCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reactions);
    reactionsCache = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    reactionsCache = {};
  }
  return reactionsCache;
}

/* ─── Mapper: a Supabase row + side-channels → Post shape the UI expects ─── */
interface RemotePostRow {
  id: string;
  author_id: string;
  body: string;
  media_urls: string[] | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

interface RemoteLikeRow {
  post_id: string;
  author_id: string;
  kind: string;
}

interface RemoteCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
}

function mapRemotePost(row: RemotePostRow, likes: RemoteLikeRow[], commentCount: number): Post {
  const reaction_counts = { like: 0, fire: 0, heart: 0 } as Post['reaction_counts'];
  for (const l of likes) {
    if (l.post_id !== row.id) continue;
    if (l.kind === 'like') reaction_counts.like += 1;
    else if (l.kind === 'fire') reaction_counts.fire += 1;
    else if (l.kind === 'heart') reaction_counts.heart += 1;
  }
  return {
    id: row.id,
    author_id: row.author_id,
    body: row.body,
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    category: row.category ?? 'general',
    pinned: false,
    reaction_counts,
    created_at: row.created_at,
    updated_at: row.updated_at,
    comment_count: commentCount,
  };
}

function mapRemoteComment(row: RemoteCommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    parent_id: row.parent_id,
    body: row.body,
    created_at: row.created_at,
  };
}

/* ═══ POSTS (sync read + async loader) ═══ */
export function getPosts(): Post[] {
  return ensurePostsCache();
}

/** Hydrate the posts cache from Supabase. Safe to call repeatedly. */
export async function fetchPostsRemote(): Promise<Post[]> {
  if (!isRemote()) {
    postsCache = load<Post>(STORAGE_KEYS.posts, []);
    return postsCache;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: postRows, error } = await (supabase as any)
    .from('posts')
    .select('id, author_id, body, media_urls, category, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !postRows) {
    postsCache = postsCache ?? [];
    return postsCache;
  }
  // Fetch likes + comment counts in parallel.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('post_likes').select('post_id, author_id, kind'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('post_comments').select('id, post_id, author_id, parent_id, body, created_at'),
  ]);
  const likes: RemoteLikeRow[] = likeRows ?? [];
  const allComments: RemoteCommentRow[] = commentRows ?? [];
  const countByPost = new Map<string, number>();
  for (const c of allComments) {
    countByPost.set(c.post_id, (countByPost.get(c.post_id) ?? 0) + 1);
  }
  postsCache = (postRows as RemotePostRow[]).map((row) =>
    mapRemotePost(row, likes, countByPost.get(row.id) ?? 0),
  );
  commentsCache = allComments.map(mapRemoteComment);
  return postsCache;
}

export function addPost(post: Post): Post[] {
  const posts = ensurePostsCache();
  // Optimistic local insert first — Feed mounts realtime listener for dupes.
  const next = [post, ...posts.filter((p) => p.id !== post.id)];
  postsCache = next;

  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('posts').insert({
        id: post.id,
        author_id: post.author_id,
        body: post.body,
        media_urls: post.media_urls ?? [],
        category: post.category,
      });
      if (error) {
        // Roll the optimistic insert back so the user sees the failure.
        postsCache = (postsCache ?? []).filter((p) => p.id !== post.id);
      }
    })();
  } else {
    save(STORAGE_KEYS.posts, next);
    awardPoints(post.author_id, POINTS.post);
  }
  return next;
}

export function updatePost(postId: string, update: Partial<Post>): Post[] {
  const next = ensurePostsCache().map((p) =>
    p.id === postId ? { ...p, ...update, updated_at: new Date().toISOString() } : p,
  );
  postsCache = next;

  if (isRemote()) {
    void (async () => {
      const patch: Record<string, unknown> = {};
      if (typeof update.body === 'string') patch.body = update.body;
      if (update.media_urls) patch.media_urls = update.media_urls;
      if (update.category) patch.category = update.category;
      if (Object.keys(patch).length === 0) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('posts').update(patch).eq('id', postId);
    })();
  } else {
    save(STORAGE_KEYS.posts, next);
  }
  return next;
}

export function deletePost(postId: string): Post[] {
  const next = ensurePostsCache().filter((p) => p.id !== postId);
  postsCache = next;
  // Always drop associated comments from the cache so the UI is consistent.
  const nextComments = ensureCommentsCache().filter((c) => c.post_id !== postId);
  commentsCache = nextComments;

  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('posts').delete().eq('id', postId);
    })();
  } else {
    save(STORAGE_KEYS.posts, next);
    save(STORAGE_KEYS.comments, nextComments);
  }
  return next;
}

export function pinPost(postId: string, pinned: boolean): Post[] {
  // The `posts` schema in this wave doesn't include a `pinned` column.
  // Treat as a client-only UI hint. Future wave can add the column + policy.
  return updatePost(postId, { pinned } as Partial<Post>);
}

/* ═══ COMMENTS (sync read + async loader) ═══ */
export function getComments(): Comment[] {
  return ensureCommentsCache();
}

export async function fetchCommentsRemote(): Promise<Comment[]> {
  if (!isRemote()) {
    commentsCache = load<Comment>(STORAGE_KEYS.comments, []);
    return commentsCache;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('post_comments')
    .select('id, post_id, author_id, parent_id, body, created_at')
    .order('created_at', { ascending: true });
  if (error || !data) {
    commentsCache = commentsCache ?? [];
    return commentsCache;
  }
  commentsCache = (data as RemoteCommentRow[]).map(mapRemoteComment);
  return commentsCache;
}

export function addComment(comment: Comment): Comment[] {
  const next = [...ensureCommentsCache(), comment];
  commentsCache = next;

  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('post_comments').insert({
        id: comment.id,
        post_id: comment.post_id,
        author_id: comment.author_id,
        parent_id: comment.parent_id,
        body: comment.body,
      });
      if (error) {
        commentsCache = (commentsCache ?? []).filter((c) => c.id !== comment.id);
      }
    })();
  } else {
    save(STORAGE_KEYS.comments, next);
    awardPoints(comment.author_id, POINTS.comment);
  }
  return next;
}

export function deleteComment(commentId: string): Comment[] {
  const next = ensureCommentsCache().filter((c) => c.id !== commentId && c.parent_id !== commentId);
  commentsCache = next;

  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('post_comments').delete().eq('id', commentId);
    })();
  } else {
    save(STORAGE_KEYS.comments, next);
  }
  return next;
}

/* ═══ REACTIONS (per-user) ═══ */
type ReactionMap = Record<string, string[]>; // postId -> ['like','fire']

export function getReactions(): ReactionMap {
  return ensureReactionsCache();
}

/** Hydrate per-user reactions from Supabase. */
export async function fetchUserReactionsRemote(userId: string): Promise<ReactionMap> {
  if (!isRemote() || !userId) {
    return ensureReactionsCache();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('post_likes')
    .select('post_id, kind')
    .eq('author_id', userId);
  if (error || !data) return ensureReactionsCache();
  const map: ReactionMap = {};
  for (const row of data as Array<{ post_id: string; kind: string }>) {
    map[row.post_id] = [...(map[row.post_id] ?? []), row.kind];
  }
  reactionsCache = map;
  return map;
}

export function toggleReaction(postId: string, type: string, userId?: string): ReactionMap {
  const reactions = ensureReactionsCache();
  const current = reactions[postId] ?? [];
  const willAdd = !current.includes(type);
  if (willAdd) {
    reactions[postId] = [...current, type];
  } else {
    reactions[postId] = current.filter((r) => r !== type);
  }
  reactionsCache = reactions;

  if (isRemote() && userId) {
    void (async () => {
      if (willAdd) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('post_likes')
          .insert({ post_id: postId, author_id: userId, kind: type });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('post_likes')
          .delete()
          .match({ post_id: postId, author_id: userId, kind: type });
      }
    })();
  } else {
    try {
      localStorage.setItem(STORAGE_KEYS.reactions, JSON.stringify(reactions));
    } catch {
      /* ignore */
    }
  }
  return reactions;
}

/* ═══ REALTIME INTEGRATION HELPERS ═══
 *
 * Feed.tsx is the only caller of these. Each helper mutates the cache so the
 * next synchronous getPosts() / getComments() reflects the Realtime delta.
 */

export function applyRemotePostInsert(row: RemotePostRow): Post {
  const post = mapRemotePost(row, [], 0);
  const current = ensurePostsCache();
  if (!current.some((p) => p.id === post.id)) {
    postsCache = [post, ...current];
  }
  return post;
}

export function applyRemotePostDelete(postId: string): void {
  postsCache = ensurePostsCache().filter((p) => p.id !== postId);
  commentsCache = ensureCommentsCache().filter((c) => c.post_id !== postId);
}

export function applyRemotePostUpdate(row: RemotePostRow): void {
  const existing = ensurePostsCache();
  const idx = existing.findIndex((p) => p.id === row.id);
  if (idx < 0) return;
  const merged: Post = {
    ...existing[idx],
    body: row.body,
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : existing[idx].media_urls,
    category: row.category ?? existing[idx].category,
    updated_at: row.updated_at,
  };
  postsCache = [...existing.slice(0, idx), merged, ...existing.slice(idx + 1)];
}

export function applyRemoteCommentInsert(row: RemoteCommentRow): Comment {
  const comment = mapRemoteComment(row);
  const current = ensureCommentsCache();
  if (!current.some((c) => c.id === comment.id)) {
    commentsCache = [...current, comment];
  }
  // bump comment_count on the matching post
  const posts = ensurePostsCache();
  const idx = posts.findIndex((p) => p.id === row.post_id);
  if (idx >= 0) {
    const next = [...posts];
    next[idx] = { ...next[idx], comment_count: (next[idx].comment_count ?? 0) + 1 };
    postsCache = next;
  }
  return comment;
}

export function applyRemoteCommentDelete(commentId: string, postId: string): void {
  commentsCache = ensureCommentsCache().filter((c) => c.id !== commentId);
  const posts = ensurePostsCache();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx >= 0) {
    const next = [...posts];
    next[idx] = {
      ...next[idx],
      comment_count: Math.max(0, (next[idx].comment_count ?? 1) - 1),
    };
    postsCache = next;
  }
}

export function applyRemoteLikeChange(row: RemoteLikeRow, delta: 1 | -1): void {
  const posts = ensurePostsCache();
  const idx = posts.findIndex((p) => p.id === row.post_id);
  if (idx < 0) return;
  const counts = { ...posts[idx].reaction_counts };
  const key = row.kind as keyof Post['reaction_counts'];
  if (key === 'like' || key === 'fire' || key === 'heart') {
    counts[key] = Math.max(0, counts[key] + delta);
  }
  const next = [...posts];
  next[idx] = { ...next[idx], reaction_counts: counts };
  postsCache = next;
}

/* ═══ COURSES (admin-created content — kept on localStorage for v1) ═══ */
export function getCourses(): Course[] {
  return load<Course>(STORAGE_KEYS.courses, []);
}

export function addCourse(course: Course): Course[] {
  const courses = getCourses();
  courses.push(course);
  save(STORAGE_KEYS.courses, courses);
  return courses;
}

/* ═══ LESSONS ═══ */
export function getLessons(): Lesson[] {
  return load<Lesson>(STORAGE_KEYS.lessons, []);
}

/* ═══ EVENTS ═══ */
export function getEvents(): CalendarEvent[] {
  return load<CalendarEvent>(STORAGE_KEYS.events, []);
}

export function addEvent(event: CalendarEvent): CalendarEvent[] {
  const events = getEvents();
  events.push(event);
  save(STORAGE_KEYS.events, events);
  return events;
}

/* ═══ MEMBERS ═══
 * In remote mode, members come from `profiles`. We still mirror locally so
 * existing call sites (Feed avatar lookup, MemberCRM) stay synchronous.
 */
export function getMembers(): Profile[] {
  return load<Profile>(STORAGE_KEYS.members, []);
}

export function getMemberById(id: string): Profile | undefined {
  return getMembers().find((m) => m.id === id);
}

export function registerMember(profile: Profile): void {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === profile.id);
  if (idx === -1) {
    members.push(profile);
  } else {
    // Always sync stored member with current auth profile
    members[idx] = { ...members[idx], ...profile };
  }
  save(STORAGE_KEYS.members, members);
}

export function updateMember(id: string, update: Partial<Profile>): void {
  const members = getMembers().map((m) =>
    m.id === id ? { ...m, ...update } : m,
  );
  save(STORAGE_KEYS.members, members);
}

/* ═══ GAMIFICATION — Point awarding (local-only; remote will hook later) ═══ */
function awardPoints(userId: string, amount: number): void {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === userId);
  if (idx === -1) return;
  const member = members[idx];
  const newPoints = member.points + amount;
  const newLevel = getLevelForPoints(newPoints);
  members[idx] = { ...member, points: newPoints, level: newLevel };
  save(STORAGE_KEYS.members, members);
}

/* ═══ ADMIN — Member management ═══ */
export function removeMember(memberId: string): void {
  const members = getMembers().filter((m) => m.id !== memberId);
  save(STORAGE_KEYS.members, members);
  // Also remove their posts and comments
  const posts = getPosts().filter((p) => p.author_id !== memberId);
  postsCache = posts;
  save(STORAGE_KEYS.posts, posts);
  const comments = getComments().filter((c) => c.author_id !== memberId);
  commentsCache = comments;
  save(STORAGE_KEYS.comments, comments);
}

export function suspendMember(memberId: string): void {
  updateMember(memberId, { status: 'suspended' } as Partial<Profile>);
}

export function reactivateMember(memberId: string): void {
  updateMember(memberId, { status: 'active' } as Partial<Profile>);
}

export function updateMemberRole(memberId: string, role: Profile['role']): void {
  updateMember(memberId, { role });
}

/* ═══ DIRECT MESSAGES ═══
 *
 * Removed in AP-COMMUNITY-2026-05 · Cleanup + Polish Agent 6.
 *
 * Frank's product decision: Asset Persona does not run direct messaging.
 * Member-to-member contact happens through the public Feed; member-to-Frank
 * contact happens through the FAQ "Ask Frank" form (form_type='qa') which
 * routes through inquiry-webhook into the admin Inquiries Kanban.
 *
 * If you ever need this back, do it as a fresh feature with proper RLS,
 * abuse reporting, blocking, and admin moderation — not as a localStorage
 * stub.
 */

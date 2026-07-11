/* ═══ BLOG SYNC — Supabase mirror for blogDrafts ═══
 *
 * Strategy (per Wave 4):
 *   - blogDrafts.ts stays the sync source of truth. UI is unchanged.
 *   - Every save/publish/delete fires a best-effort Supabase mirror in the
 *     background. Failures (RLS denied, table missing pre-Wave-1-push, network)
 *     are swallowed so the local write is never blocked.
 *   - On app mount, hydrate() pulls all rows from blog_posts and merges them
 *     into localStorage by slug. Slug is the merge key, not id, because
 *     localStorage drafts may have a different id than the DB row.
 *   - Bypass mode: we skip the mirror entirely. LocalStorage is the world.
 *
 * Wave 1 schema (`blog_posts`) is the target table. Field mapping is in the
 * `toRow()` and `fromRow()` helpers below.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from './../lib/devBypass';
import type { BlogDraft } from './blogDrafts';

const STORAGE_KEY = 'ap_blog_drafts';

interface BlogPostsRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived';
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[] | null;
  faq_schema: unknown;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function shouldMirror(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function toRow(draft: BlogDraft): Partial<BlogPostsRow> & { slug: string } {
  return {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt || null,
    body_md: draft.content,
    cover_image: draft.coverImage ?? null,
    status: draft.status === 'published' ? 'published' : 'draft',
    tags: draft.tags ?? [],
    seo_title: draft.seoTitle ?? null,
    seo_description: draft.seoDescription ?? null,
    keywords: draft.keywords ?? null,
    faq_schema: draft.faqSchema ?? [],
    author_name: draft.author,
    published_at: draft.status === 'published' ? new Date().toISOString() : null,
  };
}

function fromRow(row: BlogPostsRow): BlogDraft {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.body_md,
    author: row.author_name ?? 'Frank Lawrence Jr.',
    tags: row.tags ?? [],
    readTime: estimateReadTime(row.body_md),
    status: row.status === 'published' ? 'published' : 'draft',
    coverImage: row.cover_image ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    keywords: row.keywords ?? undefined,
    faqSchema: Array.isArray(row.faq_schema) ? (row.faq_schema as BlogDraft['faqSchema']) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function estimateReadTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function readLocal(): BlogDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BlogDraft[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(drafts: BlogDraft[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore quota errors */
  }
}

/** Best-effort upsert. Never throws. */
export async function mirrorSave(draft: BlogDraft): Promise<void> {
  if (!shouldMirror()) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('blog_posts')
      .upsert(toRow(draft), { onConflict: 'slug' });
  } catch {
    /* DB may not be live yet — silent */
  }
}

export async function mirrorDelete(slug: string): Promise<void> {
  if (!shouldMirror()) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('blog_posts').delete().eq('slug', slug);
  } catch {
    /* silent */
  }
}

/**
 * Schedule a callback for when the main thread is idle. Falls back to
 * setTimeout(0) on Safari and other browsers that don't expose
 * requestIdleCallback yet. This is the canonical pattern for "do this
 * after the page is interactive" work.
 *
 * Spec: https://w3c.github.io/requestidlecallback/
 */
function whenIdle(cb: () => void): void {
  // Browsers that don't have requestIdleCallback (Safari < 17) get a 0ms
  // timeout, which still defers to the next macrotask — better than
  // blocking the current frame.
  type IdleWindow = Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof window === 'undefined') {
    setTimeout(cb, 0);
    return;
  }
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 0);
  }
}

async function runHydration(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error || !Array.isArray(data)) return;

    const local = readLocal();
    const bySlug: Record<string, BlogDraft> = {};
    for (const d of local) bySlug[d.slug] = d;
    for (const row of data as BlogPostsRow[]) {
      bySlug[row.slug] = fromRow(row);
    }
    writeLocal(Object.values(bySlug));
  } catch {
    /* silent */
  }
}

/**
 * One-shot hydration. Pulls every blog_posts row, merges into localStorage by
 * slug. Server wins on conflict (server is the source of truth once live).
 * Safe to call multiple times.
 *
 * Hydration is deferred to the next idle slot so it never blocks TTI. The
 * function returns immediately; the actual Supabase fetch runs when the
 * browser is idle, typically right after first paint + interaction-ready.
 */
export async function hydrateFromSupabase(): Promise<void> {
  if (!shouldMirror()) return;
  whenIdle(() => { void runHydration(); });
}

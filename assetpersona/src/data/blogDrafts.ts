/* ═══ BLOG DRAFTS — Supabase-first with localStorage fallback ═══
 * Single-admin blog writing system.
 *
 * Lane 5 of AP-CONTENT-HUB-2026-05 swapped the persistence story:
 *   - When Supabase is configured AND dev bypass is NOT active, every
 *     write mirrors to the dedicated `blog_drafts` Supabase table
 *     (migration 20260519100200_create_blog_drafts.sql). Reads after
 *     hydrateDraftsFromSupabase() reflect the server state.
 *   - When Supabase is unconfigured OR bypass is active, the file
 *     behaves as it always did: localStorage is the world. This keeps
 *     local-only development and the dev-bypass admin walk-throughs
 *     working without a live database.
 *
 * The legacy mirror to `blog_posts` (see blogSync.ts) is preserved —
 * a draft that gets published continues to land in blog_posts so the
 * public Blog.tsx read path is unchanged. Lane 5 ADDS the dedicated
 * `blog_drafts` table for unpublished work; it does not REPLACE the
 * blog_posts mirror.
 *
 * Consumer signatures (the sync API used by BlogWrite.tsx,
 * BlogAdmin.tsx, Dashboard.tsx) are unchanged. Hydration runs once
 * on app mount; subsequent reads are sync from the localStorage cache.
 */

import type { BlogPost, FAQItem } from '../content/blog';
import { mirrorSave, mirrorDelete } from './blogSync';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

export interface BlogDraft {
  id: string;
  slug: string;
  title: string;
  content: string;        // Markdown body
  excerpt: string;
  author: string;
  tags: string[];
  readTime: string;
  status: 'draft' | 'published';
  coverGradient?: string;
  coverImage?: string;    // URL or storage path
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  faqSchema?: FAQItem[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ap_blog_drafts';
const DRAFTS_TABLE = 'blog_drafts';

/* ── Mode helpers ──
 * shouldMirrorDrafts: when true, every write also fires a Supabase
 * upsert against blog_drafts. When false, only localStorage runs.
 */
function shouldMirrorDrafts(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/* ── Local cache helpers ── */
function loadDrafts(): BlogDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BlogDraft[];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: BlogDraft[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* quota errors are non-fatal — Supabase is the source of truth when live */
  }
}

function estimateReadTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ── Row mapping: BlogDraft ↔ blog_drafts row ── */

interface BlogDraftsRow {
  id: string;
  author_id: string | null;
  slug: string;
  title: string | null;
  body_md: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[] | null;
  faq_jsonld: unknown;
  author_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_saved_at: string;
}

function toRow(draft: BlogDraft, authorId: string | null): Partial<BlogDraftsRow> & { slug: string } {
  return {
    author_id: authorId,
    slug: draft.slug,
    title: draft.title,
    body_md: draft.content,
    excerpt: draft.excerpt || null,
    cover_image_url: draft.coverImage ?? null,
    cover_image_alt: null,
    tags: draft.tags ?? [],
    seo_title: draft.seoTitle ?? null,
    seo_description: draft.seoDescription ?? null,
    keywords: draft.keywords ?? null,
    faq_jsonld: draft.faqSchema ?? [],
    author_name: draft.author,
    metadata: {
      coverGradient: draft.coverGradient ?? null,
      readTime: draft.readTime ?? null,
      status: draft.status,
      // Keep the local id so a future migration can reconcile.
      local_id: draft.id,
    },
    last_saved_at: draft.updatedAt,
  };
}

function fromRow(row: BlogDraftsRow): BlogDraft {
  const meta = (row.metadata ?? {}) as {
    coverGradient?: string | null;
    readTime?: string | null;
    status?: 'draft' | 'published';
    local_id?: string;
  };
  return {
    id: meta.local_id || row.id,
    slug: row.slug,
    title: row.title ?? 'Untitled',
    content: row.body_md ?? '',
    excerpt: row.excerpt ?? '',
    author: row.author_name ?? 'Frank Lawrence Jr.',
    tags: row.tags ?? [],
    readTime: meta.readTime || estimateReadTime(row.body_md ?? ''),
    status: meta.status === 'published' ? 'published' : 'draft',
    coverGradient: meta.coverGradient ?? undefined,
    coverImage: row.cover_image_url ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    keywords: row.keywords ?? undefined,
    faqSchema: Array.isArray(row.faq_jsonld) ? (row.faq_jsonld as FAQItem[]) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ── Supabase mirror (fire-and-forget so the sync API stays stable) ── */

async function getAuthorId(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function mirrorSaveDraft(draft: BlogDraft): Promise<void> {
  if (!shouldMirrorDrafts()) return;
  try {
    const authorId = await getAuthorId();
    // Without a logged-in author the RLS insert policy will refuse —
    // skip silently and let localStorage hold the write.
    if (!authorId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from(DRAFTS_TABLE)
      .upsert(toRow(draft, authorId), { onConflict: 'author_id,slug' });
  } catch {
    /* RLS or transient — localStorage already has the write */
  }
}

async function mirrorDeleteDraft(slug: string): Promise<void> {
  if (!shouldMirrorDrafts()) return;
  try {
    const authorId = await getAuthorId();
    if (!authorId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from(DRAFTS_TABLE)
      .delete()
      .eq('author_id', authorId)
      .eq('slug', slug);
  } catch {
    /* silent */
  }
}

/* ── CRUD (sync surface preserved) ── */

export function getDrafts(): BlogDraft[] {
  return loadDrafts().filter((d) => d.status === 'draft');
}

export function getPublishedDrafts(): BlogDraft[] {
  return loadDrafts().filter((d) => d.status === 'published');
}

export function getAllBlogDrafts(): BlogDraft[] {
  return loadDrafts();
}

export function getDraftById(id: string): BlogDraft | undefined {
  return loadDrafts().find((d) => d.id === id);
}

export function getDraftBySlug(slug: string): BlogDraft | undefined {
  return loadDrafts().find((d) => d.slug === slug);
}

export function saveDraft(draft: Partial<BlogDraft> & { id: string }): BlogDraft {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  const now = new Date().toISOString();

  const updated: BlogDraft = {
    id: draft.id,
    slug: draft.slug || slugify(draft.title || 'untitled'),
    title: draft.title || 'Untitled',
    content: draft.content || '',
    excerpt: draft.excerpt || '',
    author: draft.author || 'Frank Lawrence Jr.',
    tags: draft.tags || [],
    readTime: estimateReadTime(draft.content || ''),
    status: draft.status || 'draft',
    coverGradient: draft.coverGradient,
    coverImage: draft.coverImage,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    keywords: draft.keywords,
    faqSchema: draft.faqSchema,
    createdAt: idx >= 0 ? drafts[idx].createdAt : now,
    updatedAt: now,
  };

  if (idx >= 0) {
    drafts[idx] = updated;
  } else {
    drafts.unshift(updated);
  }

  saveDrafts(drafts);
  // Best-effort Supabase mirrors — Lane 5 dedicated draft store + legacy blog_posts mirror.
  void mirrorSaveDraft(updated);
  void mirrorSave(updated);
  return updated;
}

export function publishDraft(draftId: string): BlogDraft | null {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === draftId);
  if (idx === -1) return null;

  drafts[idx] = {
    ...drafts[idx],
    status: 'published',
    updatedAt: new Date().toISOString(),
  };

  saveDrafts(drafts);
  // On publish: legacy mirror writes to blog_posts (the public read path),
  // and the dedicated drafts mirror updates the draft row's metadata so
  // the admin draft list can still see promoted drafts as 'published'.
  void mirrorSaveDraft(drafts[idx]);
  void mirrorSave(drafts[idx]);
  return drafts[idx];
}

export function unpublishDraft(draftId: string): BlogDraft | null {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === draftId);
  if (idx === -1) return null;

  drafts[idx] = {
    ...drafts[idx],
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };

  saveDrafts(drafts);
  void mirrorSaveDraft(drafts[idx]);
  void mirrorSave(drafts[idx]);
  return drafts[idx];
}

export function deleteDraft(draftId: string): void {
  const drafts = loadDrafts();
  const target = drafts.find((d) => d.id === draftId);
  const remaining = drafts.filter((d) => d.id !== draftId);
  saveDrafts(remaining);
  if (target) {
    void mirrorDeleteDraft(target.slug);
    void mirrorDelete(target.slug);
  }
}

/* ── Hydration ──
 * Pulls every row from blog_drafts visible to the current user
 * (RLS scopes this to their own drafts + any if they're admin) and
 * merges into localStorage by slug. Server wins on conflict — the
 * dedicated drafts table is the source of truth once live.
 *
 * Safe to call multiple times. Returns immediately when Supabase is
 * unconfigured or bypass is active so the call site can fire-and-forget
 * on every app mount.
 */
export async function hydrateDraftsFromSupabase(): Promise<void> {
  if (!shouldMirrorDrafts()) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from(DRAFTS_TABLE)
      .select('*')
      .order('updated_at', { ascending: false });
    if (error || !Array.isArray(data)) return;

    const local = loadDrafts();
    const bySlug: Record<string, BlogDraft> = {};
    for (const d of local) bySlug[d.slug] = d;
    for (const row of data as BlogDraftsRow[]) {
      bySlug[row.slug] = fromRow(row);
    }
    saveDrafts(Object.values(bySlug));
  } catch {
    /* silent — localStorage already serves reads */
  }
}

/* ── Conversion: BlogDraft → BlogPost (for rendering) ── */
export function draftToBlogPost(draft: BlogDraft): BlogPost {
  return {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    content: draft.content,
    author: draft.author,
    date: draft.createdAt.split('T')[0],
    readTime: draft.readTime,
    tags: draft.tags,
    coverGradient: draft.coverGradient,
    coverImage: draft.coverImage,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    keywords: draft.keywords,
    faqSchema: draft.faqSchema,
  };
}

/** Get all published posts from localStorage as BlogPost[] */
export function getLocalPublishedPosts(): BlogPost[] {
  return getPublishedDrafts().map(draftToBlogPost);
}

/* ═══ BLOG POST REGISTRY ═══
 *
 * To add a new blog post:
 * 1. Create a new .ts file in this directory
 * 2. Export a BlogPost object following the interface below
 * 3. Import and add it to the BLOG_POSTS array in this file
 * 4. Run `bun run build` and deploy
 *
 * Posts are sorted by date (newest first) automatically.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown
  author: string;
  date: string; // ISO date
  readTime: string;
  tags: string[];
  coverGradient?: string; // CSS gradient for card header (legacy)
  coverImage?: string; // URL or storage path to cover image (preferred)
  // SEO fields
  seoTitle?: string; // 50-60 chars ideal
  seoDescription?: string; // 150-160 chars ideal
  keywords?: string[];
  // AEO fields (Answer Engine Optimization)
  faqSchema?: FAQItem[]; // generates FAQ rich results in search
}

// Import posts
import { post as vibeCodingPost } from './vibe-coding-explained';
import { post as aiLiteracyPost } from './ai-literacy-2026';
import { post as buildInPublicPost } from './building-in-public';
import { getLocalPublishedPosts } from '../../data/blogDrafts';

// Static posts (bundled with the app)
const STATIC_POSTS: BlogPost[] = [
  vibeCodingPost,
  aiLiteracyPost,
  buildInPublicPost,
];

/** Get all published posts: static + admin-written (from localStorage) */
export function getAllPublishedPosts(): BlogPost[] {
  const localPosts = getLocalPublishedPosts();
  // Merge, dedup by slug (localStorage wins if slug collision), sort newest first
  const bySlug = new Map<string, BlogPost>();
  for (const p of STATIC_POSTS) bySlug.set(p.slug, p);
  for (const p of localPosts) bySlug.set(p.slug, p); // override static if slug matches
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Legacy export: static posts only (for backward compat)
export const BLOG_POSTS: BlogPost[] = STATIC_POSTS.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

// Lookup helper (searches both static and local-published)
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPublishedPosts().find((p) => p.slug === slug);
}

// SEO score calculator (0-100)
export function computeSEOScore(post: BlogPost): number {
  let score = 0;
  const title = post.seoTitle || post.title;
  const desc = post.seoDescription || post.excerpt;

  // Title length (50-60 chars = perfect)
  if (title.length >= 50 && title.length <= 60) score += 25;
  else if (title.length >= 40 && title.length <= 70) score += 15;
  else score += 5;

  // Description length (150-160 chars = perfect)
  if (desc.length >= 150 && desc.length <= 160) score += 25;
  else if (desc.length >= 120 && desc.length <= 170) score += 15;
  else score += 5;

  // Keywords present
  if (post.keywords && post.keywords.length >= 3) score += 20;
  else if (post.keywords && post.keywords.length >= 1) score += 10;

  // FAQ schema present (AEO boost)
  if (post.faqSchema && post.faqSchema.length >= 2) score += 20;
  else if (post.faqSchema && post.faqSchema.length >= 1) score += 10;

  // Tags present
  if (post.tags.length >= 2) score += 10;
  else if (post.tags.length >= 1) score += 5;

  return Math.min(score, 100);
}

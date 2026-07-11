/* ═══ FEED INTEL — Threads "For You" data layer ═══
 *
 * Typed data surface for the Feed Intel admin page. Calls the
 * `threads-feed` Supabase edge function to fetch scraped posts.
 * Gracefully falls back to an empty array with a console.warn
 * when the function doesn't exist yet or Supabase isn't configured.
 *
 * Follows the bypass/remote pattern in contentHub.ts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

/* ── Types ── */

export interface Vertical {
  id: string;
  name: string;
  keywords: string[];
}

export interface FeedPost {
  id: string;
  username: string;
  text: string;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  shares: number;
  taken_at: string;
  post_code: string;
  link: string;
  vertical_tags: string[];
  scraped_at: string;
}

export type FeedSortMode = 'newest' | 'most_engaged' | 'opportunity';

/* ── Verticals registry ── */

const VERTICALS: Vertical[] = [
  {
    id: 'cannabis',
    name: 'Cannabis',
    keywords: ['cannabis', 'weed', 'thc', 'cbd', 'dispensary', 'hemp', '420'],
  },
  {
    id: 'tech',
    name: 'Tech',
    keywords: ['ai', 'saas', 'coding', 'developer', 'startup', 'software', 'tech', 'api'],
  },
  {
    id: 'business',
    name: 'Business',
    keywords: ['business', 'entrepreneur', 'revenue', 'founder', 'brand', 'marketing', 'strategy'],
  },
  {
    id: 'music',
    name: 'Music',
    keywords: ['music', 'album', 'producer', 'beats', 'hiphop', 'rap', 'r&b', 'studio'],
  },
  {
    id: 'sneakers',
    name: 'Sneakers',
    keywords: ['sneakers', 'jordan', 'nike', 'adidas', 'kicks', 'yeezy', 'dunks', 'footwear'],
  },
];

/* ── Helpers ── */

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function computeEngagement(post: FeedPost): number {
  return post.likes + post.replies * 3 + post.reposts * 2 + post.quotes * 4 + post.shares * 2;
}

function sortPosts(posts: FeedPost[], mode: FeedSortMode): FeedPost[] {
  const sorted = [...posts];
  switch (mode) {
    case 'newest':
      return sorted.sort((a, b) => b.taken_at.localeCompare(a.taken_at));
    case 'most_engaged':
      return sorted.sort((a, b) => computeEngagement(b) - computeEngagement(a));
    case 'opportunity':
      // Opportunity: recent posts with low engagement (reply-worthy).
      // High recency + low total engagement = best opportunity.
      return sorted.sort((a, b) => {
        const aScore = computeEngagement(a);
        const bScore = computeEngagement(b);
        const aTime = new Date(a.taken_at).getTime();
        const bTime = new Date(b.taken_at).getTime();
        // Newer is better, lower engagement is better
        return (bTime - aTime) + (aScore - bScore);
      });
    default:
      return sorted;
  }
}

/* ── List feed posts ── */

export async function listFeedPosts(vertical?: string): Promise<FeedPost[]> {
  if (!shouldUseRemote()) {
    console.warn(
      '[Feed Intel] Supabase not configured or bypass active — returning empty feed. ' +
      'Deploy the threads-feed edge function to see live data.'
    );
    return [];
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).functions.invoke('threads-feed', {
      body: {
        action: 'list',
        vertical: vertical ?? null,
      },
    });

    if (error) {
      console.warn('[Feed Intel] Edge function error:', error.message ?? error);
      return [];
    }

    const posts = (data?.posts ?? data) as FeedPost[] | undefined;
    if (!Array.isArray(posts)) {
      console.warn('[Feed Intel] Unexpected response shape — returning empty feed.');
      return [];
    }

    return posts;
  } catch (err) {
    console.warn(
      '[Feed Intel] Could not reach threads-feed edge function. It may not be deployed yet.',
      err
    );
    return [];
  }
}

/* ── Trigger a fresh scrape ── */

export async function triggerScrape(): Promise<{ ok: boolean; count: number }> {
  if (!shouldUseRemote()) {
    console.warn(
      '[Feed Intel] Supabase not configured or bypass active — scrape skipped.'
    );
    return { ok: false, count: 0 };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).functions.invoke('threads-feed', {
      body: { action: 'scrape' },
    });

    if (error) {
      console.warn('[Feed Intel] Scrape trigger error:', error.message ?? error);
      return { ok: false, count: 0 };
    }

    return {
      ok: data?.ok ?? true,
      count: data?.count ?? 0,
    };
  } catch (err) {
    console.warn('[Feed Intel] Scrape trigger failed:', err);
    return { ok: false, count: 0 };
  }
}

/* ── List verticals ── */

export async function listVerticals(): Promise<Vertical[]> {
  return VERTICALS;
}

/* ── Sort helper (exported for the page) ── */

export { sortPosts, computeEngagement };

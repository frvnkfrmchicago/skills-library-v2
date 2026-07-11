/**
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 5 · Social Adapter Registry
 *
 * Single file every adapter is dispatched through. The dispatcher
 * Edge Function only knows two things: (1) the SocialAdapter
 * interface and (2) `getAdapter(platform)`. This indirection is the
 * Postiz-style "adapter behind dispatcher" pattern.
 *
 * Adding a new platform = drop one file under `_shared/social/` +
 * one line in the registry switch. No dispatcher edits required.
 */

import { linkedinAdapter } from './linkedin.ts';
import { xAdapter } from './x.ts';
import { blueskyAdapter } from './bluesky.ts';
import { threadsAdapter } from './threads.ts';
import { instagramAdapter } from './instagram.ts';
import { mastodonAdapter } from './mastodon.ts';
import { youtubeAdapter } from './youtube.ts';

/**
 * Mirrors the `social_platform` Postgres enum from the migration.
 * Kept here as a string-literal union so Edge Function builds
 * don't need to reach into `src/types/supabase.ts` (Deno + Vite
 * tree boundaries don't mix well). When `generate_typescript_types`
 * regenerates the Database type, this stays in lockstep with the
 * enum manually — both files reference the same migration.
 */
export type Platform =
  | 'threads'
  | 'linkedin'
  | 'x'
  | 'bluesky'
  | 'instagram'
  | 'mastodon'
  | 'youtube';

/* ───────── Shared types ───────── */

/**
 * The platform-neutral content blob the dispatcher hands to every adapter.
 *
 * - `text`       — the post body. Adapters truncate per platform cap.
 *                  (Threads = 500 / Bluesky = 300 / LinkedIn = 3000 / X = 280
 *                   / Instagram = 2200 / Mastodon = 500 default per instance.)
 * - `mediaUrls`  — optional CDN URLs. Threads + Bluesky + LinkedIn support
 *                  inline image attachment. The adapter handles uploading
 *                  to the platform's media endpoint when present.
 * - `sourceUrl`  — optional canonical link back to assetpersona.com. The
 *                  brand-voice rules forbid trailing the post with a URL on
 *                  Threads (matches frvnkfrmchicago voice), but other
 *                  platforms include it.
 */
export interface PublishPayload {
  text: string;
  mediaUrls?: string[];
  sourceUrl?: string;
}

/**
 * Every adapter returns the same shape. The dispatcher writes this
 * verbatim into `post_results` (minus `response_payload` which is
 * optional debug overflow).
 */
export interface PublishResult {
  status: 'sent' | 'failed' | 'manual_required' | 'rate_limited';
  platformPostId?: string;
  permalink?: string;
  error?: string;
  responsePayload?: unknown;
}

/**
 * A `social_accounts` row as the adapter sees it. The dispatcher
 * passes only what the adapter needs — never the row's id or
 * created_at, never another platform's tokens.
 */
export interface SocialAccount {
  ownerId: string;
  platform: Platform;
  handle: string | null;
  oauthAccessToken: string | null;
  oauthRefreshToken: string | null;
  expiresAt: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
}

export interface SocialAdapter {
  /**
   * Publish `payload` using `account`'s credentials. MUST NOT throw —
   * caught errors are returned as `{ status: 'failed', error }`. This
   * keeps one platform's failure from breaking the others in the same
   * dispatcher run.
   */
  publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult>;
}

/* ───────── Registry ───────── */

const ADAPTERS: Record<Platform, SocialAdapter> = {
  linkedin: linkedinAdapter,
  x: xAdapter,
  bluesky: blueskyAdapter,
  threads: threadsAdapter,
  instagram: instagramAdapter,
  mastodon: mastodonAdapter,
  youtube: youtubeAdapter,
};

/**
 * Resolve the adapter for a given platform. Returns a "manual_required"
 * stub if the platform is somehow not registered (defense in depth — the
 * enum keeps this from being reachable under normal flow).
 */
export function getAdapter(platform: Platform): SocialAdapter {
  const adapter = ADAPTERS[platform];
  if (adapter) return adapter;
  // Defensive — should be unreachable because `platform` is an enum.
  return {
    publish: async () => ({
      status: 'failed',
      error: `unknown_platform: ${platform}`,
    }),
  };
}

/* ───────── Helpers used by adapters ───────── */

/**
 * Truncate text to `max` chars on a word boundary when possible. Used
 * by every adapter that has a hard cap shorter than the inbound text.
 */
export function truncateOnWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return lastSpace > max * 0.7 ? slice.slice(0, lastSpace) : slice;
}

/**
 * Convert an HTTP error response to a PublishResult. Encapsulates the
 * 429/403-quota → rate_limited mapping all platforms share in spirit.
 */
export async function httpErrorToResult(
  resp: Response,
  platformLabel: string
): Promise<PublishResult> {
  const detail = await resp.text().catch(() => '');
  // 429 = formal rate limit. 403 with quota wording = X / LinkedIn quota
  // exhaustion. Both → caller will retry on the next cron tick.
  const isQuota =
    resp.status === 429 ||
    (resp.status === 403 && /quota|usage|limit/i.test(detail));
  return {
    status: isQuota ? 'rate_limited' : 'failed',
    error: `${platformLabel}_http_${resp.status}`,
    responsePayload: { status: resp.status, body: detail.slice(0, 512) },
  };
}

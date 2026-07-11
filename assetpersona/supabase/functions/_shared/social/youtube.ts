/**
 * YouTube Community adapter — MANUAL-ASSIST ONLY.
 *
 * 2026 reality (community.zapier.com on YouTube Community automation):
 *   • YouTube Community posts have NO publishing API. Google has
 *     explicitly stated the YouTube Data API does not expose a
 *     community-post create endpoint.
 *   • Third-party shortcuts (Make / Zapier "YouTube Community
 *     module") work by automating a logged-in browser. We do NOT
 *     do that — it violates ToS and breaks under headless detection.
 *
 * The adapter therefore returns `manual_required` every time. The
 * BroadcastsMonitor surfaces these as a "needs manual publish" row
 * with the copyable post text and a deep link to the YouTube
 * Community composer. Frank pastes + clicks "Post" himself.
 *
 * This stub keeps the adapter registry uniform so future
 * dispatchers don't need YouTube-specific branching. If/when
 * YouTube ships a real API, this is the only file that changes.
 */

import type {
  PublishPayload,
  PublishResult,
  SocialAccount,
  SocialAdapter,
} from './index.ts';

const YOUTUBE_COMMUNITY_DEEP_LINK = 'https://studio.youtube.com/channel/UC/community';

export const youtubeAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, _account: SocialAccount): Promise<PublishResult> {
    return {
      status: 'manual_required',
      error: 'YouTube Community has no publishing API in 2026',
      responsePayload: {
        instruction: 'Open the YouTube Studio Community composer and paste the text below.',
        copyText: payload.text,
        sourceUrl: payload.sourceUrl ?? null,
        deepLink: YOUTUBE_COMMUNITY_DEEP_LINK,
      },
    };
  },
};

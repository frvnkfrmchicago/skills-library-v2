// deno-lint-ignore-file no-explicit-any
/**
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 2 · Public Share-Card Loop
 * Edge Function: og-image
 *
 * Dynamic 1200x630 PNG renderer for /learned/:shareId share cards. Looks up
 * the joined share_card_view (learning post + profile + module), renders a
 * Satori React-element tree to SVG, then rasterizes the SVG to PNG with
 * @resvg/resvg-js. Returns image/png with a 1 hour cache.
 *
 * Visual pattern is mascot-forward Duolingo-style (high recognition, high
 * organic share lift): brand wordmark + category pill top-left, big display
 * takeaway in the center, member avatar + handle bottom-left, module title
 * + completion date bottom-right.
 *
 * Query:
 *   GET /functions/v1/og-image?shareId=<id>
 *
 * No auth required — anyone scraping the OG tag (Twitter, LinkedIn, iMessage)
 * needs to fetch the image without signing in. share_card_view is publicly
 * readable per the Lane 2 migration RLS.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
// Satori v0.10+ exposes its default export from npm; Deno's npm: specifier
// resolves it directly. The companion resvg-js renderer rasterizes the SVG
// Satori returns to a PNG buffer for the response.
// @ts-ignore — Deno npm: specifier; types ship with the package.
import satori from 'npm:satori@0.10.13';
// @ts-ignore — Deno npm: specifier.
import { Resvg } from 'npm:@resvg/resvg-js@2.6.2';

const PNG_WIDTH = 1200;
const PNG_HEIGHT = 630;

const MODULE_TYPE_LABEL: Record<string, string> = {
  daily_drill: 'Daily Drill',
  news_drop: 'News Drop',
  concept: 'Concept',
  role_pathway: 'Pathway',
  project: 'Project',
};

interface ShareCardRow {
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
  module_type: string;
  module_cover_image: string | null;
  module_published_at: string | null;
}

/* ── Font loader ──
 *
 * Satori needs at least one font ArrayBuffer to layout text. We pull Inter
 * (free, redistributable) from rsms.me at warm-start, then cache for the
 * lifetime of the Edge runtime so subsequent requests don't pay the fetch.
 */
let cachedFonts: { name: string; data: ArrayBuffer; weight: number; style: 'normal' }[] | null = null;

async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const [regular, bold] = await Promise.all([
    fetch('https://rsms.me/inter/font-files/Inter-Regular.woff').then((r) => r.arrayBuffer()),
    fetch('https://rsms.me/inter/font-files/Inter-Bold.woff').then((r) => r.arrayBuffer()),
  ]);
  cachedFonts = [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold, weight: 700, style: 'normal' },
  ];
  return cachedFonts;
}

/* ── React-like element tree for Satori ── */

function el(type: string, props: Record<string, any>, ...children: any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children.length === 0 ? undefined : children,
    },
  };
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function categoryLabel(type: string): string {
  return MODULE_TYPE_LABEL[type] ?? 'Module';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function buildCard(row: ShareCardRow) {
  const brand = 'Asset Persona';
  const category = categoryLabel(row.module_type);
  const completedOn = fmtDate(row.shared_at);
  const displayName = row.display_name || 'Asset Persona member';
  const avatarText = initials(displayName);

  // ── Outer 1200x630 frame ──
  return el(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        background: 'linear-gradient(135deg, #1a1530 0%, #2a1f4d 50%, #4a3370 100%)',
        color: '#fff',
        fontFamily: 'Inter',
      },
    },
    // ── Top row: wordmark + category pill ──
    el(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
        },
        el(
          'div',
          {
            style: {
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ff9a76 0%, #c084fc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#1a1530',
            },
          },
          'AP',
        ),
        el('div', { style: { display: 'flex' } }, brand),
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            padding: '12px 22px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
        },
        category,
      ),
    ),
    // ── Center takeaway ──
    el(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        },
      },
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: '22px',
            fontWeight: 600,
            color: '#ff9a76',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          },
        },
        'Today I learned',
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: row.takeaway.length > 140 ? '52px' : '64px',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#fff',
            maxWidth: '1072px',
          },
        },
        `"${row.takeaway}"`,
      ),
    ),
    // ── Bottom row: author + module ──
    el(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        },
      },
      // Author
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          },
        },
        el(
          'div',
          {
            style: {
              width: '76px',
              height: '76px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #c084fc 0%, #ff9a76 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              color: '#1a1530',
              border: '3px solid rgba(255,255,255,0.3)',
            },
          },
          avatarText || 'AP',
        ),
        el(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            },
          },
          el(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
              },
            },
            displayName,
          ),
          el(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: '20px',
                color: 'rgba(255,255,255,0.7)',
              },
            },
            'shared on Asset Persona',
          ),
        ),
      ),
      // Module
      el(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            maxWidth: '520px',
          },
        },
        el(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
              textAlign: 'right',
            },
          },
          row.module_title,
        ),
        completedOn
          ? el(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.6)',
                },
              },
              `Completed ${completedOn}`,
            )
          : el('div', { style: { display: 'flex' } }, ''),
      ),
    ),
  );
}

/* ── HTTP handler ── */

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  const url = new URL(req.url);
  const shareId = url.searchParams.get('shareId');
  if (!shareId) {
    return new Response(JSON.stringify({ error: 'missing_shareId' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  // Anonymous-read of share_card_view (RLS opens SELECT to anon).
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await sb
    .from('share_card_view')
    .select('*')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  try {
    const fonts = await loadFonts();
    const svg = await satori(buildCard(data as ShareCardRow), {
      width: PNG_WIDTH,
      height: PNG_HEIGHT,
      fonts,
    });

    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: PNG_WIDTH },
    })
      .render()
      .asPng();

    return new Response(png, {
      status: 200,
      headers: {
        ...cors,
        'content-type': 'image/png',
        'cache-control': 'public, max-age=3600, s-maxage=3600, immutable',
        // CDNs sometimes strip Vary unless explicit — Twitter/LinkedIn scrapers
        // share the cache so we want byte-identical responses.
        'x-share-id': shareId,
      },
    });
  } catch (err) {
    console.error('og-image render failed:', err);
    return new Response(JSON.stringify({ error: 'render_failed' }), {
      status: 500,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }
});

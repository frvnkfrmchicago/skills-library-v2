#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * AP-LAUNCH-2026-05 · Wave 4 · Polish + Ship
 * Generate public/sitemap.xml + public/feed.xml from a static route list and
 * (when the env is present) the live blog_posts table.
 *
 * Runs as a pre-build hook from package.json. Degrades gracefully when
 * blog_posts isn't reachable yet (Wave 1 not pushed) — the static routes are
 * still emitted so deploy isn't blocked.
 *
 * Inputs (env, all optional except VITE_SITE_URL for absolute URLs):
 *   VITE_SITE_URL              — e.g. https://www.assetpersona.com
 *   VITE_SUPABASE_URL          — used to fetch blog_posts
 *   VITE_SUPABASE_ANON_KEY     — anon key (RLS lets anyone read published)
 *
 * Outputs:
 *   public/sitemap.xml
 *   public/feed.xml
 *   public/robots.txt   (only if missing — won't overwrite hand edits)
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.assetpersona.com').replace(/\/$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

interface BlogPostsRow {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string;
}

interface ModulesRow {
  slug: string;
  title: string;
  hook: string | null;
  published_at: string | null;
  updated_at: string;
}

const STATIC_ROUTES: { path: string; priority: number; changefreq: string }[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/work', priority: 0.95, changefreq: 'weekly' },
  { path: '/work/consulting', priority: 0.9, changefreq: 'monthly' },
  { path: '/work/speaking', priority: 0.9, changefreq: 'monthly' },
  { path: '/work/training', priority: 0.9, changefreq: 'monthly' },
  { path: '/work/marketing', priority: 0.9, changefreq: 'monthly' },
  { path: '/agenticstudyhall', priority: 0.85, changefreq: 'weekly' },
  { path: '/talkthrutech', priority: 0.85, changefreq: 'weekly' },
  { path: '/blog', priority: 0.9, changefreq: 'daily' },
  { path: '/shop', priority: 0.7, changefreq: 'weekly' },
  { path: '/recordings', priority: 0.6, changefreq: 'monthly' },
  { path: '/resources', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.5, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/accessibility', priority: 0.3, changefreq: 'yearly' },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchPublishedPosts(): Promise<BlogPostsRow[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.warn('[sitemap] VITE_SUPABASE_URL or anon key missing — skipping blog rows');
    return [];
  }
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,published_at,updated_at&status=eq.published&order=published_at.desc&limit=500`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] blog_posts fetch returned ${res.status} — skipping (table may not be live yet)`);
      return [];
    }
    const data = (await res.json()) as BlogPostsRow[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[sitemap] blog_posts fetch threw — skipping:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 2 · Public Share-Card Loop
 *
 * Mirror of fetchPublishedPosts but for the modules table. Surfaces every
 * published module as a public /learn/:slug entry so share traffic + search
 * traffic both land on the teaser page (which converts non-members to
 * signup and members straight into the full reader).
 */
async function fetchPublishedModules(): Promise<ModulesRow[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.warn('[sitemap] VITE_SUPABASE_URL or anon key missing — skipping module rows');
    return [];
  }
  try {
    const url = `${SUPABASE_URL}/rest/v1/modules?select=slug,title,hook,published_at,updated_at&status=eq.published&order=published_at.desc&limit=1000`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] modules fetch returned ${res.status} — skipping (table may not be live yet)`);
      return [];
    }
    const data = (await res.json()) as ModulesRow[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[sitemap] modules fetch threw — skipping:', err instanceof Error ? err.message : err);
    return [];
  }
}

function buildSitemap(posts: BlogPostsRow[], modules: ModulesRow[]): string {
  const now = new Date().toISOString().slice(0, 10);
  const items: string[] = [];

  for (const r of STATIC_ROUTES) {
    items.push(
      `  <url>\n` +
        `    <loc>${SITE_URL}${r.path}</loc>\n` +
        `    <lastmod>${now}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    );
  }

  for (const p of posts) {
    const lastmod = (p.updated_at || p.published_at || new Date().toISOString()).slice(0, 10);
    items.push(
      `  <url>\n` +
        `    <loc>${SITE_URL}/blog/${p.slug}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>0.7</priority>\n` +
        `  </url>`
    );
  }

  // Lane 2 of AP-ENGAGEMENT-LOOP-2026-05: public module teasers at
  // /learn/:slug. Priority 0.7 mirrors the blog pattern — they're the public
  // surface for share traffic + search discovery.
  for (const m of modules) {
    const lastmod = (m.updated_at || m.published_at || new Date().toISOString()).slice(0, 10);
    items.push(
      `  <url>\n` +
        `    <loc>${SITE_URL}/learn/${m.slug}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>0.7</priority>\n` +
        `  </url>`
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    items.join('\n') +
    `\n</urlset>\n`
  );
}

function buildFeed(posts: BlogPostsRow[]): string {
  const now = new Date().toUTCString();
  const items = posts
    .slice(0, 50)
    .map((p) => {
      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : now;
      return (
        `    <item>\n` +
        `      <title>${escapeXml(p.title)}</title>\n` +
        `      <link>${SITE_URL}/blog/${p.slug}</link>\n` +
        `      <guid>${SITE_URL}/blog/${p.slug}</guid>\n` +
        `      <pubDate>${pubDate}</pubDate>\n` +
        (p.excerpt ? `      <description>${escapeXml(p.excerpt)}</description>\n` : '') +
        `    </item>`
      );
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>Asset Persona — Persona Blog</title>\n` +
    `    <link>${SITE_URL}/blog</link>\n` +
    `    <description>AI literacy, the AI economy, and what to actually do this quarter. By Frank Lawrence Jr.</description>\n` +
    `    <language>en-us</language>\n` +
    `    <lastBuildDate>${now}</lastBuildDate>\n` +
    items +
    `\n  </channel>\n` +
    `</rss>\n`
  );
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  const [posts, modules] = await Promise.all([
    fetchPublishedPosts(),
    fetchPublishedModules(),
  ]);
  console.log(
    `[sitemap] static routes: ${STATIC_ROUTES.length}, blog rows: ${posts.length}, module rows: ${modules.length}`,
  );

  const sitemap = buildSitemap(posts, modules);
  await writeFile(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`[sitemap] wrote public/sitemap.xml (${(sitemap.length / 1024).toFixed(1)} KB)`);

  const feed = buildFeed(posts);
  await writeFile(resolve(PUBLIC_DIR, 'feed.xml'), feed, 'utf8');
  console.log(`[sitemap] wrote public/feed.xml (${(feed.length / 1024).toFixed(1)} KB)`);

  // Only create robots.txt if missing — never clobber hand edits.
  const robotsPath = resolve(PUBLIC_DIR, 'robots.txt');
  if (!(await fileExists(robotsPath))) {
    const robots =
      `# Asset Persona\n` +
      `User-agent: *\n` +
      `Allow: /\n` +
      `Disallow: /admin/\n` +
      `Disallow: /studio-preview\n` +
      `\n` +
      `Sitemap: ${SITE_URL}/sitemap.xml\n`;
    await writeFile(robotsPath, robots, 'utf8');
    console.log(`[sitemap] wrote public/robots.txt`);
  }
}

main().catch((err) => {
  console.error('[sitemap] generation failed (continuing build):', err);
  // Do NOT exit non-zero — sitemap shouldn't block deploy.
  process.exit(0);
});

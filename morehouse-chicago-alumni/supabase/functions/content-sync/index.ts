/**
 * content-sync — Supabase Edge Function (Deno/TypeScript)
 *
 * Per-source content ingestion for the Morehouse Chicago Alumni web app.
 * Sources: Morehouse News RSS (news.morehouse.edu/rss.xml — verified working HubSpot feed),
 *          Localist RSS (events.morehouse.edu/calendar/1.xml),
 *          sitemap diff (morehouse.edu/sitemap.xml).
 *
 * Security invariants:
 * - All secrets read from Deno.env only (never shipped to client).
 * - Input validated before any DB access.
 * - No LLM / model calls — relevance via keyword heuristic only.
 * - Summaries are excerpts <=500 chars; image_url links to source, not copied.
 * - Read-before-write dedup on (source_id, url).
 * - Auto-approve: platform==='morehouse_news' or 'morehouse_events' AND
 *   chicago_relevance==='general' → approval_status='auto_approved' at insert.
 *   Items with relevance 'direct' or 'adjacent' land 'pending' (board queue).
 * - Auto-archive event items whose source_date is >7 days past.
 * - consecutive_failures incremented on error; alert on >=2.
 *
 * Skills used: api-integrating, n8n-automating, research-conducting, search-building
 * Librarians used: research-librarian, n8n-librarian, connector-librarian, search-librarian
 *
 * Sources: https://news.morehouse.edu/rss.xml (verified working, keyless HubSpot RSS)
 *          https://events.morehouse.edu/calendar/1.xml (Localist RSS)
 *          https://supabase.com/docs/guides/functions
 *          https://schema.org/NewsArticle
 *          https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 *
 * Scheduling: pg_cron expression 0 *\/6 * * * (every 6 hours).
 * See docs/content-sources.md for full schedule per source.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types (mirror of data-contract.md §4 — no deviations)
// ---------------------------------------------------------------------------

type ContentPlatform =
  | "morehouse_web"
  | "morehouse_news"
  | "morehouse_events"
  | "instagram"
  | "linkedin"
  | "national"
  | "chapter"
  | "other";

type ContentFetchMethod =
  | "rss_poll"
  | "sitemap_diff"
  | "html_parse"
  | "manual_entry";

type ContentType =
  | "news"
  | "event"
  | "announcement"
  | "social_post"
  | "institutional";

type ChicagoRelevance = "direct" | "adjacent" | "general" | "not_relevant";

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "archived"
  | "auto_approved";

interface ContentSource {
  id: string;
  platform: ContentPlatform;
  source_name: string;
  source_url: string;
  api_url: string | null;
  fetch_method: ContentFetchMethod;
  poll_interval_hours: number | null;
  active: boolean;
  requires_auth: boolean;
  consecutive_failures: number;
}

interface NewContentItem {
  source_id: string;
  external_id: string | null;
  title: string | null;
  summary: string | null;
  url: string | null;
  source_url: string | null;
  source_platform: ContentPlatform | null;
  source_date: string | null; // ISO date
  relevance_tags: string[];
  chicago_relevance: ChicagoRelevance;
  content_type: ContentType | null;
  image_url: string | null;
  approval_status: ApprovalStatus;
  fetched_at: string; // ISO timestamptz
}

interface SyncResult {
  source_id: string;
  source_name: string;
  fetched: number;
  inserted: number;
  skipped_dupe: number;
  archived: number;
  error: string | null;
  alert: string | null;
}

// ---------------------------------------------------------------------------
// Chicago relevance keyword heuristic (NO model call — §8 + §9)
// ---------------------------------------------------------------------------

const DIRECT_KEYWORDS = [
  "chicago",
  "illinois",
  "midwest",
  "chapter",
  "camaa",
  "chicagoland",
];

const ADJACENT_KEYWORDS = [
  "alumni",
  "career",
  "scholarship",
  "giving",
  "networking",
  "mentoring",
  "homecoming",
  "fellowship",
  "grant",
  "award",
  "foundation",
  "donation",
];

function scoreRelevance(text: string): {
  relevance: ChicagoRelevance;
  tags: string[];
} {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  const directHit = DIRECT_KEYWORDS.find((k) => lower.includes(k));
  if (directHit) {
    tags.push(directHit);
    return { relevance: "direct", tags };
  }

  const adjacentHits = ADJACENT_KEYWORDS.filter((k) => lower.includes(k));
  if (adjacentHits.length > 0) {
    tags.push(...adjacentHits.slice(0, 5));
    return { relevance: "adjacent", tags };
  }

  return { relevance: "general", tags };
}

// ---------------------------------------------------------------------------
// Excerpt helper — <=500 chars, no innerHTML risk
// ---------------------------------------------------------------------------

function excerpt(raw: string | null | undefined, max = 500): string | null {
  if (!raw) return null;
  const clean = raw.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + "…";
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isEventExpired(sourceDateStr: string | null): boolean {
  if (!sourceDateStr) return false;
  const sourceDate = new Date(sourceDateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return sourceDate < cutoff;
}

// ---------------------------------------------------------------------------
// Auto-approve decision — NO model call, pure platform + relevance rule.
// Rule: morehouse_news or morehouse_events + relevance 'general' → auto_approved.
//       'direct' or 'adjacent' stay 'pending' so the board can review and surface
//       or suppress them before they reach the public hub.
// ---------------------------------------------------------------------------

function resolveApprovalStatus(
  platform: ContentPlatform,
  relevance: ChicagoRelevance
): ApprovalStatus {
  if (
    (platform === "morehouse_news" || platform === "morehouse_events") &&
    relevance === "general"
  ) {
    return "auto_approved";
  }
  return "pending";
}

// ---------------------------------------------------------------------------
// XML / RSS parser — shared by Localist events and Morehouse News HubSpot RSS.
// Localist RSS: https://events.morehouse.edu/calendar/1.xml
// Morehouse News RSS: https://news.morehouse.edu/rss.xml (HubSpot, verified working)
// Standard RSS 2.0 with <item> elements.
// ---------------------------------------------------------------------------

interface RSSItem {
  guid: string | null;
  title: string | null;
  link: string | null;
  description: string | null;
  pubDate: string | null;
  imageUrl: string | null;
}

function parseRSSText(xmlText: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Extract all <item>...</item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];

    const getTag = (tag: string): string | null => {
      // Handle CDATA
      const cdataRe = new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
        "i"
      );
      const plainRe = new RegExp(
        `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        "i"
      );
      const cdata = cdataRe.exec(block);
      if (cdata) return cdata[1].trim();
      const plain = plainRe.exec(block);
      if (plain) return plain[1].trim();
      return null;
    };

    // enclosure or media:content for image
    const enclosureRe =
      /<enclosure[^>]+url="([^"]+)"[^>]*type="image[^"]*"/i;
    const mediaRe = /<media:content[^>]+url="([^"]+)"/i;
    let imageUrl: string | null = null;
    const encl = enclosureRe.exec(block);
    const media = mediaRe.exec(block);
    if (encl) imageUrl = encl[1];
    else if (media) imageUrl = media[1];

    items.push({
      guid: getTag("guid"),
      title: getTag("title"),
      link: getTag("link"),
      description: getTag("description"),
      pubDate: getTag("pubDate"),
      imageUrl,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// HTML parser — news.morehouse.edu page 1
// HubSpot-powered, no RSS. Extract article cards from page HTML.
// This path is deliberately fragile-acknowledged; alert on 2 consecutive 0-item.
// ---------------------------------------------------------------------------

interface HTMLNewsItem {
  title: string | null;
  link: string | null;
  summary: string | null;
  pubDate: string | null;
  imageUrl: string | null;
}

function parseNewsHTML(html: string, baseUrl: string): HTMLNewsItem[] {
  const items: HTMLNewsItem[] = [];

  // HubSpot blog listing: <article ...> or .blog-post or similar
  // Pattern: look for post-title links and meta.
  // This regex is intentionally broad to survive minor template changes.
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match: RegExpExecArray | null;

  while ((match = articleRe.exec(html)) !== null) {
    const block = match[1];

    // Title + link: first <a href="..."> inside a heading
    const titleLinkRe = /<h[1-6][^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
    const tlm = titleLinkRe.exec(block);
    let title: string | null = null;
    let link: string | null = null;
    if (tlm) {
      link = tlm[1].startsWith("http") ? tlm[1] : baseUrl + tlm[1];
      title = tlm[2].replace(/<[^>]+>/g, "").trim();
    }

    // Summary: first <p> text
    const summaryRe = /<p[^>]*>([\s\S]*?)<\/p>/i;
    const sm = summaryRe.exec(block);
    const summary = sm
      ? sm[1].replace(/<[^>]+>/g, "").trim()
      : null;

    // Date: <time datetime="..."> or data-date
    const timeRe = /<time[^>]+datetime="([^"]+)"/i;
    const tm = timeRe.exec(block);
    const pubDate = tm ? tm[1] : null;

    // Image
    const imgRe = /<img[^>]+src="([^"]+)"/i;
    const im = imgRe.exec(block);
    const imageUrl = im ? im[1] : null;

    if (title || link) {
      items.push({ title, link, summary, pubDate, imageUrl });
    }
  }

  // Fallback: if zero articles found via <article>, try .post-item divs
  if (items.length === 0) {
    const divRe =
      /<div[^>]+class="[^"]*(?:post|blog|article|news)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    while ((match = divRe.exec(html)) !== null) {
      const block = match[1];
      const aRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
      const am = aRe.exec(block);
      if (!am) continue;
      const link = am[1].startsWith("http") ? am[1] : baseUrl + am[1];
      const title = am[2].replace(/<[^>]+>/g, "").trim();
      if (!title || title.length < 4) continue;
      items.push({ title, link, summary: null, pubDate: null, imageUrl: null });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Sitemap diff — morehouse.edu/sitemap.xml
// Weekly: collect new URLs matching content patterns; dedupe; land as pending.
// ---------------------------------------------------------------------------

interface SitemapEntry {
  url: string;
  lastmod: string | null;
}

function parseSitemapXML(xmlText: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/gi;
  let match: RegExpExecArray | null;

  while ((match = urlRe.exec(xmlText)) !== null) {
    const block = match[1];
    const locRe = /<loc>([\s\S]*?)<\/loc>/i;
    const modRe = /<lastmod>([\s\S]*?)<\/lastmod>/i;
    const loc = locRe.exec(block);
    const mod = modRe.exec(block);
    if (loc) {
      entries.push({
        url: loc[1].trim(),
        lastmod: mod ? mod[1].trim() : null,
      });
    }
  }

  return entries;
}

// Pattern filter: URLs that look like news/press/announcements
const SITEMAP_CONTENT_PATTERNS = [
  /\/news\//i,
  /\/press\//i,
  /\/announcements?\//i,
  /\/stories?\//i,
  /\/articles?\//i,
  /\/insights?\//i,
];

function isSitemapContentUrl(url: string): boolean {
  return SITEMAP_CONTENT_PATTERNS.some((p) => p.test(url));
}

// ---------------------------------------------------------------------------
// Dedup check — read before write on (source_id, url)
// ---------------------------------------------------------------------------

async function isDupe(
  supabase: ReturnType<typeof createClient>,
  sourceId: string,
  url: string | null,
  externalId: string | null
): Promise<boolean> {
  if (!url && !externalId) return false;

  if (url) {
    const { data } = await supabase
      .from("content_items")
      .select("id")
      .eq("source_id", sourceId)
      .eq("url", url)
      .maybeSingle();
    if (data) return true;
  }

  if (externalId) {
    const { data } = await supabase
      .from("content_items")
      .select("id")
      .eq("source_id", sourceId)
      .eq("external_id", externalId)
      .maybeSingle();
    if (data) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Auto-archive expired event items for a source
// ---------------------------------------------------------------------------

async function autoArchiveExpiredEvents(
  supabase: ReturnType<typeof createClient>,
  sourceId: string
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const { data, error } = await supabase
    .from("content_items")
    .update({ approval_status: "archived", updated_at: new Date().toISOString() })
    .eq("source_id", sourceId)
    .eq("content_type", "event")
    .in("approval_status", ["pending", "auto_approved", "approved"])
    .lt("source_date", toISODate(cutoff))
    .select("id");

  if (error) {
    console.error("auto-archive error:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

// ---------------------------------------------------------------------------
// Failure tracking helpers
// ---------------------------------------------------------------------------

async function recordSuccess(
  supabase: ReturnType<typeof createClient>,
  sourceId: string
): Promise<void> {
  await supabase
    .from("content_sources")
    .update({
      consecutive_failures: 0,
      last_fetched_at: new Date().toISOString(),
      last_successful_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId);
}

async function recordFailure(
  supabase: ReturnType<typeof createClient>,
  sourceId: string,
  currentFailures: number
): Promise<string | null> {
  const newCount = currentFailures + 1;
  await supabase
    .from("content_sources")
    .update({
      consecutive_failures: newCount,
      last_fetched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId);

  if (newCount >= 2) {
    return `ALERT: source ${sourceId} has failed ${newCount} consecutive times. Manual review required.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-source sync handlers
// ---------------------------------------------------------------------------

/**
 * syncLocalistRSS — handles ALL rss_poll sources:
 *   - morehouse_events (Localist, events.morehouse.edu/calendar/1.xml)
 *   - morehouse_news   (HubSpot RSS, news.morehouse.edu/rss.xml)
 * content_type is inferred from source.platform.
 * approval_status follows the auto-approve rule above.
 */
async function syncLocalistRSS(
  supabase: ReturnType<typeof createClient>,
  source: ContentSource,
  fetchUrl: string
): Promise<SyncResult> {
  const result: SyncResult = {
    source_id: source.id,
    source_name: source.source_name,
    fetched: 0,
    inserted: 0,
    skipped_dupe: 0,
    archived: 0,
    error: null,
    alert: null,
  };

  try {
    const resp = await fetch(fetchUrl, {
      headers: { "User-Agent": "MCAAlumni-ContentSync/1.0" },
    });

    if (!resp.ok) {
      result.error = `HTTP ${resp.status} from ${fetchUrl}`;
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const xmlText = await resp.text();
    const items = parseRSSText(xmlText);
    result.fetched = items.length;

    if (items.length === 0) {
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const nowISO = new Date().toISOString();

    for (const item of items) {
      const url = item.link || null;
      const externalId = item.guid || null;

      if (await isDupe(supabase, source.id, url, externalId)) {
        result.skipped_dupe++;
        continue;
      }

      const rawText = [item.title, item.description].filter(Boolean).join(" ");
      const { relevance, tags } = scoreRelevance(rawText);
      const summaryText = excerpt(item.description);

      // Parse pubDate
      let sourceDate: string | null = null;
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        if (!isNaN(d.getTime())) sourceDate = toISODate(d);
      }

      // Derive content_type from platform so news items land as 'news',
      // not 'event'. schema.org NewsArticle applies to morehouse_news items.
      const contentType: ContentType =
        source.platform === "morehouse_news" ? "news" : "event";

      const newItem: NewContentItem = {
        source_id: source.id,
        external_id: externalId,
        title: item.title ? item.title.replace(/<[^>]+>/g, "").trim() : null,
        summary: summaryText
          ? summaryText + (source.source_name ? ` — ${source.source_name}` : "")
          : null,
        url,
        source_url: source.source_url,
        source_platform: source.platform,
        source_date: sourceDate,
        relevance_tags: tags,
        chicago_relevance: relevance,
        content_type: contentType,
        image_url: item.imageUrl,
        // Auto-approve general-relevance news/events; keep direct/adjacent pending
        // for the board queue. NO model call — pure platform+relevance rule.
        approval_status: resolveApprovalStatus(source.platform, relevance),
        fetched_at: nowISO,
      };

      const { error: insertErr } = await supabase
        .from("content_items")
        .insert(newItem);

      if (insertErr) {
        // Unique constraint violation = race-condition dupe; skip silently
        if (insertErr.code !== "23505") {
          console.error("insert error:", insertErr.message);
        }
      } else {
        result.inserted++;
      }
    }

    // Auto-archive expired event items
    result.archived = await autoArchiveExpiredEvents(supabase, source.id);

    await recordSuccess(supabase, source.id);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
  }

  return result;
}

async function syncNewsHTML(
  supabase: ReturnType<typeof createClient>,
  source: ContentSource,
  fetchUrl: string
): Promise<SyncResult> {
  const result: SyncResult = {
    source_id: source.id,
    source_name: source.source_name,
    fetched: 0,
    inserted: 0,
    skipped_dupe: 0,
    archived: 0,
    error: null,
    alert: null,
  };

  try {
    const resp = await fetch(fetchUrl, {
      headers: { "User-Agent": "MCAAlumni-ContentSync/1.0" },
    });

    if (!resp.ok) {
      result.error = `HTTP ${resp.status} from ${fetchUrl}`;
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const html = await resp.text();
    const baseUrl = new URL(fetchUrl).origin;
    const items = parseNewsHTML(html, baseUrl);
    result.fetched = items.length;

    // Alert on 2 consecutive 0-item fetches (per §8 spec)
    if (items.length === 0) {
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const nowISO = new Date().toISOString();

    for (const item of items) {
      const url = item.link || null;

      if (await isDupe(supabase, source.id, url, null)) {
        result.skipped_dupe++;
        continue;
      }

      const rawText = [item.title, item.summary].filter(Boolean).join(" ");
      const { relevance, tags } = scoreRelevance(rawText);

      let sourceDate: string | null = null;
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        if (!isNaN(d.getTime())) sourceDate = toISODate(d);
      }

      const summaryText = excerpt(item.summary);

      const newItem: NewContentItem = {
        source_id: source.id,
        external_id: null,
        title: item.title,
        summary: summaryText
          ? summaryText + " — Morehouse College News"
          : null,
        url,
        source_url: source.source_url,
        source_platform: source.platform,
        source_date: sourceDate,
        relevance_tags: tags,
        chicago_relevance: relevance,
        content_type: "news",
        image_url: item.imageUrl,
        approval_status: "pending",
        fetched_at: nowISO,
      };

      const { error: insertErr } = await supabase
        .from("content_items")
        .insert(newItem);

      if (insertErr) {
        if (insertErr.code !== "23505") {
          console.error("insert error:", insertErr.message);
        }
      } else {
        result.inserted++;
      }
    }

    await recordSuccess(supabase, source.id);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
  }

  return result;
}

async function syncSitemapDiff(
  supabase: ReturnType<typeof createClient>,
  source: ContentSource,
  fetchUrl: string
): Promise<SyncResult> {
  const result: SyncResult = {
    source_id: source.id,
    source_name: source.source_name,
    fetched: 0,
    inserted: 0,
    skipped_dupe: 0,
    archived: 0,
    error: null,
    alert: null,
  };

  try {
    const resp = await fetch(fetchUrl, {
      headers: { "User-Agent": "MCAAlumni-ContentSync/1.0" },
    });

    if (!resp.ok) {
      result.error = `HTTP ${resp.status} from ${fetchUrl}`;
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const xmlText = await resp.text();
    const allEntries = parseSitemapXML(xmlText);

    // Pattern filter: only content-like URLs
    const contentEntries = allEntries.filter((e) =>
      isSitemapContentUrl(e.url)
    );
    result.fetched = contentEntries.length;

    if (contentEntries.length === 0) {
      result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
      return result;
    }

    const nowISO = new Date().toISOString();

    for (const entry of contentEntries) {
      if (await isDupe(supabase, source.id, entry.url, null)) {
        result.skipped_dupe++;
        continue;
      }

      const { relevance, tags } = scoreRelevance(entry.url);

      let sourceDate: string | null = null;
      if (entry.lastmod) {
        const d = new Date(entry.lastmod);
        if (!isNaN(d.getTime())) sourceDate = toISODate(d);
      }

      // Extract a title from URL path as best-effort
      const pathParts = new URL(entry.url).pathname
        .split("/")
        .filter(Boolean);
      const slugTitle = pathParts[pathParts.length - 1]
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || null;

      const newItem: NewContentItem = {
        source_id: source.id,
        external_id: null,
        title: slugTitle,
        summary: "Discovered via morehouse.edu sitemap — review and update summary before approving.",
        url: entry.url,
        source_url: source.source_url,
        source_platform: source.platform,
        source_date: sourceDate,
        relevance_tags: tags,
        chicago_relevance: relevance,
        content_type: "institutional",
        image_url: null,
        approval_status: "pending",
        fetched_at: nowISO,
      };

      const { error: insertErr } = await supabase
        .from("content_items")
        .insert(newItem);

      if (insertErr) {
        if (insertErr.code !== "23505") {
          console.error("insert error:", insertErr.message);
        }
      } else {
        result.inserted++;
      }
    }

    await recordSuccess(supabase, source.id);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    result.alert = await recordFailure(supabase, source.id, source.consecutive_failures);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

interface SyncRequest {
  source_id?: string; // if set, run only that source; else run all active auto sources
}

function validateRequest(body: unknown): SyncRequest {
  if (body === null || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;
  const req: SyncRequest = {};
  if (typeof b.source_id === "string" && b.source_id.length > 0) {
    req.source_id = b.source_id;
  }
  return req;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Read secrets from environment (never from client)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse + validate body
  let bodyRaw: unknown = {};
  try {
    const text = await req.text();
    if (text.trim()) bodyRaw = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const syncReq = validateRequest(bodyRaw);

  // Build service-role client (edge function only — never shipped to client)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Load active sources (excluding requires_auth = manual-only sources)
  let query = supabase
    .from("content_sources")
    .select("*")
    .eq("active", true)
    .eq("requires_auth", false)
    .in("fetch_method", ["rss_poll", "html_parse", "sitemap_diff"]);

  if (syncReq.source_id) {
    query = query.eq("id", syncReq.source_id);
  }

  const { data: sources, error: sourcesErr } = await query;

  if (sourcesErr) {
    return new Response(
      JSON.stringify({ error: "Failed to load sources: " + sourcesErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const results: SyncResult[] = [];
  const alerts: string[] = [];

  for (const source of (sources as ContentSource[]) ?? []) {
    const fetchUrl = source.api_url ?? source.source_url;
    let result: SyncResult;

    if (source.fetch_method === "rss_poll") {
      // Handles morehouse_news (news.morehouse.edu/rss.xml, HubSpot RSS) AND
      // morehouse_events (events.morehouse.edu/calendar/1.xml, Localist RSS).
      // content_type and approval_status are inferred inside syncLocalistRSS
      // from source.platform. No HTML parse for morehouse_news — the verified
      // RSS feed makes the fragile HTML parse path unnecessary.
      result = await syncLocalistRSS(supabase, source, fetchUrl);
    } else if (source.fetch_method === "html_parse") {
      result = await syncNewsHTML(supabase, source, fetchUrl);
    } else if (source.fetch_method === "sitemap_diff") {
      result = await syncSitemapDiff(supabase, source, fetchUrl);
    } else {
      result = {
        source_id: source.id,
        source_name: source.source_name,
        fetched: 0,
        inserted: 0,
        skipped_dupe: 0,
        archived: 0,
        error: `Unhandled fetch_method: ${source.fetch_method}`,
        alert: null,
      };
    }

    results.push(result);
    if (result.alert) alerts.push(result.alert);
  }

  const summary = {
    run_at: new Date().toISOString(),
    sources_processed: results.length,
    total_inserted: results.reduce((s, r) => s + r.inserted, 0),
    total_skipped: results.reduce((s, r) => s + r.skipped_dupe, 0),
    total_archived: results.reduce((s, r) => s + r.archived, 0),
    alerts,
    results,
  };

  console.log("content-sync complete:", JSON.stringify(summary));

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

#!/usr/bin/env node
/**
 * deploy-news-ingest.js -- RSS + One structured News API -> Supabase ingest_items
 *
 * Trigger: Every 60 min
 * Inputs:
 *  - RSS sources from config/rss-sources.md (subset; n8n pulls directly)
 *  - One structured News API (multiple forms):
 *      - /top-headlines
 *      - /everything
 *      - /sources
 *
 * Output: Upsert into public.ingest_items (dedupe by content_hash)
 *
 * Requirements:
 *  - NEWS_API_BASE_URL (e.g. https://newsapi.org/v2)
 *  - NEWS_API_KEY
 *  - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or ANON for dev)
 */
'use strict';

const crypto = require('crypto');
const { api, env } = require('./load-env');

function sha1(s) {
  return crypto.createHash('sha1').update(String(s || '')).digest('hex');
}

function buildWorkflow() {
  const prefix = 'ap-ingest';
  const newsBase = '{{ $env.NEWS_API_BASE_URL }}';
  const newsKey = '{{ $env.NEWS_API_KEY }}';

  return {
    name: 'Asset Persona -- News Ingest (RSS + News API)',
    nodes: [
      {
        parameters: {
          rule: { interval: [{ field: 'cronExpression', expression: '0 * * * *' }] },
        },
        id: `${prefix}-trigger`,
        name: 'Every Hour',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [0, 400],
      },

      // ---- RSS pulls (examples; extend by copying nodes) ----
      {
        parameters: { method: 'GET', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', options: { timeout: 15000 } },
        id: `${prefix}-rss-tc`,
        name: 'RSS: TechCrunch AI',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 200],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://venturebeat.com/category/ai/feed/', options: { timeout: 15000 } },
        id: `${prefix}-rss-vb`,
        name: 'RSS: VentureBeat AI',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 350],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://news.google.com/rss/search?q=artificial+intelligence+education+OR+ai+tutoring&hl=en-US&gl=US&ceid=US:en', options: { timeout: 15000 } },
        id: `${prefix}-rss-edu`,
        name: 'RSS: AI Education (Google News)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 500],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://news.google.com/rss/search?q=ai+finance+OR+fraud+detection+OR+algorithmic+trading&hl=en-US&gl=US&ceid=US:en', options: { timeout: 15000 } },
        id: `${prefix}-rss-fin`,
        name: 'RSS: AI Finance (Google News)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 650],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://news.google.com/rss/search?q=ai+healthcare+OR+medical+imaging+ai+OR+drug+discovery+ai&hl=en-US&gl=US&ceid=US:en', options: { timeout: 15000 } },
        id: `${prefix}-rss-health`,
        name: 'RSS: AI Health (Google News)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 800],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://news.google.com/rss/search?q=ai+public+health+OR+epidemiology+ai+OR+disease+surveillance+ai&hl=en-US&gl=US&ceid=US:en', options: { timeout: 15000 } },
        id: `${prefix}-rss-ph`,
        name: 'RSS: AI Public Health (Google News)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 950],
        onError: 'continueRegularOutput',
      },
      {
        parameters: { method: 'GET', url: 'https://news.google.com/rss/search?q=ai+dentistry+OR+dental+imaging+ai+OR+caries+detection+ai&hl=en-US&gl=US&ceid=US:en', options: { timeout: 15000 } },
        id: `${prefix}-rss-dent`,
        name: 'RSS: AI Dentistry (Google News)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 1100],
        onError: 'continueRegularOutput',
      },

      // ---- Structured News API (multiple forms) ----
      {
        parameters: {
          method: 'GET',
          url: `={{ ${newsBase} + "/top-headlines?language=en&pageSize=25&q=artificial%20intelligence" + "&apiKey=" + ${newsKey} }}`,
          options: { timeout: 15000 },
        },
        id: `${prefix}-news-top`,
        name: 'News API: Top Headlines (AI)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 1280],
        onError: 'continueRegularOutput',
      },
      {
        parameters: {
          method: 'GET',
          url: `={{ ${newsBase} + "/everything?language=en&pageSize=25&sortBy=publishedAt&q=ai%20education%20OR%20ai%20tutoring" + "&apiKey=" + ${newsKey} }}`,
          options: { timeout: 15000 },
        },
        id: `${prefix}-news-edu`,
        name: 'News API: Everything (AI Education)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 1430],
        onError: 'continueRegularOutput',
      },
      {
        parameters: {
          method: 'GET',
          url: `={{ ${newsBase} + "/everything?language=en&pageSize=25&sortBy=publishedAt&q=ai%20finance%20OR%20fraud%20detection" + "&apiKey=" + ${newsKey} }}`,
          options: { timeout: 15000 },
        },
        id: `${prefix}-news-fin`,
        name: 'News API: Everything (AI Finance)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 1580],
        onError: 'continueRegularOutput',
      },
      {
        parameters: {
          method: 'GET',
          url: `={{ ${newsBase} + "/sources?language=en&category=technology" + "&apiKey=" + ${newsKey} }}`,
          options: { timeout: 15000 },
        },
        id: `${prefix}-news-sources`,
        name: 'News API: Sources',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 1730],
        onError: 'continueRegularOutput',
      },

      // ---- Normalize all inputs to ingest_items rows ----
      {
        parameters: {
          jsCode: `
function parseRss(xml, sourceName, categoryHint, sourceUrl) {
  const items = [];
  const str = typeof xml === 'string' ? xml : JSON.stringify(xml);
  const blocks = str.match(/<item>[\\s\\S]*?<\\/item>/g) || [];
  for (const b of blocks.slice(0, 25)) {
    const title = (b.match(/<title>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/title>/) || [])[1]?.trim();
    const link = (b.match(/<link>([\\s\\S]*?)<\\/link>/) || [])[1]?.trim();
    const pub = (b.match(/<pubDate>([\\s\\S]*?)<\\/pubDate>/) || [])[1]?.trim();
    if (!title || !link) continue;
    items.push({
      source_type: 'rss',
      source_name: sourceName,
      source_url: sourceUrl || null,
      item_url: link,
      title,
      summary: null,
      published_at: pub ? new Date(pub).toISOString() : null,
      category_hint: categoryHint || null,
      raw: { rss: true }
    });
  }
  return items;
}

function parseNewsApi(resp, sourceName, categoryHint, sourceUrl) {
  const items = [];
  const j = resp || {};
  const articles = Array.isArray(j.articles) ? j.articles : [];
  for (const a of articles.slice(0, 25)) {
    if (!a || !a.title || !a.url) continue;
    items.push({
      source_type: 'api',
      source_name: sourceName,
      source_url: sourceUrl || null,
      item_url: a.url,
      title: a.title,
      summary: a.description || null,
      published_at: a.publishedAt || null,
      category_hint: categoryHint || null,
      raw: a
    });
  }
  return items;
}

const out = [];

// RSS nodes
const rss = [
  ['RSS: TechCrunch AI', 'TechCrunch', 'ai_ml', 'https://techcrunch.com/category/artificial-intelligence/feed/'],
  ['RSS: VentureBeat AI', 'VentureBeat', 'ai_ml', 'https://venturebeat.com/category/ai/feed/'],
  ['RSS: AI Education (Google News)', 'Google News', 'ai_education', null],
  ['RSS: AI Finance (Google News)', 'Google News', 'ai_finance', null],
  ['RSS: AI Health (Google News)', 'Google News', 'ai_health', null],
  ['RSS: AI Public Health (Google News)', 'Google News', 'ai_public_health', null],
  ['RSS: AI Dentistry (Google News)', 'Google News', 'ai_dentistry', null],
];

for (const [nodeName, sourceName, hint, srcUrl] of rss) {
  try {
    const data = $(nodeName).first().json;
    const xml = data?.data || JSON.stringify(data);
    out.push(...parseRss(xml, sourceName, hint, srcUrl));
  } catch (_) {}
}

// News API nodes
try { out.push(...parseNewsApi($('News API: Top Headlines (AI)').first().json, 'News API', 'ai_ml')); } catch (_) {}
try { out.push(...parseNewsApi($('News API: Everything (AI Education)').first().json, 'News API', 'ai_education')); } catch (_) {}
try { out.push(...parseNewsApi($('News API: Everything (AI Finance)').first().json, 'News API', 'ai_finance')); } catch (_) {}

// Dedup in-memory by URL
const seen = new Set();
const rows = [];
for (const it of out) {
  const url = (it.item_url || '').trim();
  if (!url || seen.has(url)) continue;
  seen.add(url);
  rows.push({ ...it, content_hash: '' });
}

// Create deterministic hash (url + title) without require()
function sha1Like(str) {
  // Not cryptographic. Stable enough for dedupe + unique index collisions are unlikely.
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 16)) >>> 0;
  return (h1.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0'));
}

for (const r of rows) {
  const key = (r.item_url || '') + '|' + (r.title || '');
  r.content_hash = sha1Like(key);
}

return rows.map(r => ({ json: r }));
`.trim(),
        },
        id: `${prefix}-norm`,
        name: 'Normalize Items',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [600, 400],
      },

      // ---- Upsert to Supabase (ingest_items) ----
      {
        parameters: {
          method: 'POST',
          url: '={{ $env.SUPABASE_URL }}/rest/v1/ingest_items',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'apikey', value: '={{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Authorization', value: '=Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Prefer', value: 'resolution=ignore-duplicates,return=minimal' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify($json) }}',
          options: { timeout: 15000 },
        },
        id: `${prefix}-upsert`,
        name: 'Upsert ingest_items',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [850, 400],
        onError: 'continueErrorOutput',
      },
    ],
    connections: {
      'Every Hour': { main: [[
        { node: 'RSS: TechCrunch AI', type: 'main', index: 0 },
        { node: 'RSS: VentureBeat AI', type: 'main', index: 0 },
        { node: 'RSS: AI Education (Google News)', type: 'main', index: 0 },
        { node: 'RSS: AI Finance (Google News)', type: 'main', index: 0 },
        { node: 'RSS: AI Health (Google News)', type: 'main', index: 0 },
        { node: 'RSS: AI Public Health (Google News)', type: 'main', index: 0 },
        { node: 'RSS: AI Dentistry (Google News)', type: 'main', index: 0 },
        { node: 'News API: Top Headlines (AI)', type: 'main', index: 0 },
        { node: 'News API: Everything (AI Education)', type: 'main', index: 0 },
        { node: 'News API: Everything (AI Finance)', type: 'main', index: 0 },
        { node: 'News API: Sources', type: 'main', index: 0 },
      ]]},
      'RSS: TechCrunch AI': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: VentureBeat AI': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: AI Education (Google News)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: AI Finance (Google News)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: AI Health (Google News)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: AI Public Health (Google News)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'RSS: AI Dentistry (Google News)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'News API: Top Headlines (AI)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'News API: Everything (AI Education)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'News API: Everything (AI Finance)': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'News API: Sources': { main: [[ { node: 'Normalize Items', type: 'main', index: 0 } ]] },
      'Normalize Items': { main: [[ { node: 'Upsert ingest_items', type: 'main', index: 0 } ]] },
    },
    settings: { executionOrder: 'v1', timezone: 'America/Chicago' },
  };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const workflow = buildWorkflow();

  console.log('Deploying: ' + workflow.name);
  console.log('Nodes: ' + workflow.nodes.length);
  console.log('Trigger: hourly');
  console.log('Output: Supabase ingest_items');
  console.log('Requires: NEWS_API_BASE_URL + NEWS_API_KEY');

  if (isDryRun) {
    console.log('\n[DRY RUN] Workflow JSON:\n');
    console.log(JSON.stringify(workflow, null, 2));
    return workflow;
  }

  try {
    const result = await api('POST', '/api/v1/workflows', workflow);
    if (result && result.id) {
      console.log('Created: ' + result.name + ' (' + result.id + ')');
      const act = await api('PATCH', '/api/v1/workflows/' + result.id, { active: true });
      console.log('Activated:', act && act.active !== undefined ? act.active : '(check UI)');
    } else {
      console.log('Error creating workflow:', JSON.stringify(result).slice(0, 400));
    }
  } catch (e) {
    console.error('Deploy failed:', e.message);
  }

  return workflow;
}

if (require.main === module) main();
module.exports = { main, buildWorkflow };


#!/usr/bin/env node
/**
 * validate-tokens.js -- Multi-platform token validator for Asset Persona.
 * Pings each API's verify endpoint and reports a color-coded status table.
 *
 * Run: node validate-tokens.js
 * Exit: 0 = all configured tokens valid, 1 = at least one failure.
 *
 * No npm dependencies. Uses node:https and node:http only.
 */
'use strict';

const https = require('https');
const http = require('http');
const { env, KEYS, N8N_URL, N8N_HOST, N8N_PORT, N8N_API_KEY } = require('./load-env');

const TIMEOUT_MS = 15000;
const META_API_VERSION = 'v25.0';

// -- HTTP helpers ----------------------------------------------------------

function request(opts, body) {
  const lib = opts.port === 443 || opts.protocol === 'https:' ? https : http;
  delete opts.protocol;
  return new Promise((resolve) => {
    const req = lib.request(
      { timeout: TIMEOUT_MS, ...opts },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(data); } catch (_) { /* raw */ }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        });
      }
    );
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

function urlToOpts(urlStr, method, extraHeaders) {
  const u = new URL(urlStr);
  return {
    method: method || 'GET',
    hostname: u.hostname,
    port: parseInt(u.port || (u.protocol === 'https:' ? '443' : '80'), 10),
    path: u.pathname + u.search,
    protocol: u.protocol,
    headers: { 'User-Agent': 'assetpersona-validator/1.0', ...(extraHeaders || {}) },
  };
}

function fetchUrl(urlStr, method, headers) {
  return request(urlToOpts(urlStr, method, headers));
}

// -- Individual checks -----------------------------------------------------

async function checkN8n() {
  if (!N8N_API_KEY) return { status: 'SKIP', detail: 'N8N_API_KEY not set' };
  try {
    const r = await request({
      hostname: N8N_HOST,
      port: N8N_PORT,
      path: '/api/v1/workflows?limit=1',
      method: 'GET',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });
    if (r.status === 200) {
      const count = r.body && r.body.data ? r.body.data.length : '?';
      return { status: 'OK', detail: `Connected to ${N8N_URL} (${count} workflows found)` };
    }
    return { status: 'FAIL', detail: `HTTP ${r.status}: ${r.error || r.raw?.slice(0, 80) || 'unknown'}` };
  } catch (e) {
    return { status: 'FAIL', detail: e.message };
  }
}

async function checkGemini() {
  const key = KEYS.GEMINI_API_KEY;
  if (!key) return { status: 'SKIP', detail: 'GEMINI_API_KEY not set' };

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
  const r = await fetchUrl(url);
  if (r.status === 200 && r.body && r.body.models) {
    return { status: 'OK', detail: `${r.body.models.length} models available` };
  }
  const errMsg = r.body && r.body.error ? `${r.body.error.code}: ${r.body.error.message}` : (r.error || `HTTP ${r.status}`);
  return { status: 'FAIL', detail: errMsg };
}

async function checkLinkedIn() {
  const token = KEYS.LINKEDIN_ACCESS_TOKEN;
  if (!token) return { status: 'SKIP', detail: 'LINKEDIN_ACCESS_TOKEN not set' };

  const r = await fetchUrl('https://api.linkedin.com/v2/userinfo', 'GET', {
    Authorization: `Bearer ${token}`,
  });
  if (r.status === 200 && r.body && r.body.sub) {
    return { status: 'OK', detail: `${r.body.name || r.body.sub} (sub=${r.body.sub})` };
  }
  if (r.status === 401 || r.status === 403) {
    const msg = r.body && r.body.message ? r.body.message : `HTTP ${r.status}`;
    return { status: 'FAIL', detail: `${msg} -- ensure openid+profile scopes are granted` };
  }
  const errMsg = r.body && r.body.message ? r.body.message : (r.error || `HTTP ${r.status}`);
  return { status: 'FAIL', detail: errMsg };
}

async function checkThreads() {
  const userId = KEYS.THREADS_USER_ID;
  const token = KEYS.THREADS_ACCESS_TOKEN;
  if (!userId || !token) return { status: 'SKIP', detail: 'THREADS_USER_ID or THREADS_ACCESS_TOKEN not set' };

  const url = `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${encodeURIComponent(token)}`;
  const r = await fetchUrl(url);
  if (r.status === 200 && r.body && r.body.id) {
    const match = String(r.body.id) === String(userId);
    if (!match) {
      return { status: 'FAIL', detail: `Token authed as id=${r.body.id} but THREADS_USER_ID=${userId} -- mismatch` };
    }
    return { status: 'OK', detail: `@${r.body.username || '?'} (id=${r.body.id})` };
  }
  const errMsg = r.body && r.body.error ? `${r.body.error.code}: ${r.body.error.message}` : (r.error || `HTTP ${r.status}`);
  return { status: 'FAIL', detail: errMsg };
}

async function checkInstagram() {
  const igId = KEYS.INSTAGRAM_BUSINESS_ID;
  const token = KEYS.INSTAGRAM_ACCESS_TOKEN || KEYS.FACEBOOK_PAGE_TOKEN;
  if (!igId || !token) return { status: 'SKIP', detail: 'INSTAGRAM_BUSINESS_ID or token not set' };

  const url = `https://graph.facebook.com/${META_API_VERSION}/${encodeURIComponent(igId)}?fields=id,username&access_token=${encodeURIComponent(token)}`;
  const r = await fetchUrl(url);
  if (r.status === 200 && r.body && r.body.id) {
    return { status: 'OK', detail: `@${r.body.username || '?'} (id=${r.body.id})` };
  }
  const errMsg = r.body && r.body.error ? `${r.body.error.code}: ${r.body.error.message}` : (r.error || `HTTP ${r.status}`);
  return { status: 'FAIL', detail: errMsg };
}

async function checkFacebook() {
  const pageId = KEYS.FACEBOOK_PAGE_ID;
  const token = KEYS.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) return { status: 'SKIP', detail: 'FACEBOOK_PAGE_ID or FACEBOOK_PAGE_TOKEN not set' };

  const url = `https://graph.facebook.com/${META_API_VERSION}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(token)}`;
  const r = await fetchUrl(url);
  if (r.status === 200 && r.body && r.body.id) {
    return { status: 'OK', detail: `${r.body.name || 'page'} (id=${r.body.id})` };
  }
  const errMsg = r.body && r.body.error ? `${r.body.error.code}: ${r.body.error.message}` : (r.error || `HTTP ${r.status}`);
  return { status: 'FAIL', detail: errMsg };
}

async function checkFacebookTokenExpiry() {
  const token = KEYS.FACEBOOK_PAGE_TOKEN;
  if (!token) return { status: 'SKIP', detail: 'FACEBOOK_PAGE_TOKEN not set' };

  const url = `https://graph.facebook.com/${META_API_VERSION}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`;
  const r = await fetchUrl(url);
  if (r.status === 200 && r.body && r.body.data) {
    const d = r.body.data;
    if (d.expires_at === 0 || d.expires_at == null) {
      return { status: 'OK', detail: 'Never expires (long-lived page token)' };
    }
    const date = new Date(d.expires_at * 1000).toISOString().slice(0, 10);
    const now = Date.now() / 1000;
    if (d.expires_at < now) {
      return { status: 'FAIL', detail: `Token EXPIRED on ${date} -- regenerate immediately` };
    }
    const daysLeft = Math.round((d.expires_at - now) / 86400);
    if (daysLeft < 7) {
      return { status: 'FAIL', detail: `Token expires in ${daysLeft} days (${date}) -- refresh soon` };
    }
    return { status: 'OK', detail: `Expires ${date} (${daysLeft} days remaining)` };
  }
  return { status: 'SKIP', detail: 'debug_token call failed; primary check is authoritative' };
}

async function checkSupabase() {
  const url = KEYS.SUPABASE_URL;
  const key = KEYS.SUPABASE_ANON_KEY;
  if (!url || !key) return { status: 'SKIP', detail: 'SUPABASE_URL or SUPABASE_ANON_KEY not set' };

  // Ping the REST API healthcheck
  const r = await fetchUrl(`${url}/rest/v1/posts?select=id&limit=1`, 'GET', {
    apikey: key,
    Authorization: `Bearer ${key}`,
  });
  if (r.status === 200) {
    return { status: 'OK', detail: `Connected to ${url.replace('https://', '').split('.')[0]}` };
  }
  return { status: 'FAIL', detail: `HTTP ${r.status}: ${r.error || r.raw?.slice(0, 80) || 'unknown'}` };
}

// -- Output helpers --------------------------------------------------------

function color(status) {
  if (status === 'OK')   return '\x1b[32m[OK]\x1b[0m';
  if (status === 'FAIL') return '\x1b[31m[FAIL]\x1b[0m';
  return '\x1b[33m[SKIP]\x1b[0m';
}

function truncate(s, n) {
  return s && s.length > n ? s.slice(0, n - 1) + '...' : s;
}

// -- Main ------------------------------------------------------------------

async function main() {
  console.log('\nAsset Persona Content Engine -- Token Validator');
  console.log('=================================================\n');

  const checks = [
    ['n8n API',                 checkN8n],
    ['Gemini (Google AI)',      checkGemini],
    ['LinkedIn',                checkLinkedIn],
    ['Threads',                 checkThreads],
    ['Instagram',               checkInstagram],
    ['Facebook Page',           checkFacebook],
    ['Facebook Token (TTL)',    checkFacebookTokenExpiry],
    ['Supabase',                checkSupabase],
  ];

  const results = [];
  for (const [name, fn] of checks) {
    process.stdout.write(`Checking ${name.padEnd(24)} ... `);
    let result;
    try {
      result = await fn();
    } catch (e) {
      result = { status: 'FAIL', detail: `unexpected: ${e.message}` };
    }
    results.push({ name, ...result });
    console.log(color(result.status));
  }

  // Summary table
  console.log('\n');
  console.log('Service                  | Status  | Detail');
  console.log('-------------------------+---------+--------------------------------------------------');
  for (const r of results) {
    const badge = r.status === 'OK'
      ? '\x1b[32m OK  \x1b[0m '
      : r.status === 'FAIL'
        ? '\x1b[31m FAIL\x1b[0m '
        : '\x1b[33m SKIP\x1b[0m ';
    console.log(`${r.name.padEnd(24)} | ${badge} | ${truncate(r.detail || '', 50)}`);
  }

  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const okCount   = results.filter((r) => r.status === 'OK').length;
  const skipCount = results.filter((r) => r.status === 'SKIP').length;
  console.log(`\n${okCount} OK, ${failCount} FAIL, ${skipCount} SKIP\n`);

  if (failCount > 0) {
    console.log('Fix failures before deploying. See config/credential-setup.md for details.');
    process.exit(1);
  } else if (okCount === 0) {
    console.log('No tokens configured. Fill in .env.local and re-run.');
    process.exit(1);
  } else {
    console.log('All configured tokens are valid. Ready to deploy.');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((e) => { console.error('\nValidator crashed:', e); process.exit(1); });
}
module.exports = { main };

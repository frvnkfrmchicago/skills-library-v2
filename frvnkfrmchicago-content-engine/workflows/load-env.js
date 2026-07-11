/**
 * load-env.js -- Shared config loader for Asset Persona deploy scripts.
 * Reads .env or .env.local and exposes n8n API helpers.
 * Usage: const { api, HOST, PORT, env } = require('./load-env');
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

function loadEnv() {
  const candidates = ['.env.local', '.env'];
  for (const name of candidates) {
    const fp = path.join(__dirname, '..', name);
    if (fs.existsSync(fp)) {
      const lines = fs.readFileSync(fp, 'utf8').split('\n');
      const env = {};
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        env[key] = val;
        if (!process.env[key]) process.env[key] = val;
      }
      return env;
    }
  }
  console.error('ERROR: No .env or .env.local found. Copy .env.example to .env.local and fill in your values.');
  process.exit(1);
}

const env = loadEnv();

const HOST = env.N8N_HOST || '34.134.195.104';
const PORT = parseInt(env.N8N_PORT || '5678', 10);
const API_KEY = env.N8N_API_KEY;

if (!API_KEY) {
  console.error('ERROR: N8N_API_KEY is empty in your .env.local file.');
  process.exit(1);
}

function api(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: HOST, port: PORT, path: apiPath, method, timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d.slice(0, 300) }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const KEYS = env;
const N8N_URL = `http://${HOST}:${PORT}`;
const N8N_HOST = HOST;
const N8N_PORT = PORT;
const N8N_API_KEY = API_KEY;

module.exports = { api, HOST, PORT, API_KEY, env, KEYS, N8N_URL, N8N_HOST, N8N_PORT, N8N_API_KEY };


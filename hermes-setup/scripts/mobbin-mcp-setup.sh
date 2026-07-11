#!/usr/bin/env bash
# Sync Mobbin login from Antigravity Chrome → ~/.mobbin-mcp/auth.json and verify MCP.
set -euo pipefail

HERMES_AGENT="${HOME}/.hermes/hermes-agent"
VENV_PY="${HERMES_AGENT}/venv/bin/python"
MOBBIN_PKG="${HOME}/.npm/_npx/08be632c9fab3176/node_modules/mobbin-mcp/dist"

if [[ ! -x "$VENV_PY" ]]; then
  echo "Hermes venv not found at $VENV_PY"
  exit 1
fi

if ! curl -sf "http://127.0.0.1:9222/json/version" >/dev/null 2>&1; then
  echo "Chrome CDP not on 9222. Start Antigravity-style Chrome first."
  exit 1
fi

COOKIE_FILE=$(mktemp)
"$VENV_PY" <<'PY' >"$COOKIE_FILE"
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    for ctx in browser.contexts:
        for page in ctx.pages:
            url = page.url or ""
            if url.startswith("https://mobbin.com"):
                cookie = page.evaluate("document.cookie")
                if cookie and "sb-ujasntkfphywizsdaapi-auth-token" in cookie:
                    print(cookie, end="")
                    raise SystemExit(0)
raise SystemExit("Open https://mobbin.com in that Chrome and log in, then rerun.")
PY

node --input-type=module <<EOF
import { readFileSync } from 'node:fs';
import { MobbinAuth } from 'file://${MOBBIN_PKG}/services/auth.js';
import { writeStoredSession } from 'file://${MOBBIN_PKG}/utils/auth-store.js';
const cookie = readFileSync('${COOKIE_FILE}', 'utf8').trim();
writeStoredSession(MobbinAuth.fromCookie(cookie).getSession());
console.log('Wrote ~/.mobbin-mcp/auth.json');
EOF
rm -f "$COOKIE_FILE"

cd "$HERMES_AGENT"
HERMES_PROFILE=adimeadozen "$VENV_PY" -m hermes_cli.main mcp test mobbin | tail -15

echo ""
echo "Next in Hermes Desktop:"
echo "  1. Quit Hermes (Cmd+Q)"
echo "  2. Reopen Hermes"
echo "  3. Open your design chat (or /new for a fresh chat)"
echo "  4. Settings → MCP → Reload MCP  (do NOT use /reload-mcp — blocked in your app build)"
echo "  5. Ask: mobbin_quick_search for Sunlitt"

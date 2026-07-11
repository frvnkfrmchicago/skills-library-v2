#!/usr/bin/env bash
# Headed Chrome on CDP 9222 — matches Antigravity's intended browser (visible window).
# Profile: ~/.gemini/antigravity-browser-profile (same as Antigravity browser subagent).
# Hermes browser.cdp_url can share this port once this Chrome owns 9222.
set -euo pipefail

PORT="${CHROME_DEBUG_PORT:-9222}"
# Always use Frank's real home — Hermes Desktop runs this with HOME=~/.hermes/profiles/.../home
# which would otherwise spawn a blank sandbox profile instead of the 1.9GB logged-in one.
FRANK_HOME="${FRANK_HOME:-/Users/franklawrencejr.}"
PROFILE_DIR="${CHROME_USER_DATA_DIR:-$FRANK_HOME/.gemini/antigravity-browser-profile}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
fi
if [[ ! -x "$CHROME" ]]; then
  echo "No Chrome or Brave found under /Applications"
  exit 1
fi

wrong_profile_on_port() {
  curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1 || return 1
  ps -ax -o command= 2>/dev/null | rg "remote-debugging-port=${PORT}" | rg -q "profiles/.+/home/.gemini|chrome-debug|scoped_dir"
}

if curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  ua="$(curl -sf "http://127.0.0.1:${PORT}/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin).get('User-Agent',''))" 2>/dev/null || true)"
  if [[ "$ua" == *HeadlessChrome* ]] || wrong_profile_on_port; then
    echo "Port ${PORT} has HeadlessChrome or a Hermes sandbox profile — restarting with ${PROFILE_DIR}"
    pkill -f "remote-debugging-port=${PORT}" 2>/dev/null || true
    sleep 2
  else
    echo "CDP already listening on http://127.0.0.1:${PORT} (headed, correct profile)."
    echo "Profile: ${PROFILE_DIR}"
    ps -ax -o command= 2>/dev/null | rg "remote-debugging-port=${PORT}" | head -1
    exit 0
  fi
fi

mkdir -p "$PROFILE_DIR"
echo "Starting headed Chrome with CDP on port ${PORT}"
echo "Profile: ${PROFILE_DIR}"
echo "Antigravity MCP (~/.gemini/config/mcp_config.json) and Hermes browser.cdp_url can both use this."

# Bind IPv4 so Hermes (browser.cdp_url http://127.0.0.1:9222) and MCP tools connect.
exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --use-mock-keychain \
  --disable-fre \
  --no-default-browser-check \
  --no-first-run

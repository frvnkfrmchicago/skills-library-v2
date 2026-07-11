#!/usr/bin/env bash
# Launch YOUR main Chrome with CDP on 9222 (same logins as daily Chrome).
# Hermes browser.cdp_url and Antigravity MCP attach here — no side profiles.
#
# Rule: only ONE Chrome can use a profile. Quit all Chrome first, then run this.
set -euo pipefail

PORT="${CHROME_CDP_PORT:-9222}"
# Default = real Chrome profile (GrazzHopper, Google, Threads cookies, etc.)
PROFILE_DIR="${CHROME_USER_DATA_DIR:-$HOME/Library/Application Support/Google/Chrome}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
fi
if [[ ! -x "$CHROME" ]]; then
  echo "No Chrome or Brave found under /Applications"
  exit 1
fi

is_debug_chrome() {
  ps -ax -o command= 2>/dev/null | rg -q "remote-debugging-port=${PORT}" || return 1
}

wrong_profile_on_port() {
  curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1 || return 1
  ps -ax -o command= 2>/dev/null | rg "remote-debugging-port=${PORT}" | rg -q "chrome-debug|antigravity-browser-profile|scoped_dir" 
}

plain_chrome_running() {
  ps -ax -o command= 2>/dev/null | rg -q "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome$" || \
  ps -ax -o command= 2>/dev/null | rg -q "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome " | rg -vq "remote-debugging-port"
}

echo "Target profile: ${PROFILE_DIR}"
echo "CDP port: ${PORT}"

if wrong_profile_on_port; then
  echo ""
  echo "Port ${PORT} is a SIDE profile (debug/antigravity temp). Stopping it."
  pkill -f "remote-debugging-port=${PORT}" 2>/dev/null || true
  sleep 2
fi

if plain_chrome_running && ! is_debug_chrome; then
  echo ""
  echo "Your normal Chrome is open WITHOUT remote debugging."
  echo "Hermes cannot attach to it until you restart Chrome through this script."
  echo ""
  echo "Do this:"
  echo "  1. Save tabs"
  echo "  2. Quit Chrome completely (Cmd+Q — not just close windows)"
  echo "  3. Re-run: $0"
  echo ""
  if [[ "${CHROME_FORCE_QUIT:-}" != "1" ]]; then
    exit 2
  fi
  echo "CHROME_FORCE_QUIT=1 — quitting Chrome..."
  osascript -e 'quit app "Google Chrome"' 2>/dev/null || true
  sleep 3
  pkill -x "Google Chrome" 2>/dev/null || true
  sleep 2
fi

if curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  ua="$(curl -sf "http://127.0.0.1:${PORT}/json/version" | python3 -c "import sys,json; print(json.load(sys.stdin).get('User-Agent',''))" 2>/dev/null || true)"
  echo "CDP already up on http://127.0.0.1:${PORT}"
  echo "User-Agent: ${ua}"
  ps -ax -o command= 2>/dev/null | rg "remote-debugging-port=${PORT}" | head -1
  exit 0
fi

echo "Starting Chrome (main profile + CDP)..."
exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check

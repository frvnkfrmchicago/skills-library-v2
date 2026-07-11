#!/usr/bin/env bash
# Hermes-owned Chrome — separate from Frank's daily browser. Log in once here (Threads, etc.).
set -euo pipefail

PORT="${CHROME_CDP_PORT:-9222}"
PROFILE_DIR="${CHROME_USER_DATA_DIR:-$HOME/.hermes/chrome-agent}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome not found"
  exit 1
fi

mkdir -p "$PROFILE_DIR"

if curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "CDP already up: http://127.0.0.1:${PORT}"
  ps -ax -o command= 2>/dev/null | rg "remote-debugging-port=${PORT}" | head -1 || true
  exit 0
fi

echo "Hermes Chrome profile: ${PROFILE_DIR}"
echo "This is NOT your daily Chrome — safe to leave open alongside your normal browser."
exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check

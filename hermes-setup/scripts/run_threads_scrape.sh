#!/usr/bin/env bash
# Always run threads_scrape.py with the Hermes venv (Playwright installed there).
set -euo pipefail

HERMES_PYTHON="${HERMES_PYTHON:-$HOME/.hermes/hermes-agent/venv/bin/python}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRAPER="${SCRIPT_DIR}/threads_scrape.py"

if [[ ! -x "$HERMES_PYTHON" ]]; then
  echo "Hermes venv Python not found: $HERMES_PYTHON" >&2
  exit 1
fi

if ! "$HERMES_PYTHON" -c "import playwright" 2>/dev/null; then
  echo "Installing Playwright into Hermes venv..." >&2
  "$HERMES_PYTHON" -m pip install playwright
  "$HERMES_PYTHON" -m playwright install chromium
fi

exec "$HERMES_PYTHON" "$SCRAPER" "$@"

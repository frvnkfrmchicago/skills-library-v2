#!/usr/bin/env bash
# Load the newest desktop UI from ~/.hermes/hermes-agent without waiting for a full Hermes.app repack.
set -euo pipefail

DIST="${HOME}/.hermes/hermes-agent/apps/desktop/dist"
APP="/Applications/Hermes.app/Contents/MacOS/Hermes"

if [[ ! -d "$DIST" ]]; then
  echo "Missing dist. Run: cd ~/.hermes/hermes-agent/apps/desktop && npm run build"
  exit 1
fi

if [[ ! -x "$APP" ]]; then
  echo "Hermes.app not found at /Applications/Hermes.app"
  exit 1
fi

export HERMES_DESKTOP_WEB_DIST="$DIST"
exec "$APP" "$@"

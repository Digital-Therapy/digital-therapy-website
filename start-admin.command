#!/bin/bash
# ────────────────────────────────────────────────────────────────────────────
# Digital Therapy — launch the Vendor Admin console.
#
# Double-click this file (in Finder) to start the admin and open it in your
# browser. Requires Tailscale to be running, since the vendor database lives on
# the private network. Keep the Terminal window open while you use the admin;
# close it (or press Ctrl-C) to stop.
# ────────────────────────────────────────────────────────────────────────────

# Make sure common Node install locations are on PATH (Finder launches don't
# always inherit your full shell PATH).
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.volta/bin:$PATH"

PROJECT="/Users/karina/DT MAN SITE/digital-therapy-website"
cd "$PROJECT" || { echo "Project folder not found: $PROJECT"; exit 1; }

echo "============================================"
echo "   Digital Therapy — Vendor Admin"
echo "============================================"
echo

# Pre-flight: is the vendor database reachable? (needs Tailscale up)
DBHOSTPORT=$(grep -E '^PORTAL_DATABASE_URL' .env 2>/dev/null | sed -E 's|.*@([^/]+)/.*|\1|')
if [ -n "$DBHOSTPORT" ]; then
  HOST="${DBHOSTPORT%%:*}"; PORT="${DBHOSTPORT##*:}"
  if ! nc -z -G 4 "$HOST" "$PORT" >/dev/null 2>&1; then
    echo "⚠️  Can't reach the vendor database ($DBHOSTPORT)."
    echo "    Make sure Tailscale is running, then re-run this."
    echo
  else
    echo "✅ Vendor database reachable."
  fi
fi

echo "Starting the admin server…"
LOG="$(mktemp)"
npm run dev >"$LOG" 2>&1 &
SERVER_PID=$!

# Wait for the server to report its URL, then open the admin page.
URL=""
for _ in $(seq 1 60); do
  URL=$(grep -oE 'http://localhost:[0-9]+' "$LOG" | head -1)
  [ -n "$URL" ] && break
  sleep 1
done

if [ -n "$URL" ]; then
  echo "✅ Ready. Opening ${URL}/admin/vendors"
  open "${URL}/admin/vendors"
else
  echo "❌ The server didn't start in time. Recent output:"
  tail -n 20 "$LOG"
fi

echo
echo "Leave this window open while you work. Close it (or Ctrl-C) to stop the admin."
wait "$SERVER_PID"

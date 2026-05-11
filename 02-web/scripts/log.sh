#!/usr/bin/env bash
# Usage:
#   log.sh "work message"           — log to today's date
#   log.sh "work message" 2026-04-25 — log to a specific date
#   LOG_DATE=2026-04-25 log.sh "msg" — same via env var
#
# Required env vars (or set defaults below):
#   WORKLOG_URL   — e.g. https://worklog.looptw.com
#   WORKLOG_TOKEN — LOG_API_KEY value

WORKLOG_URL="${WORKLOG_URL:-https://worklog.looptw.com}"
WORKLOG_TOKEN="${WORKLOG_TOKEN:-}"

if [[ -z "$1" ]]; then
  echo "Usage: log.sh <message> [date]" >&2
  exit 1
fi

if [[ -z "$WORKLOG_TOKEN" ]]; then
  echo "Error: WORKLOG_TOKEN is not set" >&2
  exit 1
fi

CONTENT="$1"
DATE="${2:-${LOG_DATE:-$(date +%Y-%m-%d)}}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${WORKLOG_URL}/api/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WORKLOG_TOKEN}" \
  -d "{\"content\": $(echo "$CONTENT" | jq -Rs .), \"date\": \"${DATE}\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [[ "$HTTP_CODE" == "201" ]]; then
  ID=$(echo "$BODY" | jq -r '.id // "unknown"')
  echo "✓ Logged [${DATE}] id=${ID}"
else
  echo "✗ Failed (HTTP ${HTTP_CODE}): $BODY" >&2
  exit 1
fi

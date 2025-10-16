#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" ]]; then
  cat <<'USAGE' >&2
Usage: scripts/verify-revalidation.sh <slug> [additional-path...]

Environment variables:
  REVALIDATE_URL   Full URL to the secured revalidation endpoint.
                   Defaults to http://localhost:3000/api/revalidate
  REVALIDATE_TOKEN Bearer token that authenticates as an administrator (required).
  TARGET_BASE_URL  Origin to fetch for cache/CDN inspection.
                   Defaults to http://localhost:3000

The script triggers a tagged revalidation for the provided blog slug, polls the
fresh HTML, and prints response timings plus key caching headers for review.
USAGE
  exit 1
fi

slug="$1"
shift

readonly REVALIDATE_URL="${REVALIDATE_URL:-http://localhost:3000/api/revalidate}"
readonly TARGET_BASE_URL="${TARGET_BASE_URL:-http://localhost:3000}"
readonly REVALIDATE_TOKEN="${REVALIDATE_TOKEN:-}"

if [[ -z "$REVALIDATE_TOKEN" ]]; then
  echo "REVALIDATE_TOKEN must be set" >&2
  exit 1
fi

slug_payload=$(printf '%s' "$slug" | tr '[:upper:]' '[:lower:]')

paths_fragment=""
if (( "$#" > 0 )); then
  sanitized_paths=()
  for extra_path in "$@"; do
    clean_path=$(printf '%s' "$extra_path" | tr -d '"')
    sanitized_paths+=("$clean_path")
  done

  paths_fragment=',"paths":['
  for idx in "${!sanitized_paths[@]}"; do
    if (( idx > 0 )); then
      paths_fragment+=','
    fi
    paths_fragment+="\"${sanitized_paths[idx]}\""
  done
  paths_fragment+=']'
fi

payload=$(printf '{"slugs":["%s"]%s}' "$slug_payload" "$paths_fragment")

trigger_tmp=$(mktemp)
headers_tmp=$(mktemp)
body_tmp=$(mktemp)
trap 'rm -f "$trigger_tmp" "$headers_tmp" "$body_tmp"' EXIT

printf 'Triggering revalidation for %s\n' "$slug_payload"
trigger_meta=$(curl \
  -sS \
  -o "$trigger_tmp" \
  -w '%{http_code} %{time_total}' \
  -X POST "$REVALIDATE_URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $REVALIDATE_TOKEN" \
  -d "$payload")
trigger_status=${trigger_meta%% *}
trigger_time=${trigger_meta##* }

if [[ "$trigger_status" != "200" ]]; then
  echo "Revalidation request failed; status: $trigger_status" >&2
  cat "$trigger_tmp" >&2
  exit 1
fi

ack_epoch_ms=$(date +%s%3N)
printf 'Revalidation acknowledged in %ss\n' "$trigger_time"
cat "$trigger_tmp"
printf '\n'

sleep 1

blog_url="$TARGET_BASE_URL/blog/$slug_payload"
fetch_meta=$(curl \
  -sS \
  -o "$body_tmp" \
  -D "$headers_tmp" \
  -w '%{http_code} %{time_total}' \
  -H 'Accept-Encoding: br, gzip' \
  "$blog_url")
fetch_status=${fetch_meta%% *}
fetch_time=${fetch_meta##* }

first_fetch_ms=$(date +%s%3N)
rebuild_window_ms=$((first_fetch_ms - ack_epoch_ms))
elapsed_seconds=$(awk -v ms="$rebuild_window_ms" 'BEGIN { printf "%.3f", ms/1000 }')

printf 'Fetched %s with status %s in %ss\n' "$blog_url" "$fetch_status" "$fetch_time"
printf 'Elapsed time between trigger and first fetch: %ss\n' "$elapsed_seconds"
printf 'Key response headers:\n'
grep -iE '^(cache-control|content-encoding|x-nextjs-cache|age|etag):' "$headers_tmp" || true
printf '\n'

echo 'Fetching cached response to confirm HIT...'
fetch_meta_cached=$(curl \
  -sS \
  -o /dev/null \
  -D "$headers_tmp" \
  -w '%{http_code} %{time_total}' \
  -H 'Accept-Encoding: br, gzip' \
  "$blog_url")
fetch_status_2=${fetch_meta_cached%% *}
fetch_time_2=${fetch_meta_cached##* }

printf 'Second fetch status %s in %ss\n' "$fetch_status_2" "$fetch_time_2"
grep -iE '^(cache-control|content-encoding|x-nextjs-cache|age):' "$headers_tmp" || true

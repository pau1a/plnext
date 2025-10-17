#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
LOG_DIR="$REPO_ROOT/.ci-logs/$TIMESTAMP"
mkdir -p "$LOG_DIR"

run_step() {
  local label="$1"
  shift
  local log_file="$LOG_DIR/${label}.log"

  echo "[ci] Running $label..."
  if "$@" >"$log_file" 2>&1; then
    echo "[ci] Completed $label (log: $log_file)"
  else
    local status=$?
    echo "[ci] FAILURE in $label (see $log_file)" >&2
    exit $status
  fi
}

run_step "npm-ci" npm ci
run_step "lint" npm run lint
run_step "typecheck" npm run typecheck
run_step "security-audit" npm run security:audit
run_step "test" npm run test

echo "[ci] All tasks completed successfully. Logs stored in $LOG_DIR"

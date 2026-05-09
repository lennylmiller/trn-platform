#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PNPM="${PNPM:-pnpm}"
SKIP_BUILD=0
STOP_ONLY=0
STARTED_PIDS=()
CLEANED_UP=0

usage() {
  cat <<'USAGE'
Usage: pnpm dev:workbench [-- --no-build|--stop-only]

Stops stale TRN Platform dev services, builds the required packages, then starts:
  - pnpm run dev
  - pnpm --filter @trn-platform/qc-training dev

Options:
  --no-build   Stop stale services and start dev servers without rebuilding.
  --stop-only  Stop stale services and exit.
  -h, --help   Show this help.
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --)
      ;;
    --no-build)
      SKIP_BUILD=1
      ;;
    --stop-only)
      STOP_ONLY=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

kill_pids() {
  local label="$1"
  shift
  local pids=("$@")

  if [ "${#pids[@]}" -eq 0 ]; then
    return 0
  fi

  log "Stopping $label: ${pids[*]}"
  kill "${pids[@]}" 2>/dev/null || true
  sleep 2

  local still_running=()
  local pid
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      still_running+=("$pid")
    fi
  done

  if [ "${#still_running[@]}" -gt 0 ]; then
    log "Force stopping $label: ${still_running[*]}"
    kill -9 "${still_running[@]}" 2>/dev/null || true
  fi
}

matching_pids() {
  local pattern="$1"

  if ! command -v pgrep >/dev/null 2>&1; then
    return 0
  fi

  pgrep -f "$pattern" 2>/dev/null | while read -r pid; do
    [ "$pid" != "$$" ] || continue
    [ "$pid" != "${PPID:-}" ] || continue
    printf '%s\n' "$pid"
  done
}

port_pids() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:$port" 2>/dev/null || true
    return 0
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser "${port}/tcp" 2>/dev/null | tr ' ' '\n' | sed '/^$/d' || true
    return 0
  fi
}

stop_services() {
  log "Stopping stale TRN Platform dev services"

  local patterns=(
    "node --watch server-dev.cjs"
    "server-dev.cjs"
    "storybook dev -p 6006"
    "@trn-platform/qc-training dev"
    "apps/qc-training/node_modules/.bin/vite"
    "vite --host 0.0.0.0"
  )

  local pattern
  for pattern in "${patterns[@]}"; do
    mapfile -t pids < <(matching_pids "$pattern")
    kill_pids "processes matching '$pattern'" "${pids[@]}"
  done

  local ports=(3001 5173 5174 6006)
  local port
  for port in "${ports[@]}"; do
    mapfile -t pids < <(port_pids "$port")
    kill_pids "processes on port $port" "${pids[@]}"
  done
}

run_builds() {
  log "Building chat server"
  "$PNPM" --filter @trn-platform/chat-server build

  log "Building courses server"
  "$PNPM" --filter @trn-platform/courses-server build

  log "Building QC Training app"
  "$PNPM" --filter @trn-platform/qc-training build

  log "Building workspace"
  "$PNPM" build
}

start_services() {
  log "Starting repo dev services"
  "$PNPM" run dev &
  STARTED_PIDS+=("$!")

  log "Starting QC Training app"
  "$PNPM" --filter @trn-platform/qc-training dev &
  STARTED_PIDS+=("$!")

  cleanup() {
    if [ "$CLEANED_UP" -eq 1 ]; then
      return 0
    fi
    CLEANED_UP=1

    if [ "${#STARTED_PIDS[@]}" -eq 0 ]; then
      return 0
    fi

    log "Shutting down started services"
    kill "${STARTED_PIDS[@]}" 2>/dev/null || true
    wait "${STARTED_PIDS[@]}" 2>/dev/null || true
  }
  trap cleanup INT TERM EXIT

  log "Ready when the servers report their URLs"
  wait -n "${STARTED_PIDS[@]}"
}

stop_services

if [ "$STOP_ONLY" -eq 1 ]; then
  log "Stopped services"
  exit 0
fi

if [ "$SKIP_BUILD" -eq 0 ]; then
  run_builds
else
  log "Skipping builds"
fi

start_services
